# 文本导向的浏览器起始页插件

一款极简设计、专注于文本呈现的浏览器起始页扩展。确保注意力集中在搜索与导航。

## ✨ 特性

* 采用 JetBrains Mono 与 Sarasa Term SC 字体。
* 仅保留问候语、天气、搜索与导航核心功能，添加适当交互动效。
* 支持导航分组的编辑与拖拽排序，可自由添加和管理自定义搜索引擎（试试把鼠标移到右下角）。
* 支持深色模式一键切换，中英文切换。
* 纯前端架构，API Key、位置信息、自定义链接等个人配置严格保存在浏览器本地（localStorage）。

## 📸 预览

#### 自定义用户名
<img width="2559" height="1527" alt="1" src="https://github.com/user-attachments/assets/ea485eae-cfa8-4cdf-b1b8-34139f9a09c9" />

#### 浅色模式
<img width="2559" height="1527" alt="2" src="https://github.com/user-attachments/assets/9217c36f-d927-4ce0-aa64-09e81a623690" />

#### 深色模式
<img width="2559" height="1527" alt="3" src="https://github.com/user-attachments/assets/03dc05b0-9c3d-4e62-a392-495744538cfb" />

#### 设置面板
<img width="2559" height="1527" alt="5" src="https://github.com/user-attachments/assets/49050c8e-beb4-4c83-b305-ada4278e678d" />

---

## 🛠️ 安装指南
#### Chrome / Edge (Chromium 系列)

1. 项目右上角点击 Code-Download ZIP，下载项目源码并解压。

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

访问 <a href="https://dev.qweather.com" target="_blank">和风天气开发者平台</a> 免费申请 API Key。

点击起始页右下角的“齿轮”图标，进入设置页面填入 API Key。

点击天气区域可手动输入城市名称或使用地理定位。
