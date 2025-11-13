---
title: 如何更好的生成fuwari文章
published: 2025-11-13T22:08:08
description: 用obsidian模板在编辑器内不用pnpm生成新文章
image: ../../assets/images/obsidian-template.png
tags:
  - fuwari
  - obsidian
category: fuwari
draft: false
lang: ""
---
## 模板创建
在public文件夹下创建template.md  
插入以下markdown  

```markdown title="template.md"
--- 
title:
published: {{date}}T{{time}}
description: 
image: ""
tags: []
category: ""
draft: true
lang: ""
---
```

设置/模板 中配置路径为`public`，时间格式为`HH:mm:ss`  

## 模板使用
新建一个文章，菜单中选择插入模板  
![](../../assets/images/obsidian-template-1.png)  
