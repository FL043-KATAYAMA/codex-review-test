const https = require('https');
const fs = require('fs');

const diff = fs.readFileSync('diff.txt', 'utf8');

const data = JSON.stringify({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: 'Review this code diff and provide feedback in Japanese:\n\n' + diff
  }]
});

const options = {
  hostname: 'api.openai.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('API Response:', body);
    try {
      const json = JSON.parse(body);
      if (json.error) {
        console.error('API Error:', json.error.message);
        fs.writeFileSync('review.txt', 'APIエラー: ' + json.error.message);
      } else {
        const review = json.choices[0].message.content;
        fs.writeFileSync('review.txt', review);
        console.log('Review complete!');
      }
    } catch(e) {
      console.error('Parse error:', e);
      fs.writeFileSync('review.txt', 'パースエラー: ' + body);
    }
  });
});

req.on('error', e => {
  console.error('Request error:', e);
});

req.write(data);
req.end();