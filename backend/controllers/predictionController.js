const Prediction = require("../models/Prediction");
const { getPredictionExplanation } = require("../services/mlService");

const createPrediction = async (req, res) => {
    try {
        const { features } = req.body;

        if (
            !features ||
            typeof features !== "object" ||
            Array.isArray(features)
        ) {
            return res.status(400).json({
                message: "Please provide CTG features as an object"
            });
        }

        // Ask the ML service to predict and generate SHAP explanations
        const mlResult = await getPredictionExplanation(features);

        // Save the result and associate it with the authenticated user
        const prediction = await Prediction.create({
            user: req.user.userId,
            features,
            predictedClass: mlResult.predicted_class,
            encodedClass: mlResult.encoded_class,
            originalClass: mlResult.original_class,
            probabilities: mlResult.probabilities,
            topFeatures: mlResult.top_features,
            disclaimer: mlResult.disclaimer
        });

        return res.status(201).json({
            message: "Prediction generated and saved successfully",
            prediction
        });

    } catch (error) {
        console.error("Create prediction error:", error.message);

        // Forward errors returned by the ML service
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Unable to generate prediction"
        });
    }
};

const getPredictionHistory = async (req, res) => {
    try {
        const predictions = await Prediction.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: predictions.length,
            predictions
        });

    } catch (error) {
        console.error("Prediction history error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve prediction history"
        });
    }
};


const mongoose = require("mongoose");

const getPredictionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the MongoDB ObjectId before querying.
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid prediction ID."
            });
        }

        // Only retrieve a record belonging to the logged-in user.
        const prediction = await Prediction.findOne({
            _id: id,
            user: req.user.userId
        });

        if (!prediction) {
            return res.status(404).json({
                message: "Prediction not found."
            });
        }

        return res.status(200).json({
            prediction
        });

    } catch (error) {
        console.error("Get prediction by ID error:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve prediction."
        });
    }
};


module.exports = {
    createPrediction,
    getPredictionHistory,
    getPredictionById
};