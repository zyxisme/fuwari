import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";
import { getImage } from "astro:assets";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	str.replace("<img *>", "");
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

// Glob all images under src/assets so we can resolve them at build time
const imageFiles = import.meta.glob<{ default: ImageMetadata }>(
	"../assets/**/*.{jpeg,jpg,png,gif,webp,avif,svg}",
	{ eager: true },
);

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const siteUrl = String(context.site ?? "https://fuwari.vercel.app").replace(
		/\/+$/,
		"",
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: await Promise.all(
			blog.map(async (post) => {
				const content =
					typeof post.body === "string"
						? post.body
						: String(post.body || "");
				const cleanedContent = stripInvalidXmlChars(content);
				let html = sanitizeHtml(
					parser.render(cleanedContent),
					{
						allowedTags:
							sanitizeHtml.defaults.allowedTags.concat(["img"]),
					},
				);

				// Resolve local images to optimized _astro/ paths via getImage
				const imgRegex = /<img([^>]*?)src="([^"]*?)"([^>]*)>/g;
				const replacements: { original: string; replacement: string }[] =
					[];

				let match: RegExpExecArray | null;
				while ((match = imgRegex.exec(html)) !== null) {
					const [full, pre, src, post_ ] = match;
					if (src.startsWith("http://") || src.startsWith("https://")) {
						continue;
					}

					// Resolve the relative path (e.g. ../../assets/images/xxx.png)
					// by normalizing it from the rss.xml.ts location (src/pages/)
					const normalized = new URL(
						src,
						"file:///src/pages/",
					).pathname.replace(/\\/g, "/");

					// Find matching glob entry
					const globKey = Object.keys(imageFiles).find((key) => {
						const keyNorm = key.replace(/\\/g, "/");
						return keyNorm === normalized || keyNorm.endsWith(normalized);
					});

					if (globKey) {
						const metadata = imageFiles[globKey].default;
						const optimized = await getImage({ src: metadata });
						replacements.push({
							original: full,
							replacement: `<img${pre}src="${siteUrl}${optimized.src}"${post_}>`,
						});
					}
				}

				for (const { original, replacement } of replacements) {
					html = html.replace(original, replacement);
				}

				return {
					title: post.data.title,
					pubDate: post.data.published,
					description: post.data.description || "",
					link: url(`/posts/${post.slug}/`),
					content: html,
				};
			}),
		),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
