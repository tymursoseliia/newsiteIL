const fs = require('fs');
const path = require('path');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
  try {
    if (URL && KEY) {
      const response = await fetch(`${URL}/rest/v1/managers?select=*&order=created_at.asc`, {
        headers: {
          'apikey': KEY,
          'Authorization': `Bearer ${KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          statusCode: 200,
          headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*' 
          },
          body: JSON.stringify(data)
        };
      }
    }
    
    // Fallback to local JSON file
    const filePath = path.join(process.cwd(), 'database', 'managers.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
