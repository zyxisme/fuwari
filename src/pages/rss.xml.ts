import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	str.replace("<img *>", "");
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const siteUrl = (context.site ?? "https://fuwari.vercel.app").replace(/\/+$/, "");

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			let html = sanitizeHtml(parser.render(cleanedContent), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			});
			// Rewrite relative image src (e.g. _astro/xxx.webp) to absolute URLs
			html = html.replace(/src="(?!https?:\/\/)([^"]*?)"/g, (_, p) => {
				return `src="${siteUrl}/${p}"`;
			});
			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.slug}/`),
				content: html,
			};
		}),
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
