const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    foodItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true
    },
    analysisData: {
        matchPercentage: Number,
        concerns: [String],
        suggestions: [String],
        alternatives: [{
            foodItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FoodItem'
            },
            reason: String
        }],
        userGoal: String,
        userDiet: String
    },
    inputMethod: {
        type: String,
        enum: ['text', 'image', 'camera'],
        required: true
    },
    inputData: String, // Text input or image filename
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
HistorySchema.index({ userId: 1, timestamp: -1 });
HistorySchema.index({ userId: 1, 'analysisData.matchPercentage': -1 });

module.exports = mongoose.model('History', HistorySchema);