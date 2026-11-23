const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

const authRoutes = require("./routes/authRoutes");

const predictionRoutes = require("./routes/predictionRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);

// Routes
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to FetoWatch AI Backend"
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "FetoWatch Backend"
    });
});

// Start server after database connection
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`FetoWatch backend running on port ${PORT}`);
    });
};

startServer();
