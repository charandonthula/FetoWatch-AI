const express = require("express");
const router = express.Router();

const {
    createPrediction,
    getPredictionHistory
} = require("../controllers/predictionController");

const { protect } = require("../middleware/authMiddleWare");

// Both routes require a valid JWT
router.post("/", protect, createPrediction);
router.get("/", protect, getPredictionHistory);

module.exports = router;