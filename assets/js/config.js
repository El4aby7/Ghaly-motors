/**
 * Ghaly Motors - Configuration File
 * Central location for app configuration and constants
 */

const CONFIG = {
    // API Configuration
    API: {
        vehicles: 'assets/data/vehicles.json',
    },

    // Storage Keys
    STORAGE: {
        favorites: 'ghalyMotorsFavorites',
        compareList: 'ghalyMotorsCompareList',
        userPreferences: 'ghalyMotorsPreferences',
    },

    // UI Configuration
    UI: {
        maxCompareItems: 3,
        toastDuration: 3000,
        animationDuration: 300,
    },

    // Business Configuration
    BUSINESS: {
        companyName: 'Ghaly Motors',
        currency: 'L.E',
    },

    // Filter Options
    FILTERS: {
        makes: ['BMW', 'Mercedes-Benz', 'Land Rover', 'BYD'],
        types: ['SUV', 'Sedan', 'Truck', 'Coupe'],
        sortOptions: [
            { value: 'popularity', label: 'Popularity' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'year-new', label: 'Newest First' },
            { value: 'mileage-low', label: 'Lowest Mileage' },
        ],
    },

    // Feature Flags
    FEATURES: {
        enableComparison: true,
        enableFavorites: true,
        enableSharing: true,
        enableTestDrive: true,
        enableContactForm: true,
    },

    // Color Codes
    COLORS: {
        primary: '#ea2a33',
        actionBlue: '#007AFF',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
    },

    // Validation Rules
    VALIDATION: {
        minNameLength: 2,
        maxNameLength: 50,
        phonePattern: /^[0-9\s\-\+\(\)]{10,}$/,
        emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
