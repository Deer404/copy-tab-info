# Copy Tab Info Chrome 扩展

## 扩展地址
[Copy Tab Info - Chrome 应用商店](https://chromewebstore.google.com/detail/copy-tab-info/dhdahkkjopabepglkofakameobkjngdn?authuser=0&hl=zh-CN)

这是一个基于chrome-mv3的Chrome浏览器扩展。它允许用户快速复制当前标签页的标题和URL。

- 对于其他浏览器，暂时未测试，理论上打包出`firefox-mv2`的版本，也可以支持firefox。

## 主要功能

- 一键复制当前标签页的完整信息（标题和URL）
- 支持Markdown格式复制（将标题作为链接文本，URL作为链接地址）
- 自定义复制选项，允许用户选择需要复制的信息（如标题、主机名、路径等）
- 实时预览自定义复制内容
- 支持自定义快捷键设置

## 技术栈

- [Plasmo](https://docs.plasmo.com/) - Chrome扩展开发框架
- React

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


## 已知问题

- chrome内置的页面，例如`chrome://extensions/shortcuts`和[chromewebstore](chromewebstore.google.com)都是不支持快捷键的，只能手动点击复制。这是chrome的安全策略，其他网站不受此影响，所以该问题会一直存在。

## 贡献

欢迎提交问题和拉取请求。

## 许可证

MIT License

Copyright (c) [2024] [Deer404]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.