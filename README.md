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

点击右下角齿轮进入设置：

- **天气**：在[和风天气](https://dev.qweather.com/)申请 API Key，并从[控制台](https://console.qweather.com/setting)复制 API Host，填入天气设置后选择城市或使用当前位置。当前使用 v7 接口，可用性以账号权限为准。
- **搜索与分组**：支持拖拽排序，也可使用 `Alt + ↑ / ↓`。自定义搜索引擎的网址需包含 `{query}`。
- **问候语**：随本地日期和时段更新，同一时段内保持不变。
- **检查更新**：点击左侧文字手动检查；使用页面时，距上次成功检查超过 24 小时会自动检查。发现新版后，点击右侧提示前往发布页下载，再手动替换文件或更新扩展目录。
- **配置备份**：底部按钮可导出、导入配置。默认不包含 API Key；若勾选包含，请妥善保管备份文件。
- **单文件版**：从 [Release](https://github.com/kabuda2077/StartPage/releases/latest) 下载 `StartPage.html`，双击即可使用；天气、搜索和更新检查需要联网。

更新前建议导出配置，并保留原文件路径或扩展加载目录。若页面提示无法自动保存，请在关闭前导出备份。

## 开发与验证

普通使用无需开发工具。开发与 CI 统一使用 Node.js 22 和 Playwright 固定版本的 Chromium：

```bash
npm ci --include=dev
npx playwright install --only-shell chromium
npm test           # 构建、单元测试和关键浏览器冒烟检查
npm run test:full  # 按需运行完整界面和动画回归
npm run build      # 生成 StartPage.html 和 dist/extension
```

CI 只构建和测试一次，发布复用该次验证的产物。主分支版本号提升时自动发布，也可在 Actions → CI 手动勾选 `release`；`full_tests` 用于额外的详细检查。上传失败可只重跑失败的发布作业，验证产物保留 7 天。

纯前端项目，测试和发布工具不会包含在安装包中。

## 友情链接

* <a href="https://linux.do/" target="_blank">LINUX DO</a>
