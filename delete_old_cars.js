const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const oldIds = ['214', '215', '216', '217', '218', '219'];
  console.log('Удаляем старые автомобили из Supabase:', oldIds);
  
  const { error } = await supabase.from('cars').delete().in('id', oldIds);
  if (error) {
    console.error('Ошибка удаления:', error.message);
  } else {
    console.log('Старые автомобили успешно удалены из базы!');
  }
}

run();
