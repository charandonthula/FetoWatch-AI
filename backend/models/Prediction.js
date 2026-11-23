const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
    {
        // The doctor who requested this prediction
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // The 21 CTG input features sent to the ML service
        features: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        // Prediction returned by the ML service
        predictedClass: {
            type: String,
            required: true
        },

        encodedClass: {
            type: Number,
            required: true
        },

        originalClass: {
            type: Number,
            required: true
        },

        // Probabilities for each of the three classes
        probabilities: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        // Top SHAP contributions returned by the ML service
        topFeatures: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },

        // Preserve the ML service disclaimer
        disclaimer: {
            type: String,
            default: ""
        },

        // Workflow status, not a medical diagnosis or clinical decision
        reviewStatus: {
            type: String,
            enum: ["pending", "reviewed", "flagged"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

// Efficiently retrieve a user's prediction history, newest first
predictionSchema.index({ user: 1, createdAt: -1 });

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;