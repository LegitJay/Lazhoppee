
const mongoose = require('mongoose');
const User = require('./models/User');
const SellerApplication = require('./models/SellerApplication');
const Store = require('./models/Store');

// Replace with your actual MongoDB connection string from .env
const MONGODB_URI = "mongodb+srv://07304438_db_user:Sf5BGSPBdUzt4h42@cluster0.1pn6i6w.mongodb.net/lazhoppee?retryWrites=true&w=majority&appName=Cluster0";

// Replace with the email of the user who needs a store created
const USER_EMAIL = "ktine@gmail.com";

async function createMissingStore() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: USER_EMAIL });
    if (!user) {
      console.log(`User with email ${USER_EMAIL} not found.`);
      return;
    }

    if (user.role !== 'storeOwner') {
      console.log(`User ${USER_EMAIL} is not a storeOwner. Their role is ${user.role}.`);
      return;
    }

    const existingStore = await Store.findOne({ owner: user._id });
    if (existingStore) {
      console.log(`Store already exists for user ${USER_EMAIL}.`);
      return;
    }

    const application = await SellerApplication.findOne({ user: user._id, status: 'approved' }).sort({ createdAt: -1 });
    if (!application) {
      console.log(`No approved application found for user ${USER_EMAIL}.`);
      return;
    }

    console.log(`Found approved application for ${USER_EMAIL}. Creating store...`);

    const newStore = await Store.create({
      owner: application.user,
      storeName: application.storeName,
      storeDescription: application.storeDescription,
      location: application.location,
      storeAddress: application.storeAddress,
      storeContact: application.storeContact,
      storeEmail: application.storeEmail || user.email,
    });

    console.log('Store created successfully:', newStore);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createMissingStore();