const sendEmail = require('./utils/sendEmail');
require('dotenv').config();

console.log('Testing email directly with loaded environment variables:');
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('User:', process.env.EMAIL_USER);

sendEmail({
  email: 'test@example.com',
  subject: 'Test Email',
  message: 'This is a test message from the debugger.'
}).then(() => {
  console.log('Test complete.');
}).catch((err) => {
  console.error('Fatal Catch:', err);
});
