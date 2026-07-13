const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const SellerApplication = require('./models/SellerApplication');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const app = await SellerApplication.findOne({
      $or: [
        { user: '6a4370bf7356e099ee32e0cb' },
        { userId: '6a4370bf7356e099ee32e0cb' },
      ],
      status: 'approved',
    }).lean();
    console.log('app=', app);
    if (app) console.log('storeName=', app.storeName);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
