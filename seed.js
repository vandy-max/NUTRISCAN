const mongoose = require('mongoose');

// Define Mongoose schemas (must match your server.js schemas)
const { Schema } = mongoose;

const FoodItemSchema = new Schema({
    food_name: String,
    food_type: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    cholesterol: Number,          
    vitamins: { type: String, default: '[]' },
    minerals: { type: String, default: '[]' },
    health_benefits: String,
    suitable_for: { type: String, default: '[]' },
    allergens: { type: String, default: '[]' }
});
                                             
const FoodItem = mongoose.model('FoodItem', FoodItemSchema);

// MongoDB connection URI (should match your server.js)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutriscan_db';

// New food items to be added
const newFoods = [
    {
        food_name: "Paneer Butter Masala",
        food_type: "Vegetarian",
        calories: 350, protein: 18, carbs: 12, fats: 25, fiber: 3, sugar: 5, sodium: 400, cholesterol: 60,
        vitamins: JSON.stringify(['Vitamin A', 'Vitamin D']),
        minerals: JSON.stringify(['Calcium', 'Phosphorus']),
        health_benefits: "Rich in protein and calcium, good for bone health.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['dairy', 'nuts'])
    },
    {
        food_name: "Chicken Biryani",
        food_type: "Non-Vegetarian",
        calories: 450, protein: 25, carbs: 50, fats: 18, fiber: 4, sugar: 3, sodium: 600, cholesterol: 80,
        vitamins: JSON.stringify(['Vitamin B6', 'Niacin']),
        minerals: JSON.stringify(['Iron', 'Selenium']),
        health_benefits: "Good source of protein and energy from carbohydrates.",
        suitable_for: JSON.stringify(['non-vegetarian']),
        allergens: JSON.stringify([])
    },
    {
        food_name: "Masala Dosa",
        food_type: "Vegetarian",
        calories: 300, protein: 8, carbs: 45, fats: 10, fiber: 5, sugar: 2, sodium: 350, cholesterol: 0,
        vitamins: JSON.stringify(['Vitamin B1', 'Vitamin C']),
        minerals: JSON.stringify(['Iron', 'Magnesium']),
        health_benefits: "Fermented, so good for gut health. Provides sustained energy.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['lentils'])
    },
    {
        food_name: "Grilled Salmon",
        food_type: "Non-Vegetarian",
        calories: 280, protein: 30, carbs: 0, fats: 18, fiber: 0, sugar: 0, sodium: 150, cholesterol: 90,
        vitamins: JSON.stringify(['Vitamin D', 'Vitamin B12']),
        minerals: JSON.stringify(['Selenium', 'Potassium']),
        health_benefits: "Excellent source of Omega-3 fatty acids, great for heart and brain health.",
        suitable_for: JSON.stringify(['non-vegetarian', 'keto', 'paleo']),
        allergens: JSON.stringify(['fish'])
    },
    {
        food_name: "Quinoa Salad",
        food_type: "Vegetarian",
        calories: 220, protein: 8, carbs: 30, fats: 9, fiber: 5, sugar: 2, sodium: 100, cholesterol: 0,
        vitamins: JSON.stringify(['Folate', 'Vitamin E']),
        minerals: JSON.stringify(['Magnesium', 'Manganese']),
        health_benefits: "Complete protein source, high in fiber and antioxidants.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan', 'gluten-free']),
        allergens: JSON.stringify([])
    },
    {
        food_name: "Avocado Toast",
        food_type: "Vegetarian",
        calories: 250, protein: 7, carbs: 25, fats: 15, fiber: 7, sugar: 1, sodium: 200, cholesterol: 0,
        vitamins: JSON.stringify(['Vitamin K', 'Vitamin E', 'Folate']),
        minerals: JSON.stringify(['Potassium']),
        health_benefits: "Rich in healthy monounsaturated fats and fiber.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['gluten'])
    },
    {
        food_name: "Lentil Soup (Dal)",
        food_type: "Vegetarian",
        calories: 180, protein: 12, carbs: 25, fats: 4, fiber: 10, sugar: 3, sodium: 300, cholesterol: 0,
        vitamins: JSON.stringify(['Folate', 'Thiamine']),
        minerals: JSON.stringify(['Iron', 'Manganese']),
        health_benefits: "High in fiber and plant-based protein, supports heart health.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['lentils'])
    },
    {
        food_name: "Greek Yogurt with Berries",
        food_type: "Vegetarian",
        calories: 150, protein: 15, carbs: 12, fats: 4, fiber: 3, sugar: 8, sodium: 60, cholesterol: 15,
        vitamins: JSON.stringify(['Vitamin B12', 'Vitamin C']),
        minerals: JSON.stringify(['Calcium', 'Phosphorus']),
        health_benefits: "High in protein and probiotics for gut health.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['dairy'])
    },
    {
        food_name: "Oatmeal with Almonds",
        food_type: "Vegetarian",
        calories: 210, protein: 8, carbs: 30, fats: 8, fiber: 5, sugar: 1, sodium: 5, cholesterol: 0,
        vitamins: JSON.stringify(['Vitamin B1']),
        minerals: JSON.stringify(['Manganese', 'Magnesium']),
        health_benefits: "Excellent source of soluble fiber, helps lower cholesterol.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['nuts'])
    },
    {
        food_name: "Spaghetti Bolognese",
        food_type: "Non-Vegetarian",
        calories: 550, protein: 30, carbs: 60, fats: 20, fiber: 6, sugar: 10, sodium: 800, cholesterol: 70,
        vitamins: JSON.stringify(['Vitamin A', 'Vitamin B12']),
        minerals: JSON.stringify(['Iron', 'Zinc']),
        health_benefits: "Provides a balance of protein, carbs, and fats for energy.",
        suitable_for: JSON.stringify(['non-vegetarian']),
        allergens: JSON.stringify(['gluten'])
    },
    {
        food_name: "Tofu Stir-fry",
        food_type: "Vegetarian",
        calories: 320, protein: 20, carbs: 25, fats: 15, fiber: 5, sugar: 8, sodium: 500, cholesterol: 0,
        vitamins: JSON.stringify(['Vitamin K', 'Vitamin C']),
        minerals: JSON.stringify(['Manganese', 'Calcium']),
        health_benefits: "Excellent plant-based protein source with mixed vegetables.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['soy'])
    },
    {
        food_name: "Caesar Salad",
        food_type: "Vegetarian",
        calories: 400, protein: 10, carbs: 15, fats: 35, fiber: 3, sugar: 2, sodium: 450, cholesterol: 25,
        vitamins: JSON.stringify(['Vitamin A', 'Vitamin K']),
        minerals: JSON.stringify(['Calcium']),
        health_benefits: "Provides leafy greens, but can be high in fat and sodium from dressing.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['dairy', 'gluten', 'fish'])
    },
    {
        food_name: "Mutton Rogan Josh",
        food_type: "Non-Vegetarian",
        calories: 480, protein: 35, carbs: 15, fats: 30, fiber: 4, sugar: 5, sodium: 700, cholesterol: 120,
        vitamins: JSON.stringify(['Vitamin B12']),
        minerals: JSON.stringify(['Iron', 'Zinc']),
        health_benefits: "Very high in protein and iron, good for muscle health.",
        suitable_for: JSON.stringify(['non-vegetarian']),
        allergens: JSON.stringify(['dairy'])
    },
    {
        food_name: "Palak Paneer",
        food_type: "Vegetarian",
        calories: 320, protein: 18, carbs: 15, fats: 22, fiber: 5, sugar: 4, sodium: 400, cholesterol: 50,
        vitamins: JSON.stringify(['Vitamin A', 'Vitamin K', 'Folate']),
        minerals: JSON.stringify(['Calcium', 'Iron']),
        health_benefits: "Rich in iron from spinach and protein from paneer.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['dairy'])
    },
    {
        food_name: "Fruit Smoothie",
        food_type: "Beverage",
        calories: 180, protein: 5, carbs: 35, fats: 2, fiber: 6, sugar: 25, sodium: 20, cholesterol: 5,
        vitamins: JSON.stringify(['Vitamin C', 'Potassium']),
        minerals: JSON.stringify(['Manganese']),
        health_benefits: "Quick source of vitamins and fiber. Sugar content can be high.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['dairy'])
    },
    {
        food_name: "Hummus with Pita Bread",
        food_type: "Vegetarian",
        calories: 350, protein: 12, carbs: 45, fats: 15, fiber: 8, sugar: 2, sodium: 500, cholesterol: 0,
        vitamins: JSON.stringify(['Folate']),
        minerals: JSON.stringify(['Iron', 'Magnesium']),
        health_benefits: "Good source of plant-based protein and fiber.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['gluten', 'sesame'])
    },
    {
        food_name: "Beef Steak",
        food_type: "Non-Vegetarian",
        calories: 450, protein: 50, carbs: 0, fats: 28, fiber: 0, sugar: 0, sodium: 200, cholesterol: 150,
        vitamins: JSON.stringify(['Vitamin B12', 'Niacin']),
        minerals: JSON.stringify(['Iron', 'Zinc', 'Selenium']),
        health_benefits: "Extremely high in protein and essential minerals for muscle growth and repair.",
        suitable_for: JSON.stringify(['non-vegetarian', 'keto', 'paleo']),
        allergens: JSON.stringify([])
    },
    {
        food_name: "Chocolate Cake",
        food_type: "Dessert",
        calories: 400, protein: 5, carbs: 50, fats: 20, fiber: 2, sugar: 35, sodium: 250, cholesterol: 80,
        vitamins: JSON.stringify([]),
        minerals: JSON.stringify(['Iron']),
        health_benefits: "Provides quick energy but is high in sugar and unhealthy fats.",
        suitable_for: JSON.stringify(['vegetarian']),
        allergens: JSON.stringify(['gluten', 'dairy', 'egg'])
    },
    {
        food_name: "Idli Sambar",
        food_type: "Vegetarian",
        calories: 250, protein: 10, carbs: 40, fats: 5, fiber: 6, sugar: 3, sodium: 400, cholesterol: 0,
        vitamins: JSON.stringify(['Vitamin C']),
        minerals: JSON.stringify(['Iron', 'Magnesium']),
        health_benefits: "Steamed, low-fat, and easily digestible. Good for weight management.",
        suitable_for: JSON.stringify(['vegetarian', 'vegan']),
        allergens: JSON.stringify(['lentils'])
    },
    {
        food_name: "Fish Curry",
        food_type: "Non-Vegetarian",
        calories: 380, protein: 28, carbs: 10, fats: 25, fiber: 3, sugar: 4, sodium: 550, cholesterol: 85,
        vitamins: JSON.stringify(['Vitamin D', 'Vitamin B12']),
        minerals: JSON.stringify(['Iodine', 'Selenium']),
        health_benefits: "Rich in omega-3s and protein. Spices may have anti-inflammatory properties.",
        suitable_for: JSON.stringify(['non-vegetarian']),
        allergens: JSON.stringify(['fish', 'coconut'])
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        // Optional: Clear existing data before seeding
        // await FoodItem.deleteMany({});
        // console.log('Cleared existing food items.');

        await FoodItem.insertMany(newFoods);
        console.log(`Successfully seeded ${newFoods.length} new food items into the database.`);

    } catch (error) {
        console.error('Error seeding the database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

seedDatabase();
