# md2html_enhanced

这是一个用于批量将 Markdown 文件转换为 HTML 的工具项目。它直接使用了 [vscode-markdown-preview-enhanced](https://github.com/shd101wyy/vscode-markdown-preview-enhanced) 插件的核心渲染引擎 (`crossnote`)，因此生成的 HTML 文件能够保持与 VS Code 插件预览完全一致的样式、数学公式渲染 (KaTeX) 和代码高亮效果。

## 项目结构

*   `md/`: 存放源 Markdown 文件 (`.md`)。默认情况下，转换生成的 HTML 文件 (`.html`) 将保存在 `html/` 目录中（可通过命令行参数更改）。
*   `vscode-markdown-preview-enhanced/`: MPE 插件的源码仓库，作为本项目依赖的核心库。
*   `convert_md.js`: Node.js 脚本，用于执行批量转换任务。

## 环境要求

*   Node.js (建议 v14 或更高版本)
*   npm 或 yarn

## 安装与配置

1.  **初始化依赖**

    本项目依赖于 `vscode-markdown-preview-enhanced` 目录下的 `crossnote` 库。请确保该目录存在且已安装依赖。

    ```bash
    cd vscode-markdown-preview-enhanced
    npm install
    # 或者
    yarn install
    cd ..
    ```

2.  **准备 Markdown 文件**

    将你需要转换的 `.md` 文件放入 `md/` 文件夹中。

## 使用方法

在项目根目录下运行转换脚本：

```bash
node convert_md.js
```

脚本会自动扫描 `md/` 目录下的所有 `.md` 文件，并逐一转换为同名的 `.html` 文件，默认输出到 `html/` 目录。

可用命令行参数：

- `-i, --input <dir>` : 输入 Markdown 文件目录（默认: `md`）
- `-o, --output <dir>`: 输出目录（默认: `html`）
- `--offline <true|false>`: 是否内嵌资源（默认: `true`）
- `--runAllCodeChunks <true|false>`: 是否在导出时运行代码块（默认: `false`）
- `-h, --help` : 帮助

例子：

```bash
node convert_md.js -i md -o html --offline true --runAllCodeChunks false
```

## 自定义配置

你可以修改 `convert_md.js` 文件中的 `config` 对象来调整渲染效果，例如更改预览主题或数学公式引擎。

```javascript
// convert_md.js

const notebook = await Notebook.init({
  notebookPath: notebookPath,
  config: {
      // 更改预览主题，例如: 'atom-dark.css', 'github-light.css', 'one-dark.css' 等
      previewTheme: 'github-light.css',
      
      // 数学公式渲染引擎: 'KaTeX' 或 'MathJax'
      mathRenderingOption: 'KaTeX', 
      
      // 其他配置...
  },
});
```

## 特性

*   **完全一致的渲染**: 使用 MPE 原生引擎，保证 HTML 输出与 VS Code 预览无异。
*   **离线支持**: 生成的 HTML 文件内嵌了所有必要的 CSS 和脚本 (通过 `offline: true` 选项)，可以直接在浏览器中打开，无需网络连接。
*   **数学公式**: 支持 KaTeX 和 MathJax (默认配置为 KaTeX)。
*   **代码高亮**: 支持多种编程语言的语法高亮。

## 常见问题

*   **报错 `Cannot find module ... crossnote`**: 请确保你已经正确进入 `vscode-markdown-preview-enhanced` 目录并执行了 `npm install`。
*   **数学公式未显示**: 请检查 `convert_md.js` 中是否启用了 `mathRenderingOption: 'KaTeX'`。
