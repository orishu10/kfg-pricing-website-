// Usage: node hash-password.js <password>
// Example: node hash-password.js mySecretPassword123

const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node hash-password.js <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nPassword hash (copy this into your INSERT):');
  console.log(hash);
  console.log('\nSQL:');
  console.log(`INSERT INTO users (username, password_hash) VALUES ('yourUsername', '${hash}');`);
});
