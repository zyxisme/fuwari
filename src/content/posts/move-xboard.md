---
title: 迁移Xboard面板
published: 2025-10-12T12:15:34
description: Xboard面板迁移指南：从旧实例平稳过渡到新环境
image: ""
tags:
  - Xboard
category: xboard
draft: false
lang: ""
---
### 1. 数据备份  
首先需要在原Xboard实例上进行完整数据备份：  
```shell
# 进入Xboard容器
docker exec -it xboard bash

# 备份数据库（假设使用MySQL）
mysqldump -u root -p xboard > xboard_backup.sql
```  
### 2. 新环境部署  
在新服务器上部署全新的Xboard实例：  
```shell
# 拉取最新Xboard镜像
docker pull xboard/xboard:latest

# 运行新容器（根据实际配置调整参数）
docker run -d --name xboard \
  -p 80:80 -p 443:443 \
  -v /path/to/config:/etc/xboard \
  -v /path/to/data:/var/lib/xboard \
  xboard/xboard:latest
```  
### 3. 数据恢复  
将备份数据导入新实例：  
```shell
# 将备份文件复制到新容器
docker cp xboard_backup.sql xboard:/tmp/

# 进入新容器执行恢复
docker exec -it xboard bash
mysql -u root -p xboard < /tmp/xboard_backup.sql
```  
### 4. 配置文件迁移  
如果对Xboard有自定义配置，需要迁移配置文件：  
```shell
# 从旧容器复制配置文件
docker cp old_xboard:/etc/xboard/config.yml ./config.yml

# 将配置文件复制到新容器
docker cp config.yml xboard:/etc/xboard/
```  
## 常见问题处理
迁移后可能出现文件权限错误，可通过以下命令修复：
```shell
docker exec xboard chown -R www-data:www-data /var/www/html
```
某些功能可能依赖特定系统组件，确保新环境已安装：
```shell
apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev
```