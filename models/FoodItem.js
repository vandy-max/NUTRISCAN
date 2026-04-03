const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    dish_name: {
        type: String,
        required: true,
        trim: true
    },
    calories_kcal: Number,
    carbohydrates_g: Number,
    protein_g: Number,
    fats_g: Number,
    free_sugar_g: Number,
    fibre_g: Number,
    sodium_mg: Number,
    calcium_mg: Number,
    iron_mg: Number,
    vitamin_c_mg: Number,
    folate_mcg: Number,
    food_type: {
        type: String,
        default: 'General'
    },
    suitable_for: {
        type: [String],
        default: []
    },
    allergens: {
        type: [String],
        default: []
    },
    health_benefits: String
}, {
    timestamps: true
});

// Create text index for search
FoodItemSchema.index({ dish_name: 'text', food_type: 'text' });

module.exports = mongoose.model('FoodItem', FoodItemSchema);