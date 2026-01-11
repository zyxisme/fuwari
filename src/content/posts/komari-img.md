---
title: komari探针动态图片
published: 2026-01-11T23:41:37
description: 会自己动哦
image: https://stat.monesy.cn/api/mjpeg_live?lang=zh_cn&tz_offset=8
tags:
  - komari
category: komari
draft: false
lang: ""
---
# 先看效果  
![](https://stat.monesy.cn/api/mjpeg_live?lang=zh_cn&tz_offset=8)  
# 实现  
>以一键脚本安装的为实例  

替换komari内核为1.1.4版本  
前往 https://github.com/komari-monitor/komari/actions/runs/19986584712 下载  
替换掉`/opt/komari`中的`komari`文件
添加字体到`/opt/komari/font.tty`  
个人推荐 JetBrains Maple Mono  
https://github.com/SpaceTimee/Fusion-JetBrainsMapleMono  
重启komari  
`systemctl restart komari`

# 使用  
`https://<你的探针地址>/api/mjpeg_live?lang=zh_cn&tz_offset=8`  
