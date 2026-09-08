const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const http = require("http");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require("./routes/chatRoutes");
const activityRoutes = require("./routes/activityRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const pricePredictionRoutes = require("./routes/pricePredictionRoutes");
const { initializeSocket } = require("./socket/socketServer");

const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) =>
  res.status(200).json({
    success: true,
    data: {
      service: "BazaarSathi API",
      endpoints: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        listings: "GET /api/listings",
        createOrder: "POST /api/orders/create",
        verifyPayment: "POST /api/orders/khalti-verify",
        conversations: "GET /api/chat/conversations",
        favorites: "GET /api/activity/favorites",
        reviews: "GET /api/reviews/listing/:listingId",
        pricePrediction: "POST /api/price/predict",
      },
    },
    message: "BazaarSathi API is running",
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/price", pricePredictionRoutes);

app.use((req, res) =>
  res.status(404).json({
    success: false,
    data: null,
    message: "Route not found",
  }),
);

app.use((error, req, res, next) => {
  const status = error.type === "entity.parse.failed" ? 400 : 500;
  const message =
    status === 400
      ? "Request body contains invalid JSON"
      : "Internal server error";

  return res.status(status).json({ success: false, data: null, message });
});

const httpServer = http.createServer(app);
const io = initializeSocket(httpServer);

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error(
        "MONGO_URI and JWT_SECRET must be set in the environment",
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    const port = Number(process.env.PORT) || 5000;
    httpServer.listen(port);
    console.log(`BazaarSathi API running on port ${port}`);
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, httpServer, io, startServer };
