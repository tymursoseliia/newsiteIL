const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedTable(tableName, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Файл ${filePath} не найден, пропускаем.`);
      return;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Загрузка ${data.length} записей в таблицу ${tableName}...`);

    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
      console.error(`Ошибка при загрузке в ${tableName}:`, error.message);
    } else {
      console.log(`Таблица ${tableName} успешно заполнена!`);
    }
  } catch (err) {
    console.error(`Ошибка выполнения для ${tableName}:`, err.message);
  }
}

async function run() {
  const dbDir = path.join(__dirname, 'database');
  await seedTable('cars', path.join(dbDir, 'cars.json'));
  await seedTable('reviews', path.join(dbDir, 'reviews.json'));
  await seedTable('managers', path.join(dbDir, 'managers.json'));
}

run();
