// Note: 'crossnote' is a dependency of vscode-markdown-preview-enhanced. We try to require it
// dynamically after parsing CLI args so we can print friendly messages when it's not installed.
const path = require('path');
const fs = require('fs');

// Simple command-line argument parsing
// Supported flags:
//  -i, --input   : input directory containing .md files (default: md)
//  -o, --output  : output directory to write generated HTML files (default: html)
//  --offline     : generate offline HTML with embedded assets (true/false, default: true)
//  --runAllCodeChunks : whether to run code chunks during export (true/false, default: false)
//  -h, --help    : display usage
function parseArgs(argv) {
  const args = { input: 'md', output: 'html', offline: true, runAllCodeChunks: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-i' || a === '--input') {
      args.input = argv[++i];
    } else if (a === '-o' || a === '--output') {
      args.output = argv[++i];
    } else if (a === '--offline') {
      const val = argv[i + 1];
      if (val && !val.startsWith('-')) {
        args.offline = val === 'false' ? false : true; i++;
      } else {
        args.offline = true;
      }
    } else if (a === '--runAllCodeChunks') {
      const val = argv[i + 1];
      if (val && !val.startsWith('-')) {
        args.runAllCodeChunks = val === 'true'; i++;
      } else {
        args.runAllCodeChunks = true;
      }
    } else if (a === '-h' || a === '--help') {
      return { help: true };
    } else {
      // Unknown arg - treat as input path if not set explicitly
      if (!args._unknown) args._unknown = [];
      args._unknown.push(a);
    }
  }
  return args;
}

function showUsage() {
  console.log(`Usage: node convert_md.js [options]\n\nOptions:\n  -i, --input <dir>       Input directory containing markdown files (default: md)\n  -o, --output <dir>      Output directory for generated HTML files (default: html)\n  --offline <true|false>  Embed assets in HTML output (default: true)\n  --runAllCodeChunks <true|false> Run code chunks during export (default: false)\n  -h, --help              Show this help message\n`);
}

async function main() {
  const parsed = parseArgs(process.argv);
  if (parsed.help) {
    showUsage();
    return;
  }
  const mdDir = path.resolve(__dirname, parsed.input || 'md');
  const outDir = path.resolve(__dirname, parsed.output || 'html');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const files = fs.existsSync(mdDir) ? fs.readdirSync(mdDir).filter(file => file.endsWith('.md')) : [];

  if (files.length === 0) {
    console.log('No markdown files found in md/ directory.');
    return;
  }

  console.log(`Found ${files.length} markdown files.`);

  // Try to (dynamically) load Notebook
  let Notebook;
  try {
    Notebook = require('./vscode-markdown-preview-enhanced/node_modules/crossnote').Notebook;
  } catch (err) {
    console.error("Missing dependency: 'crossnote'. Please run 'npm install' in 'vscode-markdown-preview-enhanced' or ensure the package is available.");
    console.error('Original error:', err.message);
    process.exit(1);
  }

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
      const dest = await engine.htmlExport({ offline: parsed.offline, runAllCodeChunks: parsed.runAllCodeChunks });
      // Move the generated file into output folder if it's not already there
      const generatedPath = dest && typeof dest === 'string' ? dest : null;
      if (generatedPath) {
        const base = path.basename(generatedPath);
        const outputPath = path.join(outDir, base);
        // If generatedPath and outputPath are equal, still print
        if (path.resolve(generatedPath) !== path.resolve(outputPath)) {
          try {
            fs.renameSync(generatedPath, outputPath);
            console.log(`Generated: ${outputPath}`);
          } catch (e) {
            // If rename fails (different file systems), fallback to copy
            try {
              fs.copyFileSync(generatedPath, outputPath);
              fs.unlinkSync(generatedPath);
              console.log(`Generated: ${outputPath}`);
            } catch (err) {
              // If copying also fails, still show original path with error
              console.error(`Failed to move generated file to ${outputPath}:`, err);
              console.log(`Generated: ${generatedPath}`);
            }
          }
        } else {
          console.log(`Generated: ${generatedPath}`);
        }
      } else {
        console.log('Generated (unknown destination)');
      }
    } catch (error) {
      console.error(`Failed to convert ${file}:`, error);
    }
  }
  
  console.log('All done.');
}

main().catch(console.error);
