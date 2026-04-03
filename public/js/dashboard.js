// Global variables
let currentMethod = 'text';
let uploadedImage = null;
let capturedImage = null;
let stream = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    loadDashboardStats();
    loadRecentHistory();
});

// Load user data and profile summary
async function loadUserData() {
    try {
        const response = await fetch('/user-data');
        const result = await response.json();

        if (result.success) {
            document.getElementById('userWelcome').textContent = `Welcome, ${result.user.username}!`;
            updateProfileSummary(result.user);
            // Store for other functions to use
            localStorage.setItem('userProfile', JSON.stringify(result.user));
        } else {
            // If no user data, redirect to login
            window.location.href = '/auth';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Update profile summary
function updateProfileSummary(user) {
    const profileSummary = document.getElementById('profileSummary');

    let html = `
        <div class="flex justify-between">
            <span class="text-gray-400">Age</span>
            <span class="text-white">${user.age || 'Not set'}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Weight</span>
            <span class="text-white">${user.weight || 'Not set'} kg</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Height</span>
            <span class="text-white">${user.height || 'Not set'} cm</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">BMI</span>
            <span class="text-white">${user.bmi || 'Not set'}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Diet</span>
            <span class="text-white">${formatDiet(user.diet_preference)}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Goal</span>
            <span class="text-white">${formatGoal(user.fitness_goal)}</span>
        </div>
        ${user.health_conditions ? `
            <div class="flex justify-between">
                <span class="text-gray-400">Health</span>
                <span class="text-white">${user.health_conditions}</span>
            </div>
        ` : ''}
    `;

    profileSummary.innerHTML = html;
}

function formatDiet(diet) {
    if (!diet) return 'Not set';
    const diets = {
        'vegetarian': 'Vegetarian',
        'non_veg': 'Non-Vegetarian',
        'vegan': 'Vegan',
        'keto': 'Keto',
        'paleo': 'Paleo',
        'mediterranean': 'Mediterranean',
        'balanced': 'Balanced'
    };
    return diets[diet] || diet;
}

function formatGoal(goal) {
    if (!goal) return 'Not set';
    const goals = {
        'weight_loss': 'Weight Loss',
        'weight_gain': 'Weight Gain',
        'muscle_building': 'Muscle Building',
        'maintenance': 'Maintenance',
        'general_health': 'General Health'
    };
    return goals[goal] || goal;
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/user-analytics');
        const result = await response.json();

        if (result.success) {
            const stats = result.analytics;
            // Update UI elements
            document.getElementById('totalAnalyses').textContent = stats.totalAnalyses || '0';
            document.getElementById('analysesToday').textContent = stats.analysesToday || '0';
            document.getElementById('avgMatch').textContent = (stats.avgMatch || '0') + '%';
        } else {
            console.error('Failed to load stats:', result.message);
        }

    } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to basic stats
        document.getElementById('totalAnalyses').textContent = '0';
        document.getElementById('analysesToday').textContent = '0';
        document.getElementById('avgMatch').textContent = '0%';
        document.getElementById('foodsInDatabase').textContent = '1014';
    }
}

// Load recent history
async function loadRecentHistory() {
    try {
        const response = await fetch('/analysis-history');
        const data = await response.json();

        const historyContainer = document.getElementById('recentHistory');

        if (!data.success || data.history.length === 0) {
            historyContainer.innerHTML = '<div class="text-center text-gray-400 py-4">No recent analyses</div>';
            return;
        }

        let html = '<div class="space-y-3">';
        data.history.forEach(entry => {
            const foodName = entry.foodName;
            const match = entry.matchPercentage;
            const date = new Date(entry.date).toLocaleDateString();
            const time = new Date(entry.date).toLocaleTimeString();

            html += `
                <div class="bg-gray-700 rounded-lg p-3 border-l-4 ${match >= 75 ? 'border-secondary' : match >= 50 ? 'border-warning' : 'border-danger'}">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <div class="font-semibold text-white text-sm truncate">${foodName}</div>
                            <div class="text-xs text-gray-400">${date} ${time}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold ${match >= 75 ? 'text-secondary' : match >= 50 ? 'text-warning' : 'text-danger'}">${match}%</div>
                            <div class="text-xs text-gray-400 capitalize">${entry.inputMethod}</div>
                        </div>
                    </div>
                    <button onclick="viewHistoryEntry('${entry.analysis.foodName}')" class="btn btn-secondary btn-sm w-full text-xs">
                        View Details
                    </button>
                </div>
            `;
        });
        html += '</div>';

        historyContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading history:', error);
        const historyContainer = document.getElementById('recentHistory');
        historyContainer.innerHTML = '<div class="text-center text-gray-400 py-4">No recent analyses</div>';
    }
}

// Tab switching for input methods
function switchTab(method) {
    if (currentMethod === 'camera' && method !== 'camera') {
        stopCamera();
    }

    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white');
        btn.classList.add('bg-transparent', 'text-gray-400');
    });

    document.getElementById(method + 'Tab').classList.add('active', 'bg-primary', 'text-white');

    // Update input methods
    document.querySelectorAll('.input-method').forEach(method => {
        method.classList.add('hidden');
    });
    document.getElementById(method + 'Method').classList.remove('hidden');

    currentMethod = method;
}

// Handle image upload
function handleImageUpload(file) {
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showAlert('File size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            document.getElementById('previewImage').src = uploadedImage;
            document.getElementById('uploadPreview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function clearUpload() {
    uploadedImage = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadPreview').classList.add('hidden');
}

// Camera functionality
async function startCamera() {
    const video = document.getElementById('cameraFeed');
    const placeholder = document.getElementById('cameraPlaceholder');
    const controls = document.getElementById('captureControls');
    const preview = document.getElementById('cameraPreview');

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        video.srcObject = stream;
        video.classList.remove('hidden');
        placeholder.classList.add('hidden');
        controls.classList.remove('hidden');
        preview.classList.add('hidden');

        // Play the video
        await video.play();
    } catch (err) {
        console.error("Error accessing camera: ", err);
        showAlert('Could not access the camera. Please ensure you have a camera connected and have granted permission.', 'error');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    const video = document.getElementById('cameraFeed');
    const placeholder = document.getElementById('cameraPlaceholder');
    const controls = document.getElementById('captureControls');
    const preview = document.getElementById('cameraPreview');

    video.classList.add('hidden');
    video.srcObject = null;
    placeholder.classList.remove('hidden');
    controls.classList.add('hidden');

    // Also hide the preview if it's visible
    if (!preview.classList.contains('hidden')) {
        preview.classList.add('hidden');
        capturedImage = null;
    }
}

function capturePhoto() {
    const canvas = document.getElementById('cameraCanvas');
    const video = document.getElementById('cameraFeed');
    const preview = document.getElementById('cameraPreview');
    const capturedImg = document.getElementById('capturedImage');
    const controls = document.getElementById('captureControls');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedImage = canvas.toDataURL('image/jpeg');
    capturedImg.src = capturedImage;

    preview.classList.remove('hidden');
    video.classList.add('hidden');
    controls.classList.add('hidden');

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function retakePhoto() {
    capturedImage = null;
    const preview = document.getElementById('cameraPreview');
    preview.classList.add('hidden');
    startCamera();
}

// Main food analysis function
async function analyzeFood() {
    let inputData = {};

    // Get input based on current method
    switch(currentMethod) {
        case 'text':
            const text = document.getElementById('foodText').value.trim();
            if (!text) {
                showAlert('Please enter a food description', 'error');
                return;
            }
            inputData = { type: 'text', data: text };
            break;

        case 'upload':
            if (!uploadedImage) {
                showAlert('Please upload a food image', 'error');
                return;
            }
            inputData = { type: 'image', data: uploadedImage, source: 'upload' };
            break;

        case 'camera':
            if (!capturedImage) {
                showAlert('Please capture a food image', 'error');
                return;
            }
            inputData = { type: 'image', data: capturedImage, source: 'camera' };
            break;
    }

    const analyzeBtn = document.getElementById('analyzeButton');
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '🔍 Analyzing...';

    try {
        // Send analysis request to backend
        const response = await fetch('/analyze-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                foodInput: inputData.data,
                inputMethod: inputData.type
            })
        });

        const analysisResult = await response.json();

        if (!analysisResult.success) {
            throw new Error(analysisResult.message || 'Analysis failed');
        }

        displayAnalysisResults(analysisResult.analysis);

        // The backend now automatically saves history, so no need to call saveToHistory()
        // Refresh stats and recent history
        loadDashboardStats();
        loadRecentHistory();

    } catch (error) {
        console.error('Analysis error:', error);

        // Fallback to simulation if API fails
        showAlert('Using simulated analysis. Backend connection failed.', 'warning');
        const simulatedResult = await simulateFoodAnalysis(inputData);
        displayAnalysisResults(simulatedResult);
        
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🔍 Analyze Food';
    }
}

// Simulate food analysis (fallback)
async function simulateFoodAnalysis(inputData) {
    console.log("Simulating analysis for:", inputData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis results based on input
    const foodItems = [
        {
            name: 'Grilled Chicken Breast with Steamed Vegetables',
            type: 'Non-Vegetarian',
            calories: 320,
            protein: 35,
            carbs: 12,
            fats: 15,
            vitamins: ['Vitamin B6', 'Vitamin B12', 'Vitamin C'],
            minerals: ['Iron', 'Zinc', 'Potassium'],
            matchPercentage: 85
        },
        {
            name: 'Vegetable Salad with Olive Oil Dressing',
            type: 'Vegetarian',
            calories: 180,
            protein: 8,
            carbs: 20,
            fats: 8,
            vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'],
            minerals: ['Potassium', 'Magnesium'],
            matchPercentage: 92
        },
        {
            name: 'Cheeseburger with French Fries',
            type: 'Non-Vegetarian',
            calories: 750,
            protein: 25,
            carbs: 65,
            fats: 42,
            vitamins: ['Vitamin B12'],
            minerals: ['Calcium', 'Iron'],
            matchPercentage: 45
        }
    ];

    // Randomly select a result for simulation
    const randomResult = foodItems[Math.floor(Math.random() * foodItems.length)];

    if (inputData.type === 'text') {
        if (inputData.data.toLowerCase().includes('salad')) {
            return foodItems[1];
        } else if (inputData.data.toLowerCase().includes('burger')) {
            return foodItems[2];
        }
    }

    return randomResult;
}

// Display analysis results
function displayAnalysisResults(result) {
    const resultsCard = document.getElementById('resultsCard');
    resultsCard.classList.remove('hidden');

    // Scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth' });

    // Update match percentage
    document.getElementById('matchPercentage').textContent = (result.matchPercentage || 0) + '%';

    // Update food identification
    const foodIdentification = document.getElementById('foodIdentification');
    const foodName = result.foodName || 'Unknown Food';
    foodIdentification.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <div class="text-xl font-bold text-white">${foodName}</div>
                <div class="text-gray-400">${result.foodType || 'Unknown'}</div>
            </div>
            <div class="text-3xl">${getFoodEmoji(foodName)}</div>
        </div>
    `;

    // Update macronutrients
    const macronutrients = document.getElementById('macronutrients');
    const calories = result.calories || 0;
    const protein = result.protein || 0;
    const carbs = result.carbs || 0;
    const fats = result.fats || 0;

    macronutrients.innerHTML = `
        <div class="flex justify-between">
            <span class="text-gray-400">Calories</span>
            <span class="text-white font-bold">${calories} kcal</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Protein</span>
            <span class="text-primary font-bold">${protein}g</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Carbohydrates</span>
            <span class="text-warning font-bold">${carbs}g</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-400">Fats</span>
            <span class="text-danger font-bold">${fats}g</span>
        </div>
    `;

    // Update micronutrients
    const micronutrients = document.getElementById('micronutrients');
    const vitamins = result.vitamins || [];
    const minerals = result.minerals || [];

    micronutrients.innerHTML = vitamins.map(vitamin => `
        <div class="flex justify-between">
            <span class="text-gray-400">${vitamin}</span>
            <span class="text-secondary font-bold">Good</span>
        </div>
    `).join('') + minerals.map(mineral => `
        <div class="flex justify-between">
            <span class="text-gray-400">${mineral}</span>
            <span class="text-secondary font-bold">Good</span>
        </div>
    `).join('');

    // Show recipe alteration if match < 75%
    const recipeAlteration = document.getElementById('recipeAlteration');
    if (result.needsAlteration && result.alternatives && result.alternatives.length > 0) {
        recipeAlteration.classList.remove('hidden');
        let alternativesHtml = '<ul>';
        result.alternatives.forEach(alt => {
            alternativesHtml += `
                <li class="bg-gray-700 rounded-lg p-3 mb-2 border border-gray-600 hover:border-secondary transition-colors">
                    <div class="flex justify-between items-center">
                        <div class="font-semibold text-white">${alt.food_name}</div>
                        <button onclick="analyzeSpecificFood('${alt.food_name}')" class="btn btn-secondary btn-sm text-xs">Analyze</button>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                        <span>${alt.calories} kcal</span> | 
                        <span>${alt.protein}g protein</span> | 
                        <span>${alt.fats}g fat</span>
                    </div>
                </li>
            `;
        });
        alternativesHtml += '</ul>';
        document.getElementById('alterationDetails').innerHTML = alternativesHtml;
        // Change the title to reflect alternatives
        recipeAlteration.querySelector('h3').textContent = '🍽️ Healthier Alternatives';
    } else if (result.needsAlteration) {
        // Fallback to generic alteration if no alternatives are found
        recipeAlteration.classList.remove('hidden');
        document.getElementById('alterationDetails').innerHTML = getRecipeAlteration(result);
        recipeAlteration.querySelector('h3').textContent = '🍳 Recommended Recipe Alteration';
    } else {
        recipeAlteration.classList.add('hidden');
    }
}

// Get food emoji based on food name
function getFoodEmoji(foodName) {
    if (foodName.toLowerCase().includes('chicken')) return '🍗';
    if (foodName.toLowerCase().includes('salad')) return '🥗';
    if (foodName.toLowerCase().includes('burger')) return '🍔';
    if (foodName.toLowerCase().includes('vegetable')) return '🥦';
    if (foodName.toLowerCase().includes('rice')) return '🍚';
    if (foodName.toLowerCase().includes('fruit')) return '🍎';
    if (foodName.toLowerCase().includes('fish')) return '🐟';
    return '🍽️';
}

// Get recipe alteration suggestions
function getRecipeAlteration(result) {
    const alterations = [
        "Replace with lean protein sources like grilled chicken or fish",
        "Add more leafy greens and colorful vegetables",
        "Use olive oil instead of butter for cooking",
        "Reduce portion size and add a side salad",
        "Choose whole grain options instead of refined carbs",
        "Steam or bake instead of frying",
        "Add herbs and spices instead of salt for flavor",
        "Include more fiber-rich foods for better digestion",
        "Opt for low-fat dairy alternatives",
        "Increase protein content with legumes or lean meats"
    ];

    if (result.alteration && result.alteration.length > 0) {
        return `<ul>${result.alteration.map(a => `<li>${a}</li>`).join('')}</ul>`;
    }
    return `<ul><li>${alterations[Math.floor(Math.random() * alterations.length)]}</li></ul>`;
}

// Helper functions for analysis
function getCurrentInputMethod() {
    if (document.getElementById('textMethod').classList.contains('hidden') === false) return 'text';
    if (document.getElementById('uploadMethod').classList.contains('hidden') === false) return 'image';
    if (document.getElementById('cameraMethod').classList.contains('hidden') === false) return 'camera';
    return 'text';
}

function getInputData() {
    const method = getCurrentInputMethod();
    if (method === 'text') return document.getElementById('foodText').value;
    if (method === 'image') return document.getElementById('previewImage')?.src || '';
    if (method === 'camera') return document.getElementById('capturedImage')?.src || '';
    return '';
}

function getUserGoal() {
    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return userData.fitness_goal || 'general_health';
}

function getUserDiet() {
    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return userData.diet_preference || 'balanced';
}

// Navigation functions
function showProfile() {
    window.location.href = 'preferences.html';
}

function showHistory() {
    window.location.href = 'history.html';
}

async function logout() {
    const result = await window.nutriScanAPI.logout();
    if (result.success) {
        localStorage.clear();
        window.location.href = result.redirect;
    } else {
        showAlert(result.message || 'Logout failed', 'danger');
    }
}

// Personalized Recommendations
async function getPersonalizedRecommendations() {
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '<div class="text-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div><p class="mt-2 text-gray-400">Finding recommendations...</p></div>';

    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');

    try {
        const response = await fetch(`/api/food/recommendations?goal=${userData.fitness_goal}&diet=${userData.diet_preference}&health=${userData.health_conditions || ''}`);
        const recommendations = await response.json();
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Recommendations error:', error);
        container.innerHTML = '<div class="text-center text-danger py-4">Error loading recommendations</div>';
    }
}

function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations-container');

    if (recommendations.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-4">No recommendations found. Update your profile for better suggestions.</div>';
        return;
    }

    let html = '<div class="space-y-3">';
    recommendations.slice(0, 4).forEach(food => {
        html += `
            <div class="bg-gray-700 rounded-lg p-3 border border-secondary/20">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-bold text-white text-sm">${food.food_name}</h4>
                        <span class="text-xs text-gray-400">${food.food_type}</span>
                    </div>
                    <span class="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">${food.calories} kcal</span>
                </div>
                <div class="text-xs text-gray-300 space-y-1">
                    <div>Protein: ${food.protein}g | Carbs: ${food.carbs}g</div>
                </div>
                <button onclick="analyzeSpecificFood('${food.food_name}')" class="btn btn-secondary btn-sm w-full mt-3 text-xs">
                    Analyze
                </button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function analyzeSpecificFood(foodName) {
    document.getElementById('foodText').value = foodName;
    // Scroll to top and switch to text tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switchTab('text');
    // Give a small delay for the tab to switch before analyzing
    setTimeout(() => {
        analyzeFood();
    }, 100);
}


// Alert system
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    const bgColor = type === 'error' ? 'bg-red-500/10' : type === 'warning' ? 'bg-yellow-500/10' : 'bg-green-500/10';
    const borderColor = type === 'error' ? 'border-red-500/20' : type === 'warning' ? 'border-yellow-500/20' : 'border-green-500/20';
    const textColor = type === 'error' ? 'text-red-400' : type === 'warning' ? 'text-yellow-400' : 'text-green-400';

    alertDiv.innerHTML = `
        <div class="flash-card ${borderColor} ${bgColor} min-w-80">
            <div class="flex items-center">
                <span class="${textColor}">${message}</span>
            </div>
        </div>
    `;
    alertDiv.classList.remove('hidden');

    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

// History management functions
async function viewHistoryEntry(entryId) {
    try {
        const response = await fetch(`/api/history/entry/${entryId}`);
        const entry = await response.json();

        // Show detailed view in a modal
        showHistoryDetailsModal(entry);
    } catch (error) {
        console.error('Error loading history entry:', error);
        showAlert('Error loading history details', 'error');
    }
}

// Show history details modal
function showHistoryDetailsModal(entry) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-cardbg rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-white">Analysis Details</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                    ✕
                </button>
            </div>

            <div class="space-y-4">
                <!-- Food Info -->
                <div class="bg-gray-700 rounded-lg p-4">
                    <h4 class="font-semibold text-white mb-2">Food Item</h4>
                    <p class="text-lg text-primary">${entry.foodItem.dish_name}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${entry.foodItem.food_type}</span>
                        <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${entry.inputMethod}</span>
                        <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                            ${new Date(entry.timestamp).toLocaleString()}
                        </span>
                    </div>
                </div>

                <!-- Match Score -->
                <div class="text-center">
                    <div class="inline-block bg-gray-700 rounded-full p-6 border-4 ${entry.analysisData.matchPercentage >= 75 ? 'border-secondary' : entry.analysisData.matchPercentage >= 50 ? 'border-warning' : 'border-danger'}">
                        <div class="text-3xl font-bold ${entry.analysisData.matchPercentage >= 75 ? 'text-secondary' : entry.analysisData.matchPercentage >= 50 ? 'text-warning' : 'text-danger'}">
                            ${entry.analysisData.matchPercentage}%
                        </div>
                        <div class="text-gray-400 text-sm">Profile Match</div>
                    </div>
                </div>

                <!-- Nutritional Info -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center bg-gray-700 rounded-lg p-3">
                        <div class="text-lg font-bold text-white">${entry.foodItem.calories_kcal}</div>
                        <div class="text-gray-400 text-sm">Calories</div>
                    </div>
                    <div class="text-center bg-gray-700 rounded-lg p-3">
                        <div class="text-lg font-bold text-white">${entry.foodItem.protein_g}g</div>
                        <div class="text-gray-400 text-sm">Protein</div>
                    </div>
                    <div class="text-center bg-gray-700 rounded-lg p-3">
                        <div class="text-lg font-bold text-white">${entry.foodItem.carbohydrates_g}g</div>
                        <div class="text-gray-400 text-sm">Carbs</div>
                    </div>
                    <div class="text-center bg-gray-700 rounded-lg p-3">
                        <div class="text-lg font-bold text-white">${entry.foodItem.fats_g}g</div>
                        <div class="text-gray-400 text-sm">Fats</div>
                    </div>
                </div>

                <!-- Concerns & Suggestions -->
                ${entry.analysisData.concerns && entry.analysisData.concerns.length > 0 ? `
                    <div class="bg-warning/10 border border-warning/20 rounded-lg p-4">
                        <h4 class="font-semibold text-warning mb-2">Concerns</h4>
                        <ul class="list-disc list-inside text-warning/80 text-sm space-y-1">
                            ${entry.analysisData.concerns.map(concern => `<li>${concern}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${entry.analysisData.suggestions && entry.analysisData.suggestions.length > 0 ? `
                    <div class="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                        <h4 class="font-semibold text-secondary mb-2">Suggestions</h4>
                        <ul class="list-disc list-inside text-secondary/80 text-sm space-y-1">
                            ${entry.analysisData.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="flex gap-2 mt-6">
                <button onclick="reanalyzeFood('${entry.foodItem.dish_name}')" class="btn btn-primary flex-1">
                    Re-analyze
                </button>
                <button onclick="deleteHistoryEntry('${entry._id}')" class="btn btn-danger">
                    Delete
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Delete history entry
async function deleteHistoryEntry(entryId) {
    if (!confirm('Are you sure you want to delete this history entry?')) return;

    try {
        const response = await fetch(`/api/history/${entryId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('History entry deleted', 'success');
            // Close modal and refresh
            document.querySelector('.fixed').remove();
            loadRecentHistory();
            loadDashboardStats();
        }
    } catch (error) {
        console.error('Error deleting history:', error);
        showAlert('Error deleting history entry', 'error');
    }
}

// Clear all history
async function clearHistory() {
    if (!confirm('Are you sure you want to clear all your history? This action cannot be undone.')) return;

    try {
        const userId = localStorage.getItem('userId') || 'user-' + Date.now();

        const response = await fetch(`/api/history/clear/${userId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showAlert('All history cleared', 'success');
            loadRecentHistory();
            loadDashboardStats();
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        showAlert('Error clearing history', 'error');
    }
}

// Export data
async function exportData() {
    try {
        const userId = localStorage.getItem('userId') || 'user-' + Date.now();

        const response = await fetch(`/api/history/${userId}?limit=1000`);
        const data = await response.json();

        // Create CSV content
        let csv = 'Date,Food Item,Match Percentage,Calories,Protein (g),Carbs (g),Fats (g),Input Method\n';

        data.history.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleDateString();
            const food = entry.foodItem;

            csv += `"${date}","${food.dish_name}",${entry.analysisData.matchPercentage},${food.calories_kcal},${food.protein_g},${food.carbohydrates_g},${food.fats_g},${entry.inputMethod}\n`;
        });

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nutriscan-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showAlert('Data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', 'error');
    }
}

// Re-analyze food from history
function reanalyzeFood(foodName) {
    document.getElementById('foodText').value = foodName;
    document.querySelector('.fixed')?.remove(); // Close modal if open
    switchTab('text');
    analyzeFood();
}

// Quick Actions
function exportData() {
    showAlert('Export feature coming soon!', 'success');
}

// Add to favorites
async function addToFavorites(foodId) {
    try {
        const response = await fetch('/api/favorites/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: localStorage.getItem('userId') || 'user-' + Date.now(),
                foodItemId: foodId
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('Added to favorites!', 'success');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showAlert('Error adding to favorites', 'error');
    }
}