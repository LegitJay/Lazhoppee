// Run once: node createAdmin.js
// Creates (or upgrades) a user to role: 'admin'. Edit the email/password below first.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@krssvr.com';
const ADMIN_PASSWORD = 'admin';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  let user = await User.findOne({ email: ADMIN_EMAIL });
  if (user) {
    user.role = 'admin';
    await user.save();
    console.log('Existing user upgraded to admin:', ADMIN_EMAIL);
  } else {
    user = await User.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log('Admin user created:', ADMIN_EMAIL, '/ password:', ADMIN_PASSWORD);
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });