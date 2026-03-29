async function login(email, password) {
  const res = await fetch('http://127.0.0.1:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.data;
}

async function run() {
  const admin = await login('admin@teamzonevn.com', 'User123456');
  const user = await login('tuan.tran@example.com', 'User123456');
  const fs = require('fs');
  fs.writeFileSync('tokens.json', JSON.stringify({
    admin: admin?.tokens?.accessToken,
    user: user?.tokens?.accessToken
  }, null, 2));
}
run();
