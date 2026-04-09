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
    'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    const review = json.choices[0].message.content;
    fs.writeFileSync('review.txt', review);
    console.log('Review complete!');
  });
});

req.write(data);
req.end();