// Current step tracking
let currentStep = 1;
const totalSteps = 4;

// DOM Elements
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const alertMessage = document.getElementById('alertMessage');

// Initialize the form
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    calculateBMI();
    initializeOptionCards();
});

// Update progress bar and text
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
}

// Navigation functions
function nextStep() {
    if (validateStep(currentStep)) {
        document.getElementById(`step${currentStep}`).classList.add('hidden');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.remove('hidden');
        updateProgress();
    }
}

function prevStep() {
    document.getElementById(`step${currentStep}`).classList.add('hidden');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    updateProgress();
}

// Validate current step
function validateStep(step) {
    switch(step) {
        case 1:
            const age = document.getElementById('age').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            
            if (!age || !height || !weight) {
                showAlert('Please fill in all personal information');
                return false;
            }
            return true;
            
        case 2:
            const dietSelected = document.querySelector('input[name="dietPreference"]:checked');
            if (!dietSelected) {
                showAlert('Please select a diet preference');
                return false;
            }
            return true;
            
        case 3:
            // Health conditions are optional, so always valid
            return true;
            
        case 4:
            const goalSelected = document.querySelector('input[name="fitnessGoal"]:checked');
            if (!goalSelected) {
                showAlert('Please select a fitness goal');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// BMI Calculation
function calculateBMI() {
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;
    
    if (height && weight) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');
        
        bmiValue.textContent = bmi.toFixed(2);
        
        // Determine BMI category
        let category = '';
        let color = '';
        
        if (bmi < 18.5) {
            category = 'Underweight';
            color = 'text-warning';
        } else if (bmi < 25) {
            category = 'Normal Weight';
            color = 'text-secondary';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = 'text-warning';
        } else {
            category = 'Obese';
            color = 'text-danger';
        }
        
        bmiCategory.textContent = category;
        bmiCategory.className = `text-lg ${color}`;
    }
}

// Adjust value with buttons
function adjustValue(field, change) {
    const input = document.getElementById(field);
    const currentValue = parseInt(input.value);
    const newValue = currentValue + change;
    
    // Set constraints
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
        
        // Update corresponding range slider
        const rangeInput = document.getElementById(field + 'Range');
        if (rangeInput) {
            rangeInput.value = newValue;
        }
        
        // Recalculate BMI if height or weight changed
        if (field === 'height' || field === 'weight') {
            calculateBMI();
        }
    }
}

// Update from range slider
function updateFromRange(field, value) {
    const input = document.getElementById(field);
    input.value = value;
    
    if (field === 'height' || field === 'weight') {
        calculateBMI();
    }
}

// Initialize option cards with click handlers
function initializeOptionCards() {
    // Diet options
    document.querySelectorAll('.diet-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.diet-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // Health options
    document.querySelectorAll('.health-option').forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
    
    // Goal options
    document.querySelectorAll('.goal-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.goal-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
}

// Show alert message
function showAlert(message, type = 'error') {
    alertMessage.innerHTML = `
        <div class="flash-card border-${type === 'error' ? 'danger' : 'secondary'}/20 bg-${type === 'error' ? 'red' : 'green'}-500/10">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-3 text-${type === 'error' ? 'danger' : 'secondary'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'error' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}"></path>
                </svg>
                <span class="text-${type === 'error' ? 'danger' : 'secondary'}">${message}</span>
            </div>
        </div>
    `;
    alertMessage.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            alertMessage.classList.add('hidden');
        }, 3000);
    }
}

// Form submission
document.getElementById('preferencesForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Collect all form data
    const formData = {
        age: document.getElementById('age').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        dietPreference: document.querySelector('input[name="dietPreference"]:checked')?.value,
        fitnessGoal: document.querySelector('input[name="fitnessGoal"]:checked')?.value,
        allergies: document.getElementById('allergies').value
    };
    
    // Collect health conditions
    const healthConditions = [];
    document.querySelectorAll('input[name="healthConditions"]:checked').forEach(checkbox => {
        healthConditions.push(checkbox.value);
    });
    
    // Add custom health conditions
    const customHealth = document.getElementById('customHealth').value;
    if (customHealth) {
        customHealth.split(',').forEach(condition => {
            const trimmedCondition = condition.trim();
            if (trimmedCondition) healthConditions.push(trimmedCondition);
        });
    }
    
    formData.healthConditions = healthConditions.join(', ');
    
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Saving...';
    
    try {
        const response = await fetch('/save-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Profile completed successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1000);
        } else {
            showAlert(data.message || 'Failed to save preferences');
        }
    } catch (error) {
        showAlert('Network error. Please try again.');
        console.error('Preferences save error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Complete Profile';
    }
});