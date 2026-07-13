const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const coll = mongoose.connection.collection('products');
    const indexes = await coll.indexes();
    console.log('Current product indexes:', JSON.stringify(indexes, null, 2));
    const hasIdIndex = indexes.some((index) => index.name === 'id_1');
    if (hasIdIndex) {
      await coll.dropIndex('id_1');
      console.log('Dropped unique id_1 index from products collection.');
    } else {
      console.log('No id_1 index found.');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
