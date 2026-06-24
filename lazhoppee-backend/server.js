require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected ✅ -> db:', mongoose.connection.name);
    app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
  })
  .catch(err => console.error('MongoDB connection error ❌', err));