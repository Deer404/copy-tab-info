# Copy Tab Info Chrome 扩展

## 扩展地址
审核中，等待上架。

这是一个使用Plasmo框架开发的Chrome浏览器扩展。它允许用户快速复制当前标签页的标题和URL。

## 主要功能

- 一键复制当前标签页的标题和URL
- 支持自定义快捷键设置

## 技术栈

- [Plasmo](https://docs.plasmo.com/) - Chrome扩展开发框架

## 安装

1. 克隆此仓库到本地
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建扩展
4. 在Chrome浏览器中打开 `chrome://extensions/`
5. 启用"开发者模式"
6. 点击"加载已解压的扩展程序"，选择项目的 `build/chrome-mv3-prod` 目录

## 使用方法

1. 点击扩展图标复制当前标签页信息
2. 使用设置的快捷键复制标签页信息

## 自定义快捷键

1. 在Chrome浏览器中打开 `chrome://extensions/shortcuts`
2. 找到本扩展，设置您喜欢的快捷键

## 贡献

欢迎提交问题和拉取请求。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)