const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");

const authRoutes = require("./routes/auth");
const sellerRoutes = require("./routes/seller");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use("/checkout", require("./routes/checkout"));
app.use("/auth", authRoutes);
app.use("/seller", sellerRoutes);
app.use("/messages", require("./routes/messages"));
app.use("/orders", require("./routes/orders"));
app.use("/profile", require("./routes/profile"));
app.use("/admin", adminRoutes);
app.use("/wishlist", require("./routes/wishlist"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/stores", require("./routes/stores"));

const server = http.createServer(app);
const initSocket = require("./socket");
initSocket(server);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected ✅ -> db:", mongoose.connection.name);
    server.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌", err);
  });