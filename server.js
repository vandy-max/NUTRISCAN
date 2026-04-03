const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET || 'nutriscan-secret-key-2024', // Use environment variable for secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// MongoDB connection (replace URI as needed)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutriscan_db';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schemas
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    age: Number,
    height: Number,
    weight: Number,
    bmi: Number,
    diet_preference: String,
    health_conditions: String,
    fitness_goal: String,
    allergies: String
});

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

const AnalysisHistorySchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    food_name: String,
    match_percentage: Number,
    analysis_result: Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
const AnalysisHistory = mongoose.model('AnalysisHistory', AnalysisHistorySchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/preferences', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth');
  }
  res.sendFile(path.join(__dirname, 'public', 'preferences.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/history', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }
    res.sendFile(path.join(__dirname, 'history.html'));
});

// Endpoint for the full history page with filtering and pagination
app.get('/api/history', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const { page = 1, limit = 10, method, match, date, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { user_id: req.session.userId };

        if (method) {
            filter['analysis_result.inputMethod'] = method;
        }
        if (match) {
            const [min, max] = match.split('-').map(Number);
            filter.match_percentage = { $gte: min, $lte: max };
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.created_at = { $gte: startDate, $lt: endDate };
        }
        if (search) {
            filter.food_name = { $regex: search, $options: 'i' };
        }

        const history = await AnalysisHistory.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AnalysisHistory.countDocuments(filter);

        res.json({
            success: true,
            history,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Full history fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve history.' });
    }
});

// Add these new routes after your existing routes

// Search comprehensive food items
app.get('/api/food/search', async (req, res) => {
    try {
        const { query, type, maxCalories } = req.query;
        let searchFilter = {};
        
        if (query) {
            searchFilter = { 
                $text: { $search: query } 
            };
        }
        
        if (type) {
            searchFilter.food_type = type;
        }
        
        if (maxCalories) {
            searchFilter.calories_kcal = { $lte: parseInt(maxCalories) };
        }
        
        const foodItems = await FoodItem.find(searchFilter).limit(50);
        res.json(foodItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get food recommendations based on user profile
app.get('/api/food/recommendations', async (req, res) => {
    try {
        const { goal, diet, health } = req.query;
        let filter = {};

        // Handle diet preference with a regex to search inside the JSON string array
        if (diet && diet !== 'balanced' && diet !== 'non-vegetarian') {
            filter.suitable_for = { $regex: new RegExp(diet, 'i') };
        }

        // Use correct field names as per the schema
        if (goal === 'weight_loss') {
            filter.calories = { $lte: 400 };
            filter.fiber = { $gte: 4 };
        } else if (goal === 'muscle_building') {
            filter.protein = { $gte: 20 };
        } else if (goal === 'weight_gain') {
            filter.calories = { $gte: 400 };
        }

        // Health conditions
        if (health === 'diabetes') {
            filter.sugar = { $lte: 10 };
        } else if (health === 'heart_disease') {
            filter.fats = { $lte: 15 };
            filter.sodium = { $lte: 400 };
        }

        const recommendations = await FoodItem.find(filter).limit(20);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analyze food and suggest alternatives
app.post('/api/food/analyze', async (req, res) => {
    try {
        const { foodName, userGoal, userDiet } = req.body;
        
        // Find the food item
        const foodItem = await FoodItem.findOne({ 
            dish_name: { $regex: foodName, $options: 'i' } 
        });
        
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        
        // Analyze nutritional content
        const analysis = {
            food: foodItem,
            score: calculateFoodScore(foodItem, userGoal),
            concerns: [],
            suggestions: []
        };
        
        // Check for concerns based on user goal
        if (userGoal === 'weight_loss' && foodItem.calories_kcal > 400) {
            analysis.concerns.push('High calorie content for weight loss');
            analysis.suggestions.push('Consider lower calorie alternatives');
        }
        
        if (userGoal === 'muscle_building' && foodItem.protein_g < 15) {
            analysis.concerns.push('Low protein content for muscle building');
            analysis.suggestions.push('Consider higher protein alternatives');
        }
        
        if (foodItem.free_sugar_g > 10) {
            analysis.concerns.push('High sugar content');
        }
        
        if (foodItem.sodium_mg > 500) {
            analysis.concerns.push('High sodium content');
        }
        
        // Find alternatives if score is low (< 75%)
        if (analysis.score < 75) {
            analysis.alternatives = await findAlternatives(foodItem, userGoal, userDiet);
        }
        
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function calculateFoodScore(foodItem, userGoal) {
    let score = 100;
    
    // Deduct points based on nutritional content and user goal
    if (userGoal === 'weight_loss') {
        if (foodItem.calories_kcal > 500) score -= 30;
        else if (foodItem.calories_kcal > 300) score -= 15;
        
        if (foodItem.fibre_g < 2) score -= 10;
        if (foodItem.fats_g > 20) score -= 10;
    }
    
    if (userGoal === 'muscle_building') {
        if (foodItem.protein_g < 10) score -= 20;
        if (foodItem.calories_kcal < 200) score -= 10;
    }
    
    if (userGoal === 'diabetes') {
        if (foodItem.free_sugar_g > 10) score -= 25;
        if (foodItem.carbohydrates_g > 50) score -= 15;
    }
    
    // General health deductions
    if (foodItem.free_sugar_g > 15) score -= 15;
    if (foodItem.sodium_mg > 1000) score -= 15;
    if (foodItem.fats_g > 25) score -= 10;
    
    return Math.max(0, score);
}

async function findAlternatives(originalFood, userGoal, userDiet) {
    let filter = {
        _id: { $ne: originalFood._id },
        food_type: originalFood.food_type
    };
    
    if (userDiet === 'vegetarian') {
        filter.suitable_for = 'vegetarian';
    } else if (userDiet === 'vegan') {
        filter.suitable_for = 'vegan';
    }
    
    // Adjust filters based on goal
    if (userGoal === 'weight_loss') {
        filter.calories_kcal = { $lt: originalFood.calories_kcal };
        filter.fibre_g = { $gte: originalFood.fibre_g };
    } else if (userGoal === 'muscle_building') {
        filter.protein_g = { $gt: originalFood.protein_g };
    } else if (userGoal === 'diabetes') {
        filter.free_sugar_g = { $lt: originalFood.free_sugar_g };
        filter.carbohydrates_g = { $lt: originalFood.carbohydrates_g };
    }
    
    return await FoodItem.find(filter).limit(5);
}

// Authentication endpoints
app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Passwords do not match' });
  }
  
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email is already in use. Please login or use a different email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        req.session.userId = user._id;
        res.json({ success: true, redirect: '/preferences' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.json({ success: false, message: 'Email is already in use. Please login or use a different email.' });
        }
        res.json({ success: false, message: 'Registration failed' });
    }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
    User.findOne({ email }).lean().exec().then(async (user) => { // .lean() is not necessary here as we get a plain object with exec()
        if (!user) return res.json({ success: false, message: 'Invalid credentials' });
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
            req.session.userId = user._id;
            if (user.age && user.height && user.weight) {
                return res.json({ success: true, redirect: '/dashboard' });
            } else {
                return res.json({ success: true, redirect: '/preferences' });
            }
        } else {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
    }).catch(err => {
        console.error('Login error:', err);
        res.json({ success: false, message: 'Invalid credentials' });
    });
});

// Preferences endpoint
app.post('/save-preferences', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }
  
  const { age, height, weight, dietPreference, healthConditions, fitnessGoal, allergies } = req.body;
  
  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
    User.findByIdAndUpdate(req.session.userId, {
        age, height, weight, 
        bmi: Number(bmi.toFixed(2)), 
        diet_preference: dietPreference,
        health_conditions: healthConditions, 
        fitness_goal: fitnessGoal, 
        allergies
    }, { new: true })
    .then((updatedUser) => {
        res.json({ success: true, redirect: '/dashboard' });
    }).catch(err => {
        console.error('Error saving preferences:', err);
        res.json({ success: false, message: 'Failed to save preferences' });
    });
});

// Enhanced food analysis with local database matching
app.post('/analyze-food', (req, res) => {
  if (!req.session.userId) {
      return res.json({ success: false, message: 'Not authenticated' });
  }
  
  const { foodInput, inputMethod } = req.body;
  
  // Get user preferences for personalized analysis
  User.findById(req.session.userId).lean().exec().then((user) => {
      if (!user) return res.json({ success: false, message: 'User not found' });

      analyzeFoodItem(foodInput, user, async (analysisResult) => {
          try {
              // Save analysis history and wait for completion
              await AnalysisHistory.create({
                  user_id: req.session.userId,
                  food_name: analysisResult.foodName,
                  match_percentage: analysisResult.matchPercentage,
                  analysis_result: analysisResult,
                  created_at: new Date()
              });
              console.log(`✓ History saved for ${analysisResult.foodName}`);
              res.json({ success: true, analysis: analysisResult });
          } catch (err) {
              console.error('Error saving analysis history:', err);
              // Still return success even if history save fails (user gets data)
              res.json({ success: true, analysis: analysisResult });
          }
      });
  }).catch(err => {
    console.error('Analyze-food user lookup error:', err);
    res.json({ success: false, message: 'User not found' });
  });
});

// Smart food analysis algorithm
function analyzeFoodItem(foodInput, userPreferences, callback) {
  const searchTerms = foodInput.toLowerCase().split(' ');
  
  // Query database for matching foods
  const searchPattern = new RegExp(searchTerms[0], 'i');
  FoodItem.find({ $or: [{ food_name: searchPattern }, { food_type: searchPattern }] }).limit(5).lean().exec().then((foodResults) => {
      if (!foodResults || foodResults.length === 0) {
          const fallbackResult = createIntelligentAnalysis(foodInput, userPreferences);
          callback(fallbackResult);
          return;
      }

      const bestMatch = foodResults[0];
      const matchPercentage = calculateMatchPercentage(bestMatch, userPreferences);

      const analysisResult = {
          foodName: bestMatch.food_name,
          foodType: bestMatch.food_type,
          matchPercentage: matchPercentage,
          calories: bestMatch.calories,
          protein: bestMatch.protein,
          carbs: bestMatch.carbs,
          fats: bestMatch.fats,
          fiber: bestMatch.fiber,
          sugar: bestMatch.sugar,
          sodium: bestMatch.sodium,
          cholesterol: bestMatch.cholesterol,
          vitamins: JSON.parse(bestMatch.vitamins || '[]'),
          minerals: JSON.parse(bestMatch.minerals || '[]'),
          healthBenefits: bestMatch.health_benefits,
          needsAlteration: matchPercentage < 75,
          allergens: JSON.parse(bestMatch.allergens || '[]'),
          isEstimated: false
      };

      if (analysisResult.needsAlteration) {
          // If score is low, find healthier alternatives instead of generic alterations
          findFoodAlternatives(bestMatch, userPreferences, (alternatives) => {
              analysisResult.alternatives = alternatives;
              callback(analysisResult);
          });
      } else {
          callback(analysisResult);
      }
  }).catch(err => {
      console.error('Food lookup error:', err);
      const fallbackResult = createIntelligentAnalysis(foodInput, userPreferences);
      callback(fallbackResult);
  });
}

// Find healthier food alternatives based on user profile
async function findFoodAlternatives(originalFood, user, callback) {
    const filter = {
        _id: { $ne: originalFood._id }, // Not the same food
        calories: { $lte: originalFood.calories }, // Healthier means less or equal calories generally
    };

    // Filter by diet preference
    if (user.diet_preference && user.diet_preference !== 'balanced') {
        filter.suitable_for = { $regex: new RegExp(user.diet_preference, 'i') };
    }

    // Adjust filter based on fitness goal
    if (user.fitness_goal === 'weight_loss') {
        filter.calories = { $lt: originalFood.calories }; // Strictly less calories
    } else if (user.fitness_goal === 'muscle_building') {
        filter.protein = { $gt: originalFood.protein }; // More protein
    }

    // Adjust for health conditions
    if (user.health_conditions && user.health_conditions.includes('diabetes')) {
        filter.sugar = { $lt: originalFood.sugar };
    }
    if (user.health_conditions && user.health_conditions.includes('hypertension')) {
        filter.sodium = { $lt: originalFood.sodium };
    }

    const alternatives = await FoodItem.find(filter).sort({ calories: 1, protein: -1 }).limit(3).lean().exec();
    callback(alternatives);
}

// Calculate how well food matches user preferences
function calculateMatchPercentage(foodItem, userPreferences) {
  let score = 100;
  const suitableFor = JSON.parse(foodItem.suitable_for || '[]');
  
  // Diet preference matching
  if (userPreferences.diet_preference) {
      if (!suitableFor.includes(userPreferences.diet_preference)) {
          score -= 30;
      }
  }
  
  // Health conditions consideration
  if (userPreferences.health_conditions) {
      const conditions = userPreferences.health_conditions.split(',').map(c => c.trim());
      conditions.forEach(condition => {
          const conditionKey = condition.toLowerCase().replace(' ', '_');
          if (!suitableFor.includes(conditionKey)) {
              score -= 15;
          }
      });
  }
  
  // Fitness goal alignment
  if (userPreferences.fitness_goal === 'weight_loss' && foodItem.calories > 400) {
      score -= 20;
  } else if (userPreferences.fitness_goal === 'weight_gain' && foodItem.calories < 200) {
      score -= 10;
  } else if (userPreferences.fitness_goal === 'muscle_building' && foodItem.protein < 20) {
      score -= 15;
  }
  
  // Allergies check
  if (userPreferences.allergies) {
      const allergens = JSON.parse(foodItem.allergens || '[]');
      const userAllergies = userPreferences.allergies.toLowerCase().split(',').map(a => a.trim());
      
      userAllergies.forEach(allergy => {
          if (allergens.some(allergen => allergen.toLowerCase().includes(allergy))) {
              score -= 50; // Major penalty for allergens
          }
      });
  }
  
  return Math.max(0, Math.min(100, score));
}

// Intelligent analysis when no database match found
function createIntelligentAnalysis(foodInput, userPreferences) {
  const foodLower = foodInput.toLowerCase();
  
  // Basic nutrition estimation based on food type
  let estimatedNutrition = {
      calories: 250,
      protein: 15,
      carbs: 30,
      fats: 10,
      fiber: 3,
      sugar: 5,
      sodium: 100,
      cholesterol: 50
  };
  
  // Adjust based on food keywords
  if (foodLower.includes('salad') || foodLower.includes('vegetable')) {
      estimatedNutrition = { calories: 180, protein: 8, carbs: 20, fats: 8, fiber: 5, sugar: 4, sodium: 50, cholesterol: 0 };
  } else if (foodLower.includes('chicken') || foodLower.includes('fish') || foodLower.includes('meat')) {
      estimatedNutrition = { calories: 200, protein: 25, carbs: 2, fats: 10, fiber: 0, sugar: 0, sodium: 80, cholesterol: 70 };
  } else if (foodLower.includes('rice') || foodLower.includes('pasta') || foodLower.includes('bread')) {
      estimatedNutrition = { calories: 200, protein: 5, carbs: 45, fats: 2, fiber: 2, sugar: 1, sodium: 150, cholesterol: 0 };
  } else if (foodLower.includes('burger') || foodLower.includes('pizza') || foodLower.includes('fries')) {
      estimatedNutrition = { calories: 500, protein: 20, carbs: 45, fats: 25, fiber: 3, sugar: 8, sodium: 800, cholesterol: 60 };
  } else if (foodLower.includes('fruit') || foodLower.includes('apple') || foodLower.includes('banana')) {
      estimatedNutrition = { calories: 100, protein: 1, carbs: 25, fats: 0, fiber: 4, sugar: 18, sodium: 2, cholesterol: 0 };
  } else if (foodLower.includes('dairy') || foodLower.includes('milk') || foodLower.includes('cheese')) {
      estimatedNutrition = { calories: 150, protein: 8, carbs: 12, fats: 8, fiber: 0, sugar: 10, sodium: 120, cholesterol: 30 };
  }
  
  const matchPercentage = 65 + Math.random() * 20; // 65-85% for estimated foods
  
  return {
      foodName: foodInput,
      foodType: 'Estimated Analysis',
      matchPercentage: Math.floor(matchPercentage),
      ...estimatedNutrition,
      vitamins: ['Vitamin C', 'Various Vitamins'],
      minerals: ['Potassium', 'Various Minerals'],
      healthBenefits: 'General nutritional value',
      needsAlteration: matchPercentage < 75,
      alteration: matchPercentage < 75 ? generateGeneralAlteration(foodInput, userPreferences) : null,
      isEstimated: true
  };
}

// Smart recipe alteration generator
function generateRecipeAlteration(foodItem, userPreferences, matchPercentage) {
  const alterations = [];
  const foodName = foodItem.food_name.toLowerCase();
  
  // Diet-specific alterations
  if (userPreferences.diet_preference === 'vegetarian' && foodItem.food_type === 'Meat') {
      alterations.push("Replace meat with tofu, tempeh, or legumes for vegetarian option");
  }
  
  if (userPreferences.diet_preference === 'vegan' && (foodItem.food_type === 'Meat' || foodItem.food_type === 'Dairy')) {
      alterations.push("Use plant-based alternatives - tofu instead of meat, nut milk instead of dairy");
  }
  
  if (userPreferences.diet_preference === 'keto' && foodItem.carbs > 10) {
      alterations.push("Reduce carbohydrate content and increase healthy fats for keto diet");
  }
  
  // Health condition alterations
  if (userPreferences.health_conditions && userPreferences.health_conditions.includes('diabetes')) {
      if (foodItem.sugar > 5 || foodItem.carbs > 25) {
          alterations.push("Reduce sugar and carbohydrate content for better blood sugar management");
      }
  }
  
  if (userPreferences.health_conditions && userPreferences.health_conditions.includes('hypertension')) {
      if (foodItem.sodium > 100) {
          alterations.push("Use herbs and spices instead of salt to manage blood pressure");
      }
  }
  
  // Fitness goal alterations
  if (userPreferences.fitness_goal === 'weight_loss') {
      if (foodItem.calories > 300) {
          alterations.push("Reduce portion size and add more vegetables to lower calorie density");
      }
  }
  
  if (userPreferences.fitness_goal === 'muscle_building') {
      if (foodItem.protein < 20) {
          alterations.push("Add lean protein sources like chicken breast, fish, or legumes");
      }
  }
  
  // General healthy alterations
  if (foodItem.fats > 15) {
      alterations.push("Use cooking methods like baking, steaming, or grilling instead of frying");
  }
  
  if (foodItem.fiber < 5) {
      alterations.push("Add more fiber-rich vegetables or whole grains");
  }
  
  // If no specific alterations, provide general advice
  if (alterations.length === 0) {
      alterations.push("Consider adding more colorful vegetables for enhanced nutrition");
      alterations.push("Use herbs and spices instead of salt for flavor");
      alterations.push("Opt for steaming or baking instead of frying");
  }
  
  return alterations.slice(0, 3); // Return top 3 alterations
}

function generateGeneralAlteration(foodInput, userPreferences) {
  const alterations = [];
  
  if (userPreferences.fitness_goal === 'weight_loss') {
      alterations.push("Reduce portion size and pair with a large salad");
  }
  
  if (userPreferences.diet_preference === 'vegetarian' && foodInput.toLowerCase().includes('chicken')) {
      alterations.push("Replace chicken with grilled tofu or tempeh");
  }
  
  alterations.push("Add a variety of colorful vegetables for balanced nutrition");
  alterations.push("Use healthy cooking methods like steaming or baking");
  
  return alterations.slice(0, 2);
}

// Get user analysis history
app.get('/analysis-history', (req, res) => {
  if (!req.session.userId) {
      return res.json({ success: false, message: 'Not authenticated' });
  }
  AnalysisHistory.find({ user_id: req.session.userId }).sort({ created_at: -1 }).limit(10).lean().exec().then(results => {
      const history = results.map(row => ({
          foodName: row.food_name,
          matchPercentage: row.match_percentage,
          analysis: row.analysis_result,
          date: row.created_at
      }));
      res.json({ success: true, history });
  }).catch(err => {
      console.error('Analysis history error:', err);
      res.json({ success: false, message: 'Failed to load history' });
  });
});

// Get user analytics
app.get('/user-analytics', (req, res) => {
  if (!req.session.userId) {
      return res.json({ success: false, message: 'Not authenticated' });
  }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    AnalysisHistory.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(req.session.userId), created_at: { $gte: sevenDaysAgo } } },
        { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                total_analyses: { $sum: 1 },
                avg_match: { $avg: '$match_percentage' },
                low_matches: { $sum: { $cond: [{ $lt: ['$match_percentage', 75] }, 1, 0] } }
        }},
        { $sort: { '_id': -1 } }
    ]).then(results => {
        const totalAnalyses = results.reduce((s, r) => s + r.total_analyses, 0);
        const avgMatch = results.length > 0 ? (results.reduce((s,r) => s + r.avg_match, 0) / results.length).toFixed(1) : 0;
        const lowMatches = results.reduce((s, r) => s + r.low_matches, 0);
        const today = new Date().toISOString().split('T')[0];
        const todayAnalyses = results.find(r => r._id === today);
        res.json({ success: true, analytics: {
            totalAnalyses,
            avgMatch,
            lowMatches,
            analysesToday: todayAnalyses ? todayAnalyses.total_analyses : 0,
            weeklyData: results
        }});
    }).catch(err => {
        console.error('Analytics error:', err);
        res.json({ success: false, message: 'Failed to load analytics' });
    });
});

// Get user data endpoint
app.get('/user-data', (req, res) => {
  if (!req.session.userId) {
      return res.json({ success: false, message: 'Not authenticated' });
  }
    User.findById(req.session.userId, 'username email age height weight bmi diet_preference health_conditions fitness_goal allergies').lean().exec().then(user => {
        if (!user) return res.json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    }).catch(err => {
        console.error('User data error:', err);
        res.json({ success: false, message: 'User not found' });
    });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.json({ success: false, message: 'Logout failed' });
      }
      res.json({ success: true, redirect: '/' });
  });
});

// Image analysis endpoint (simulated - no external API)
app.post('/analyze-image', (req, res) => {
  if (!req.session.userId) {
      return res.json({ success: false, message: 'Not authenticated' });
  }

  const { imageData } = req.body;

  try {
      // Simulate image analysis - in real implementation, you'd use a local ML model
      // For now, we'll return some common food items based on image simulation
      const simulatedFoods = [
          'chicken salad', 'fruit plate', 'vegetable soup', 'sandwich', 
          'pasta dish', 'rice bowl', 'smoothie', 'pizza slice'
      ];
      
      const randomFood = simulatedFoods[Math.floor(Math.random() * simulatedFoods.length)];
      
      res.json({ 
          success: true, 
          identifiedFoods: [randomFood],
          confidence: 0.85,
          message: 'Image analyzed successfully (simulated)'
      });
  } catch (error) {
      console.error('Image analysis error:', error);
      res.json({ success: false, message: 'Image analysis failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`NutriScan server running at http://localhost:${port}`);
    console.log(`Make sure MongoDB is running and the database '${mongoUri}' is reachable`);
});

// Simple search endpoint for frontend compatibility
app.get('/search-food', (req, res) => {
    const q = req.query.query || '';
    if (!q) return res.json({ success: true, results: [] });
    const pattern = new RegExp(q.split(' ')[0], 'i');
    FoodItem.find({ $or: [{ food_name: pattern }, { food_type: pattern }] }).limit(10).lean().exec()
        .then(results => res.json({ success: true, results }))
        .catch(err => { console.error('Search error:', err); res.json({ success: false, results: [], message: 'Search failed' }); });
});

// Get food by id
app.get('/get_food_by_id', (req, res) => {
    const id = req.query.id;
    if (!id) return res.json({ success: false, message: 'Missing id' });
    FoodItem.findById(id).lean().exec().then(item => {
        if (!item) return res.json({ success: false, message: 'Not found' });
        res.json({ success: true, item });
    }).catch(err => { console.error('Get food error:', err); res.json({ success: false, message: 'Error' }); });
});

// Get all foods (limited)
app.get('/get_all_foods', (req, res) => {
    FoodItem.find({}).limit(50).lean().exec().then(items => res.json({ success: true, items }))
        .catch(err => { console.error('Get all foods error:', err); res.json({ success: false, items: [], message: 'Failed' }); });
});
// Add to your existing JavaScript

// Clear all user history
app.delete('/api/history/clear', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    try {
        await AnalysisHistory.deleteMany({ user_id: req.session.userId });
        res.json({ success: true, message: 'All history cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comprehensive Food Search
async function searchFoodItems() {
    const query = document.getElementById('search-input').value;
    const type = document.getElementById('food-type-filter').value;
    const maxCalories = document.getElementById('max-calories').value;

    try {
        const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}&type=${type}&maxCalories=${maxCalories}`);
        const foodItems = await response.json();
        displayFoodResults(foodItems);
    } catch (error) {
        console.error('Error searching food items:', error);
    }
}

function displayFoodResults(foodItems) {
    const resultsContainer = document.getElementById('search-results');
    
    if (foodItems.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No food items found. Try a different search.</div>';
        return;
    }

    resultsContainer.innerHTML = foodItems.map(food => `
        <div class="food-item animate-fade-in">
            <div class="food-header">
                <h4>${food.dish_name}</h4>
                <span class="category-tag">${food.food_type}</span>
            </div>
            <div class="nutrition-facts">
                <div class="nutrition-item">
                    <span class="label">Calories</span>
                    <span class="value">${food.calories_kcal} kcal</span>
                </div>
                <div class="nutrition-item">
                    <span class="label">Protein</span>
                    <span class="value">${food.protein_g}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="label">Carbs</span>
                    <span class="value">${food.carbohydrates_g}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="label">Fats</span>
                    <span class="value">${food.fats_g}g</span>
                </div>
            </div>
            <button onclick="analyzeFood('${food.dish_name}')" class="btn btn-secondary">
                Analyze & Get Alternatives
            </button>
        </div>
    `).join('');
}

// Food Analysis
async function analyzeFood(foodName) {
    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    try {
        const response = await fetch('/api/food/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                foodName: foodName,
                userGoal: userData.goal,
                userDiet: userData.diet
            })
        });
        
        const analysis = await response.json();
        displayFoodAnalysis(analysis);
    } catch (error) {
        console.error('Error analyzing food:', error);
    }
}

function displayFoodAnalysis(analysis) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content flash-card">
            <h3>Food Analysis: ${analysis.food.dish_name}</h3>
            <div class="score-display">
                <h4>Nutrition Score: ${analysis.score}%</h4>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${analysis.score}%"></div>
                    <span>${analysis.score}%</span>
                </div>
            </div>
            
            ${analysis.concerns.length > 0 ? `
                <div class="concerns-section">
                    <h4>Concerns:</h4>
                    <ul>
                        ${analysis.concerns.map(concern => `<li>${concern}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${analysis.alternatives && analysis.alternatives.length > 0 ? `
                <div class="alternatives-section">
                    <h4>Healthier Alternatives:</h4>
                    ${analysis.alternatives.map(alt => `
                        <div class="alternative-item">
                            <strong>${alt.dish_name}</strong>
                            <div class="nutrition-comparison">
                                <span>Calories: ${alt.calories_kcal} kcal</span>
                                <span>Protein: ${alt.protein_g}g</span>
                                <span>Carbs: ${alt.carbohydrates_g}g</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <button onclick="this.closest('.modal').remove()" class="btn btn-primary">
                Close
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .concerns-section, .alternatives-section {
            margin: 1rem 0;
        }
        .alternative-item {
            background: #374151;
            padding: 0.75rem;
            margin: 0.5rem 0;
            border-radius: 0.5rem;
        }
    `;
    document.head.appendChild(style);
}

// Get personalized recommendations
async function getPersonalizedRecommendations() {
    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    try {
        const response = await fetch(`/api/food/recommendations?goal=${userData.goal}&diet=${userData.diet}&health=${userData.health || ''}`);
        const recommendations = await response.json();
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Error getting recommendations:', error);
    }
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');
    
    container.innerHTML = recommendations.map(food => `
        <div class="food-item">
            <h4>${food.dish_name}</h4>
            <div class="nutrition-facts">
                <div class="nutrition-item">
                    <span class="label">Calories</span>
                    <span class="value">${food.calories_kcal} kcal</span>
                </div>
                <div class="nutrition-item">
                    <span class="label">Protein</span>
                    <span class="value">${food.protein_g}g</span>
                </div>
            </div>
            <p><strong>Type:</strong> ${food.food_type}</p>
            <p><strong>Suitable for:</strong> ${food.suitable_for.join(', ')}</p>
        </div>
    `).join('');
}
// Save analysis to history
app.post('/api/history/save', async (req, res) => {
    try {
        const { userId, foodItemId, analysisData, inputMethod, inputData } = req.body;
        
        const historyEntry = new History({
            userId,
            foodItem: foodItemId,
            analysisData,
            inputMethod,
            inputData
        });
        
        await historyEntry.save();
        
        // Populate the food item details
        await historyEntry.populate('foodItem');
        
        res.json({ 
            success: true, 
            history: historyEntry,
            message: 'Analysis saved to history'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get history statistics
app.get('/api/history/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const stats = await History.aggregate([
            { $match: { userId } },
            {
                $facet: {
                    totalAnalyses: [
                        { $count: "count" }
                    ],
                    todayAnalyses: [
                        { $match: { timestamp: { $gte: today } } },
                        { $count: "count" }
                    ],
                    averageMatch: [
                        { $group: { _id: null, avg: { $avg: "$analysisData.matchPercentage" } } }
                    ],
                    byMethod: [
                        { $group: { _id: "$inputMethod", count: { $sum: 1 } } }
                    ],
                    topFoods: [
                        { $group: { _id: "$foodItem", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: "fooditems",
                                localField: "_id",
                                foreignField: "_id",
                                as: "foodDetails"
                            }
                        }
                    ]
                }
            }
        ]);
        
        res.json({
            totalAnalyses: stats[0].totalAnalyses[0]?.count || 0,
            todayAnalyses: stats[0].todayAnalyses[0]?.count || 0,
            averageMatch: Math.round(stats[0].averageMatch[0]?.avg || 0),
            byMethod: stats[0].byMethod,
            topFoods: stats[0].topFoods
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete history entry
app.delete('/api/history/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        await History.findByIdAndDelete(entryId);
        res.json({ success: true, message: 'History entry deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});