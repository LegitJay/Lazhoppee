// Run once: node createCourier.js
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const COURIER_EMAIL = 'courier@lazhoppee.com';
const COURIER_USERNAME = 'courier';
const COURIER_PASSWORD = 'password';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  let user = await User.findOne({ email: COURIER_EMAIL });
  if (user) {
    user.role = 'courier';
    user.password = COURIER_PASSWORD;
    if (!user.username) user.username = COURIER_USERNAME;
    await user.save();
    console.log('Existing user upgraded to courier:', COURIER_EMAIL);
  } else {
    user = await User.create({
      email: COURIER_EMAIL,
      username: COURIER_USERNAME,
      password: COURIER_PASSWORD,
      role: 'courier',
    });
    console.log('Courier user created:', COURIER_EMAIL, '/ password:', COURIER_PASSWORD);
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });