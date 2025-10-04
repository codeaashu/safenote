// api/config.js (Vercel serverless function)
// This returns your Supabase config without exposing it in the bundle

export default function handler(req, res) {
  // Only return config from server environment (NO VITE_ prefix)
  const config = {
    url: process.env.SUPABASE_URL, // Server-side env var (secure)
    key: process.env.SUPABASE_ANON_KEY // Server-side env var (secure)
  };

  // Add some basic security
  const allowedOrigins = ['https://safenote.me', 'https://your-domain.vercel.app'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.status(200).json(config);
}