// api/supabase-proxy.js (Vercel Function)
// This file goes in /api folder and runs on the server

import { createClient } from '@supabase/supabase-js';

// Server-side environment variables (NEVER exposed to frontend)
const supabaseUrl = process.env.SUPABASE_URL; // No VITE_ prefix!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Server-only key

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { table, operation, data, filters } = req.body;

    let result;
    switch (operation) {
      case 'select':
        result = await supabase.from(table).select('*').match(filters || {});
        break;
      case 'insert':
        result = await supabase.from(table).insert(data);
        break;
      case 'update':
        result = await supabase.from(table).update(data).match(filters);
        break;
      case 'delete':
        result = await supabase.from(table).delete().match(filters);
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}