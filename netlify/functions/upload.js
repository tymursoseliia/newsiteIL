const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjberojkphzoebrrjssc.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_yUWheIGkENHRyXWziM3uAQ_WYECTSe9';
const supabase = createClient(URL, KEY);

const ADMIN_TOKEN = 'secret_admin_token_9823472';

function isAuthorized(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  return authHeader === `Bearer ${ADMIN_TOKEN}`;
}

function parseMultipart(bodyBuffer, boundary) {
  // Split body by boundary
  const parts = [];
  const boundaryStr = '--' + boundary;
  let start = bodyBuffer.indexOf(boundaryStr);
  while (start !== -1) {
    const end = bodyBuffer.indexOf(boundaryStr, start + boundaryStr.length);
    if (end === -1) break;
    
    const partBuffer = bodyBuffer.subarray(start + boundaryStr.length, end);
    parts.push(partBuffer);
    start = end;
  }
  
  for (const part of parts) {
    // Find headers and body boundary (\r\n\r\n)
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    
    const headers = part.subarray(0, headerEnd).toString('utf-8');
    const content = part.subarray(headerEnd + 4, part.length - 2); // trim trailing \r\n
    
    if (headers.includes('name="file"')) {
      const filenameMatch = headers.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'file.bin';
      
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
      
      return { filename, contentType, content };
    }
  }
  return null;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!isAuthorized(event)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing boundary in content-type' }) };
    }
    const boundary = boundaryMatch[1];

    const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    const file = parseMultipart(bodyBuffer, boundary);

    if (!file) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No file uploaded' }) };
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.filename);
    const supabaseFilename = 'upload-' + uniqueSuffix + ext;

    const { data, error: uploadErr } = await supabase.storage
      .from('uploads')
      .upload(supabaseFilename, file.content, {
        contentType: file.contentType,
        upsert: true
      });

    if (uploadErr) {
      throw new Error(uploadErr.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(supabaseFilename);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ fileUrl: publicUrlData.publicUrl })
    };
  } catch (err) {
    console.error('Error in upload Netlify function:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
