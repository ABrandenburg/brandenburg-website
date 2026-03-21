/**
 * One-time script to get a Google OAuth refresh token.
 *
 * Usage:
 *   node scripts/google-oauth.js
 *
 * Then visit the URL it prints, sign in, paste back the code.
 */

const http = require('http');
const url = require('url');

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in your environment.');
  process.exit(1);
}
const REDIRECT_URI = 'http://localhost:3847/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n=== Google OAuth Token Generator ===\n');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Sign in with the Google account that manages your Ads.\n');
console.log('3. Waiting for callback on http://localhost:3847 ...\n');

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname !== '/callback') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const code = parsed.query.code;
  if (!code) {
    res.writeHead(400);
    res.end('No code in callback');
    return;
  }

  console.log('Received authorization code, exchanging for tokens...\n');

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      console.error('Error:', tokens.error, tokens.error_description);
      res.writeHead(500);
      res.end('Token exchange failed: ' + tokens.error_description);
      server.close();
      return;
    }

    console.log('=== SUCCESS ===\n');
    console.log('Refresh Token (save this — you only get it once):\n');
    console.log(tokens.refresh_token);
    console.log('\n--- Full response ---');
    console.log(JSON.stringify(tokens, null, 2));
    console.log('\nAdd to your .env.local and Vercel:');
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Success!</h1>
      <p>Refresh token received. Check your terminal.</p>
      <p>You can close this tab.</p>
    `);
  } catch (err) {
    console.error('Token exchange failed:', err);
    res.writeHead(500);
    res.end('Token exchange failed');
  }

  server.close();
});

server.listen(3847, () => {
  // Server ready, URL already printed above
});
