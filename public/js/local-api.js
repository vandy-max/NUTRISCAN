class LocalNutriScanAPI {
    constructor() {
        // Adjust the base URL based on your project structure
        this.baseUrl = window.location.origin;
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error during login.' };
        }
    }

    async register(username, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, confirmPassword: password })
            });
            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error during registration.' };
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.baseUrl}/logout`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: 'Network error during logout.' };
        }
    }

    async searchFood(query) {
        try {
            const response = await fetch(`${this.baseUrl}/search-food?query=${encodeURIComponent(query)}`);
            return await response.json();
        } catch (error) {
            console.error('Search error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async analyzeImage(imageFile, description = '') {
        try {
            // For now we send simulated image data as JSON to match the Node backend
            const payload = { imageData: 'simulated', description };
            const response = await fetch(`${this.baseUrl}/analyze-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('Image analysis error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getFoodById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/get_food_by_id?id=${id}`);
            return await response.json();
        } catch (error) {
            console.error('Get food error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getAllFoods() {
        try {
            const response = await fetch(`${this.baseUrl}/get_all_foods`);
            return await response.json();
        } catch (error) {
            console.error('Get all foods error:', error);
            return { success: false, error: 'Network error' };
        }
    }
}

// Initialize global API instance
window.nutriScanAPI = new LocalNutriScanAPI();