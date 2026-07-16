const { createClient } = require('@supabase/supabase-js');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjberojkphzoebrrjssc.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';
const supabase = createClient(URL, KEY);

const ADMIN_TOKEN = 'secret_admin_token_9823472';

function isAuthorized(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  return authHeader === `Bearer ${ADMIN_TOKEN}`;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const pathParts = event.path.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  const id = lastPart && lastPart !== 'reviews' ? lastPart : null;

  try {
    switch (event.httpMethod) {
      case 'GET':
        const { data: reviews, error: getErr } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (getErr) throw new Error(getErr.message);
        return { statusCode: 200, headers, body: JSON.stringify(reviews) };

      case 'POST':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const newReview = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('ru-RU'),
          ...JSON.parse(event.body)
        };
        const { data: insertedReview, error: postErr } = await supabase
          .from('reviews')
          .insert(newReview)
          .select();
        
        if (postErr) throw new Error(postErr.message);
        return { statusCode: 201, headers, body: JSON.stringify(insertedReview[0] || newReview) };

      case 'PUT':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing review ID' }) };
        }
        const updateData = JSON.parse(event.body);
        const { data: updatedReview, error: putErr } = await supabase
          .from('reviews')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (putErr) throw new Error(putErr.message);
        return { statusCode: 200, headers, body: JSON.stringify(updatedReview[0] || updateData) };

      case 'DELETE':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing review ID' }) };
        }
        const { error: delErr } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);
        
        if (delErr) throw new Error(delErr.message);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Review deleted' }) };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
  } catch (err) {
    console.error('Error in reviews netlify function:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
