const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'rang-auto.ru', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace specific routes
content = content.replace(/https:\/\/rang-auto.ru\/catalog/g, '#catalog-section');
content = content.replace(/https:\/\/rang-auto.ru\/reviews/g, '#reviews-section');

// Replace domain with relative paths
content = content.replace(/https:\/\/rang-auto.ru\//g, '/');
content = content.replace(/https:\/\/rang-auto.ru/g, '#');

fs.writeFileSync(indexPath, content, 'utf8');
console.log('index.html links cleaned successfully!');
