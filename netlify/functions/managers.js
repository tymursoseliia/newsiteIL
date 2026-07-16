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
  const id = lastPart && lastPart !== 'managers' ? lastPart : null;

  try {
    switch (event.httpMethod) {
      case 'GET':
        const { data: managers, error: getErr } = await supabase
          .from('managers')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (getErr) throw new Error(getErr.message);
        return { statusCode: 200, headers, body: JSON.stringify(managers) };

      case 'POST':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        const newManager = {
          id: Date.now().toString(),
          ...JSON.parse(event.body)
        };
        const { data: insertedManager, error: postErr } = await supabase
          .from('managers')
          .insert(newManager)
          .select();
        
        if (postErr) throw new Error(postErr.message);
        return { statusCode: 201, headers, body: JSON.stringify(insertedManager[0] || newManager) };

      case 'PUT':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing manager ID' }) };
        }
        const updateData = JSON.parse(event.body);
        const { data: updatedManager, error: putErr } = await supabase
          .from('managers')
          .update(updateData)
          .eq('id', id)
          .select();
        
        if (putErr) throw new Error(putErr.message);
        return { statusCode: 200, headers, body: JSON.stringify(updatedManager[0] || updateData) };

      case 'DELETE':
        if (!isAuthorized(event)) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
        }
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing manager ID' }) };
        }
        const { error: delErr } = await supabase
          .from('managers')
          .delete()
          .eq('id', id);
        
        if (delErr) throw new Error(delErr.message);
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Manager deleted' }) };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
  } catch (err) {
    console.error('Error in managers netlify function:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
