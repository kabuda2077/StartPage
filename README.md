# 文本导向的浏览器起始页插件

一个极简设计、专注于文本呈现的浏览器起始页扩展。确保注意力集中在搜索与导航。

## ✨ 特性

* 采用 JetBrains Mono 与 Sarasa Term SC 字体。
* 仅保留问候语、天气、搜索与导航核心功能，添加适当交互动效。
* 支持导航分组的编辑与拖拽排序，可自由添加和管理自定义搜索引擎（试试把鼠标移到右下角）。
* 支持深色模式一键切换，中英文切换。
* 纯前端架构，API Key、位置信息、自定义链接等个人配置严格保存在浏览器本地。

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

3. 点击天气区域可手动输入城市名称或使用地理定位。

## 友情链接

* <a href="https://linux.do/" target="_blank">LINUX DO</a>
