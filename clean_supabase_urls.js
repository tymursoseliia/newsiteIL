const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanCars() {
  const { data: cars, error } = await supabase.from('cars').select('*');
  if (error) {
    console.error('Error fetching cars:', error.message);
    return;
  }
  for (const car of cars) {
    if (car.image && car.image.includes('https://rang-auto.ru/')) {
      const newImage = car.image.replace('https://rang-auto.ru/', '/');
      console.log(`Updating car ${car.id}: ${car.image} -> ${newImage}`);
      await supabase.from('cars').update({ image: newImage }).eq('id', car.id);
    }
  }
}

async function cleanReviews() {
  const { data: reviews, error } = await supabase.from('reviews').select('*');
  if (error) {
    console.error('Error fetching reviews:', error.message);
    return;
  }
  for (const review of reviews) {
    let updated = false;
    const updates = {};
    if (review.mediaUrl && review.mediaUrl.includes('https://rang-auto.ru/')) {
      updates.mediaUrl = review.mediaUrl.replace('https://rang-auto.ru/', '/');
      updated = true;
    }
    if (review.videoUrl && review.videoUrl.includes('https://rang-auto.ru/')) {
      updates.videoUrl = review.videoUrl.replace('https://rang-auto.ru/', '/');
      updated = true;
    }
    if (updated) {
      console.log(`Updating review ${review.id}:`, updates);
      await supabase.from('reviews').update(updates).eq('id', review.id);
    }
  }
}

async function cleanManagers() {
  const { data: managers, error } = await supabase.from('managers').select('*');
  if (error) {
    console.error('Error fetching managers:', error.message);
    return;
  }
  for (const manager of managers) {
    if (manager.image && manager.image.includes('https://rang-auto.ru/')) {
      const newImage = manager.image.replace('https://rang-auto.ru/', '/');
      console.log(`Updating manager ${manager.id}: ${manager.image} -> ${newImage}`);
      await supabase.from('managers').update({ image: newImage }).eq('id', manager.id);
    }
  }
}

async function run() {
  console.log('Очистка ссылок на rang-auto.ru в Supabase...');
  await cleanCars();
  await cleanReviews();
  await cleanManagers();
  console.log('Очистка базы данных Supabase завершена!');
}

run();
