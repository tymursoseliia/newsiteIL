const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'database');
const files = ['cars.json', 'reviews.json', 'managers.json'];

files.forEach(file => {
  const filePath = path.join(dbDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/https:\/\/rang-auto.ru\//g, '/');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned ${file} successfully!`);
  }
});
