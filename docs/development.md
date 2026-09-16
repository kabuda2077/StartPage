# 开发说明

原生 JavaScript 项目，无框架和运行时包管理依赖。天气暂时继续使用 v7，不迁移 Current Weather v1。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| `config.js` | 配置校验、备份兼容、本地存储及早期主题初始化 |
| `ui-core.js` | 文案、图标、搜索引擎预设、主题 |
| `weather-client.js` | v7 天气与城市查询、超时、取消请求、缓存 |
| `script.js` | 页面与设置交互、搜索、弹窗、欢迎流程 |
| `index.html` / `style.css` | 页面结构和样式 |
| `tools/build.mjs` | 单文件生成及扩展运行文件打包 |

脚本顺序由 `index.html` 声明。构建脚本读取同一列表，内嵌字体、图标和 Sortable；不维护第二份页面源码。

## 保存规则

设置编辑使用浏览器 Web Locks，同一来源下通常只允许一个页面编辑。关闭设置或关闭页面时释放锁。其他标签页通过 storage 事件刷新已保存配置。

没有 Web Locks 时仍可使用设置，但写入前比较原始保存值；外部配置变化会暂停编辑并提示重新打开。这里不提供自动字段合并、排序合并或跨设备同步。文字编辑合并 180ms 内的保存，结构修改立即保存。

浏览器禁止存储时使用本次页面的内存，设置中显示提示。损坏的分组或引擎数据保存在 `.recovery` 键中。旧 v1 备份继续可导入，导出使用结构化 v2；API Key 默认不导出。

## 构建和检查

使用 Node.js 22+：

- `npm run build`：生成 `StartPage.html` 和 `dist/extension`，无需安装开发依赖。
- `npm test`：先构建，再运行配置与天气单元测试及关键浏览器流程。

首次测试：`npm ci --include=dev`、`npx playwright install chromium`。Linux CI 使用 `npx playwright install --with-deps chromium`。Windows 有本机 Chrome 时直接使用它。

保留的测试聚焦实际故障：多标签页覆盖、排序后编辑/删除、备份往返、天气旧请求、单文件离线启动。不对每个静态文案或样式单独写测试。测试和开发依赖不进入扩展包。

发布前还需人工验证真实天气账号与定位授权、扩展安装升级及 Firefox。模拟接口测试不能证明账号服务可用。版本号以 `manifest.json` 为准，提交发布前与 `package.json` 保持一致。
