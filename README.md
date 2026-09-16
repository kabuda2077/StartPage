# 文本导向的浏览器起始页插件

一个极简设计、专注于文本呈现的浏览器起始页扩展。确保注意力集中在搜索与导航。

## ✨ 特性

* 内置 JetBrains Mono；Sarasa Term SC 作为可选系统回退字体。
* 保留问候语、天气、搜索与导航核心功能，并提供适量交互动效。
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

2. 点击起始页右下角的“齿轮”图标，再进入“天气设置”填写 API Key。新账号同时在 [控制台设置](https://console.qweather.com/setting) 查询专属 API Host，填写形如 `xxxx.xy.qweatherapi.com` 的域名。填写后通过 HTTPS 和 `X-QW-Api-Key` 请求头访问该域名；未填写时保留旧公共域名兼容路径。

3. 天气设置中的“位置”可展开城市查询和定位表单；也可直接点击首页天气区域修改位置。首次使用当前位置时需要授予浏览器定位权限。当前使用城市查询及 v7 天气接口，官方已公告 v7 将弃用；真实账号的接口权限及后续迁移需以控制台为准。

API Host 是账号专属的请求域名，API Key 是请求凭据。这里“可选”仅表示插件保留旧公共域名的兼容方式，不代表新账号可以省略 Host。官方说明旧公共域名从 2026 年起逐步停用，建议从控制台复制自己的 Host。填写 Host 不会自动把 v7 升级为 v1；当前尚未迁移到新版接口，所查 v7 页面只说明将弃用，没有给出统一停用日期。参考：[API Host](https://dev.qweather.com/en/docs/configuration/api-host/)、[v7 当前天气](https://dev.qweather.com/en/docs/api/weather/weather-now-webapi-v7/)。

#### 数据备份

设置主页保留分组、搜索引擎入口、天气入口、用户名和配置备份。天气 Key、API Host 和说明收在二级页面，可通过标题左侧返回。

设置页底部的“配置备份”支持导出和导入 JSON 配置。导出包含当前生效的分组、链接、搜索引擎及其顺序、当前搜索引擎、主题、语言、用户名和天气位置，包括未修改过的默认配置。

导出时可勾选“包含天气 API Key”，默认不勾选；勾选后文件中会保存明文 Key。导入经确认后覆盖文件中包含的配置项，文件不含 Key 时保留当前 Key。天气缓存和浏览器定位授权不参与备份。

导出使用结构化 v2 格式，兼容导入旧 v1 备份；API Host 会一并备份。导入不刷新页面，因此临时存储模式也能立即使用导入的配置。文件上限 64 MiB，最多 100 个分组、2,000 个链接和 100 个搜索引擎。导出和导入共用内容校验与字节上限，文件容量覆盖这些字段和数量上限所允许的完整配置。

#### 搜索与排序

已知搜索引擎可输入其域名选择预设；其他引擎请填写包含 `{query}` 的完整搜索模板，例如 `https://example.com/search?q={query}`。本地服务与裸 IP 默认使用 HTTP，常规域名默认使用 HTTPS，显式协议保持不变。

分组、链接和引擎均可拖动排序，也可聚焦排序图标后按 `Alt + ↑ / ↓`。通常同一时间只允许一个页面编辑设置，其他标签页仍可正常使用并同步已保存配置。不支持浏览器编辑锁的环境中，如检测到其他页面修改，会暂停本页保存，提示关闭并重新打开设置；不自动合并配置。

#### 单文件版

Release 同时提供 `StartPage.html`（注意文件名大小写）。它由页面源码和本地资源自动构建，字体、预设搜索引擎图标及 Sortable 均嵌入文件，可移到任意目录后直接双击打开，页面初始化不依赖 CDN。天气查询、在线搜索及打开网站仍需联网。开发时可运行：

```bash
node tools/build.mjs
```

浏览器允许本地存储时，配置正常持久保存；若文件预览环境或浏览器策略禁止存储，页面会使用本次打开期间的临时配置，并在备份按钮上方显示“当前无法自动保存，关闭前请导出配置”。临时配置不会在重新打开后保留，可通过导出备份。影响编辑的冲突提示仍显示在设置顶部。

## 开发与验证

普通使用不需要 Node.js 或测试工具。开发使用 Node.js 22+，日常只需两个命令：

```bash
npm run build  # 同时生成 StartPage.html 和 dist/extension
npm test       # 运行关键回归检查
```

构建不需要安装依赖。首次运行测试前执行 `npm ci --include=dev` 和 `npx playwright install chromium`。测试用于防止配置丢失、排序错项、天气竞态和单文件启动失败，不会进入扩展包，也不会在新标签页中运行。

源码结构与测试方式见 [开发说明](docs/development.md)。

## ✅ 手动检查

发布前建议检查：首次访问、深色模式、中英文切换、搜索及 IP 地址跳转、天气与定位、分组和引擎排序、配置导入导出、Chrome/Edge/Firefox 扩展加载和单文件版本。

## 友情链接

* <a href="https://linux.do/" target="_blank">LINUX DO</a>
