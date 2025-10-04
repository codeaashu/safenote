// SECURITY WARNING: This file has been disabled due to extreme security risk
// It would allow anyone to read/write/delete ANY data in your database!

export default async function handler(req, res) {
  // SECURITY: This endpoint is disabled for safety
  res.status(403).json({ 
    error: 'This endpoint has been disabled for security reasons',
    message: 'Use direct Supabase client with proper authentication instead'
  });
}