---
title: 保姆级git使用教程 - 安卓版
published: 2025-11-26T22:15:21
description: 竟然有入不会用git
image: ../../assets/images/android-git.png
tags:
  - git
category: git
draft: false
lang: ""
---
# 生成ssh密钥
## 使用termux
`ssh-keygen -r rsa` 然后一路回车就能在 `～/.ssh` 里生成 `id_rsa` 和 `id_rsa.pub` 密钥对，其中 .pub 后缀的是公钥  
## 使用MGit
>懒得写  

# 上传公钥  
把刚才的公钥cat出来，整段复制  
上传到github
https://github.com/settings/ssh/new  

# 管理仓库  
>这里使用 [puppy git](https://github.com/catpuppyapp/PuppyGit)  

## 设置密钥

打开puppy git，点右上角长的像钥匙的图标，＋号添加密钥  
凭据名：自己起  
用户名/私钥：cat刚才的私钥，整段复制  
密码不用填

## clone
puppy git主页右上角＋克隆仓库  

## push  

主页上面点击人头，填写名字邮箱
左上角三横杠列表选择修改列表  
右上角列表里选择提交所有（git commit）  
然后推送（git push）