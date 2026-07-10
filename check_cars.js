const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bjberojkphzoebrrjssc.supabase.co';
const SUPABASE_KEY = 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('cars').select('*');
  if (error) {
    console.error('Error fetching cars:', error.message);
  } else {
    console.log('Cars in database:', data);
  }
}

run();
