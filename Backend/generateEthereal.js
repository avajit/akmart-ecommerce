const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    console.log('Credentials obtained, save these in your .env file:');
    console.log(`SMTP_USER="${account.user}"`);
    console.log(`SMTP_PASS="${account.pass}"`);
});
