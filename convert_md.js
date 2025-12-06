const { Notebook } = require('./vscode-markdown-preview-enhanced/node_modules/crossnote');
const path = require('path');
const fs = require('fs');

async function main() {
  const mdDir = path.resolve(__dirname, 'md');
  const files = fs.readdirSync(mdDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No markdown files found in md/ directory.');
    return;
  }

  console.log(`Found ${files.length} markdown files.`);

  // Initialize Notebook
  const notebookPath = __dirname; 
  const notebook = await Notebook.init({
    notebookPath: notebookPath,
    config: {
        previewTheme: 'github-light.css',
        mathRenderingOption: 'KaTeX', // Enable KaTeX
        mathInlineDelimiters: [["$", "$"], ["\\(", "\\)"]],
        mathBlockDelimiters: [["$$", "$$"], ["\\[", "\\]"]],
        // Ensure other settings are defaults or as needed
    },
  });

  for (const file of files) {
    const filePath = path.join(mdDir, file);
    console.log(`Converting ${file}...`);
    
    const engine = notebook.getNoteMarkdownEngine(filePath);
    
    try {
      // htmlExport generates the HTML file in the same directory by default
      // offline: true embeds images and styles
      const dest = await engine.htmlExport({ offline: true, runAllCodeChunks: false });
      console.log(`Generated: ${dest}`);
    } catch (error) {
      console.error(`Failed to convert ${file}:`, error);
    }
  }
  
  console.log('All done.');
}

main().catch(console.error);
