const axios = require("axios");

const mlClient = axios.create({
    baseURL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
});

const getPredictionExplanation = async (features) => {
    try {
        const response = await mlClient.post("/explain", {
            features
        });

        return response.data;

    } catch (error) {
        if (error.response) {
            // FastAPI responded with an error status
            const mlError = new Error(
                error.response.data?.detail ||
                error.response.data?.message ||
                "ML service rejected the prediction request"
            );

            mlError.statusCode = error.response.status;
            throw mlError;
        }

        if (error.code === "ECONNABORTED") {
            const timeoutError = new Error("ML service request timed out");
            timeoutError.statusCode = 504;
            throw timeoutError;
        }

        // The ML service may be stopped or unreachable
        const connectionError = new Error("ML service is currently unavailable");
        connectionError.statusCode = 503;
        throw connectionError;
    }
};

module.exports = {
    getPredictionExplanation
};