const express = require("express");
const router = express.Router();

const {
    createPrediction,
    getPredictionHistory,
    getPredictionById
} = require("../controllers/predictionController");

const { protect } = require("../middleware/authMiddleWare");

// Both routes require a valid JWT
router.post("/", protect, createPrediction);
router.get("/", protect, getPredictionHistory);
router.get("/:id", protect, getPredictionById);

module.exports = router;