# 文本导向的浏览器起始页插件

一个极简设计、专注于文本呈现的浏览器起始页扩展。确保注意力集中在搜索与导航。

## ✨ 特性

* 内置 JetBrains Mono；Sarasa Term SC 作为可选系统回退字体。
* 保留问候语、时间、天气、搜索与导航核心功能，并提供适量交互动效。
* 支持导航分组编辑与拖拽排序、自定义搜索引擎、配置导入导出。
* 支持深色模式、中英文切换、键盘操作和减少动画偏好。
* 纯前端架构，API Key、位置信息和自定义链接只保存在浏览器本地；配置导出默认不包含 API Key。

## 📸 预览

#### 自定义用户名
<img width="2559" height="1527" alt="ScreenShot_2026-05-10_212938_559" src="https://github.com/user-attachments/assets/5a5b8b7b-8421-46bd-9d70-ef28ee92627b" />

#### 浅色模式
<img width="2559" height="1527" alt="ScreenShot_2026-05-10_213229_439" src="https://github.com/user-attachments/assets/62dcc647-7bed-4f75-8e8e-ff45e7ddee0f" />

#### 深色模式
<img width="2559" height="1527" alt="3" src="https://github.com/user-attachments/assets/03dc05b0-9c3d-4e62-a392-495744538cfb" />

#### 设置面板
<img width="2559" height="1527" alt="5" src="https://github.com/user-attachments/assets/49050c8e-beb4-4c83-b305-ada4278e678d" />

---

## 🛠️ 安装指南
#### Chrome / Edge (Chromium 系列)

1. 前往Release下载并解压。

2. 打开浏览器，访问 chrome://extensions/。

3. 开启右上角的 "开发者模式" (Developer mode)。

4. 点击 "加载已解压的扩展程序" (Load unpacked)。

5. 选择包含上述文件的项目文件夹。

6. 打开新标签页，在弹出的提示中选择 "保留更改"。

#### Firefox

1. 访问 about:debugging#/runtime/this-firefox。

2. 点击 "加载临时附加组件..." (Load Temporary Add-on...)。

3. 选择项目文件夹中的 manifest.json 文件。

4. 注：Firefox 的临时加载在浏览器重启后会失效。

## ⚙️ 配置说明

#### 天气服务：

1. 访问 <a href="https://dev.qweather.com" target="_blank">和风天气开发者平台</a> 免费申请 API Key。

2. 点击起始页右下角的“齿轮”图标，进入设置页面填入 API Key。

3. 点击天气区域可手动输入城市名称或使用地理定位；首次使用当前位置时需要授予浏览器定位权限。

#### 数据备份

设置页支持导出和导入 JSON 配置。导入会覆盖现有页面配置，导出文件默认不包含天气 API Key。

#### 单文件版

Release 同时提供 `startpage.html`。它由 `index.html`、`style.css` 和 `script.js` 自动构建，字体及 Sortable 通过 CDN 加载，因此需要网络连接。开发时可运行：

```bash
bash build.sh
```

## ✅ 手动检查

发布前建议检查：首次访问、深色模式、中英文切换、搜索及 IP 地址跳转、天气与定位、分组和引擎排序、配置导入导出、Chrome/Edge/Firefox 扩展加载和单文件版本。

## 友情链接

* <a href="https://linux.do/" target="_blank">LINUX DO</a>
