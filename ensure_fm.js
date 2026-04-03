const fs = require('fs');
const path = require('path');

const docsDir = 'd:\\app\\persons-doc\\docs\\en-US';
const i18nDir = 'd:\\app\\persons-doc\\docs\\.vitepress\\i18n\\pages';

const i18nFiles = [
  'java.json', 'rust.json', 'system.json', 'vue.json', 
  'database.json', 'middleware.json', 'git.json', 'node.json'
];

const titleMap = {};

i18nFiles.forEach(fileName => {
  const filePath = path.join(i18nDir, fileName);
  if (!fs.existsSync(filePath)) return;
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const enUsData = data['en-US'];
  if (!enUsData) return;

  Object.values(enUsData).forEach(group => {
    const base = group.base || '';
    const children = group.children || [];
    children.forEach(child => {
      const link = child.link;
      const text = child.text;
      if (link && text) {
        let fullRelPath = path.join(base, link + '.md');
        fullRelPath = fullRelPath.replace(/^\/+/, '').replace(/\//g, path.sep);
        const fullAbsPath = path.join(docsDir, fullRelPath);
        titleMap[fullAbsPath] = text;
      }
    });
  });
});

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const mdFiles = getAllFiles(docsDir).filter(f => f.endsWith('.md'));

mdFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let frontMatter = {};
  let body = content;

  if (content.startsWith('---')) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (match) {
      const fmText = match[1];
      body = content.slice(match[0].length);
      fmText.split(/\r?\n/).forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          frontMatter[key] = val;
        }
      });
    }
  }

  // Ensure mandatory fields
  if (!frontMatter.title) {
    frontMatter.title = titleMap[file] || path.basename(file, '.md');
  }
  frontMatter.page = 'true';
  frontMatter.lang = 'en-US';

  const newFmText = Object.entries(frontMatter).map(([k, v]) => `${k}: ${v}`).join('\n');
  const newContent = `---\n${newFmText}\n---\n\n${body.trimStart()}`;
  
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Ensured front matter for ${file}`);
});
