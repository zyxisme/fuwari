---
title: 如何为fuwari添加讨论页面
published: 2025-11-24T22:15:02
description: 一个基于giscus的自适应讨论区
image: ../../assets/images/discuss-page.png
tags:
  - fuwari
  - giscus
category: fuwari
draft: false
lang: ""
---
在 `stc/components` 下添加一个 `Giscus.astro`，写入以下代码  

``` astro title="src/components/Giscus.astro"
---
interface Props {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
}

const {
  repo,
  repoId,
  category,
  categoryId,
  mapping = 'pathname',
  reactionsEnabled = true,
  emitMetadata = false,
  inputPosition = 'bottom',
  lang = 'zh-CN'
} = Astro.props;
---

<div id="giscus-container"></div>

<script define:vars={{ repo, repoId, category, categoryId, mapping, reactionsEnabled, emitMetadata, inputPosition, lang }}>
  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    // 获取当前主题
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'noborder_dark' : 'light';

    // 创建Giscus脚本
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', reactionsEnabled ? '1' : '0');
    script.setAttribute('data-emit-metadata', emitMetadata ? '1' : '0');
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);
  }

  // 监听主题变化
  function updateGiscusTheme() {
    const giscusFrame = document.querySelector('iframe[src*="giscus"]');
    if (giscusFrame) {
      const isDark = document.documentElement.classList.contains('dark');
      const theme = isDark ? 'noborder_dark' : 'light';

      giscusFrame.contentWindow.postMessage({
        giscus: {
          setConfig: {
            theme: theme
          }
        }
      }, 'https://giscus.app');
    }
  }

  // 监听DOM变化来检测主题切换
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateGiscusTheme();
      }
    });
  });

  // 页面加载时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGiscus);
  } else {
    loadGiscus();
  }

  // 开始观察主题变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
</script>
```  

`src/pages` 下添加 `discuss.astro` 
``` astro title="src/pages/discuss.astro"
---
import Giscus from "@components/misc/Giscus.astro";
import { getEntry, render } from "astro:content";
import Markdown from "@components/misc/Markdown.astro";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import MainGridLayout from "../layouts/MainGridLayout.astro";

const discussPost = await getEntry("spec", "discuss");

if (!discussPost) {
        throw new Error("About page content not found");
}

const { Content } = await render(discussPost);
---
<MainGridLayout title={"讨论"} description={}>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
        <div class="card-base z-10 px-9 py-6 relative w-full ">
            <Markdown class="mt-2">
                                <Giscus repo="xxxx/xxxx" repoId="xxxxx" category="Announcements" categoryId="xxxxx" />
                <Content />
            </Markdown>
        </div>
    </div>
</MainGridLayout>
```