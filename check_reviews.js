const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('reviews').select('*');
  if (error) {
    console.error('Error fetching reviews:', error.message);
  } else {
    console.log('Reviews in database:', data);
  }
}

run();
