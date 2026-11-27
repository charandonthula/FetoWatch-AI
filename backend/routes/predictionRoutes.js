const express = require("express");
const router = express.Router();

const {
    createPrediction,
    getPredictionHistory,
    getPredictionById,
    updatePredictionStatus,
    deletePrediction,
    deleteAllPredictions
} = require("../controllers/predictionController");

const { protect } = require("../middleware/authMiddleWare");

// All prediction routes require a valid JWT.
router.post("/", protect, createPrediction);
router.get("/", protect, getPredictionHistory);
router.get("/:id", protect, getPredictionById);
router.patch("/:id/status", protect, updatePredictionStatus);
router.delete("/", protect, deleteAllPredictions);
router.delete("/:id", protect, deletePrediction);

module.exports = router;