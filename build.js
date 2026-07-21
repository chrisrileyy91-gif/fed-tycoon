const fs = require('fs');
const path = require('path');

fs.mkdirSync('www/fonts', { recursive: true });
fs.copyFileSync('index.html', 'www/index.html');

const fonts = fs.readdirSync('fonts').filter(f => f.endsWith('.woff2'));
fonts.forEach(f => {
  fs.copyFileSync(path.join('fonts', f), path.join('www', 'fonts', f));
});

console.log('Built www/ (' + fonts.length + ' font files)');
