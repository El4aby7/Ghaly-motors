/**
 * Ghaly Motors - Utility Functions
 * Common helper functions used across the application
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'success', duration = CONFIG.UI.toastDuration) {
    const toast = document.createElement('div');
    const bgColor = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500'
    }[type] || 'bg-emerald-500';

    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-lg text-white font-bold z-50 animate-in fade-in ${bgColor}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

/**
 * Format currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `${CONFIG.BUSINESS.currency}${amount.toLocaleString()}`;
}

/**
 * Format number with thousands separator
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

/**
 * Set query parameter in URL without reload
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(param, value) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(param, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    return CONFIG.VALIDATION.emailPattern.test(email);
}

/**
 * Validate phone
 * @param {string} phone - Phone to validate
 * @returns {boolean} Whether phone is valid
 */
function validatePhone(phone) {
    return CONFIG.VALIDATION.phonePattern.test(phone);
}

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {boolean} Whether name is valid
 */
function validateName(name) {
    return name.length >= CONFIG.VALIDATION.minNameLength && name.length <= CONFIG.VALIDATION.maxNameLength;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} Clipboard copy promise
 */
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(err => {
        showToast('Failed to copy', 'error');
        console.error('Clipboard error:', err);
    });
}

/**
 * Get local storage item
 * @param {string} key - Storage key
 * @returns {any} Stored value
 */
function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
}

/**
 * Set local storage item
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Storage error:', error);
    }
}

/**
 * Remove local storage item
 * @param {string} key - Storage key
 */
function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Storage error:', error);
    }
}

/**
 * Clear all local storage
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Storage error:', error);
    }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Sleep promise
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if device is mobile
 * @returns {boolean} Whether device is mobile
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        setLocalStorage('darkMode', false);
    } else {
        html.classList.add('dark');
        setLocalStorage('darkMode', true);
    }
}

/**
 * Initialize dark mode on page load
 */
function initializeDarkMode() {
    const darkMode = getLocalStorage('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (darkMode === null) {
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        }
    } else if (darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeDarkMode);
