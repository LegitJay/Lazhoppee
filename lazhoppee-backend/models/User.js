const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String, required: true,
      enum: ["customer", "pendingSeller", "storeOwner", "admin"],
      default: "customer",
    },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    profileImage: { type: String, default: null }, // base64 data URL
    addresses: [
      {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        region: { type: String, required: true },
        city: { type: String, required: true },
        barangay: { type: String, required: true },
        streetAddress: { type: String, required: true },
        postalCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    // Store details for storeOwner role users
    storeDetails: {
      storeName: String,
      storeDescription: String,
      storeAddress: String,
      storeContact: String,
      storeEmail: String,
      location: { lat: Number, lng: Number }
    },
    // Account status for admin user management
    isActive: { type: Boolean, default: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);