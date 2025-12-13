/**
 * Utility functions for the Unattend Generator
 */

const Utils = {
    /**
     * Sanitize computer name according to Windows naming rules
     * @param {string} name - Computer name to sanitize
     * @returns {string} Sanitized name
     */
    sanitizeComputerName(name) {
        return name
            .replace(/[^a-zA-Z0-9-]/g, '')
            .substring(0, 15)
            .toUpperCase();
    },

    /**
     * Generate a random computer name
     * @returns {string} Random computer name
     */
    generateRandomComputerName() {
        const prefix = 'DESKTOP';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}-${random}`;
    },

    /**
     * Validate product key format
     * @param {string} key - Product key to validate
     * @returns {boolean} True if valid format
     */
    validateProductKey(key) {
        if (!key) return true; // Empty is valid (optional field)
        const pattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
        return pattern.test(key.toUpperCase());
    },

    /**
     * Encode password for XML (base64)
     * @param {string} password - Plain text password
     * @returns {string} Base64 encoded password with 'Password' suffix
     */
    encodePassword(password) {
        if (!password) return '';
        return btoa(password + 'Password');
    },

    /**
     * Escape XML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    /**
     * Download a file to the user's computer
     * @param {string} content - File content
     * @param {string} filename - Name of the file
     * @param {string} mimeType - MIME type of the file
     */
    downloadFile(content, filename, mimeType = 'text/xml') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Format XML with proper indentation
     * @param {string} xml - XML string to format
     * @returns {string} Formatted XML
     */
    formatXml(xml) {
        const PADDING = '    '; // 4 spaces
        const reg = /(>)(<)(\/*)/g;
        let formatted = '';
        let pad = 0;

        xml = xml.replace(reg, '$1\n$2$3');

        xml.split('\n').forEach((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/) && pad > 0) {
                pad -= 1;
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            formatted += PADDING.repeat(pad) + node + '\n';
            pad += indent;
        });

        return formatted.trim();
    },

    /**
     * Show a temporary notification
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#107c10' : type === 'error' ? '#d13438' : '#0078d4'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get form data as an object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form data as key-value pairs
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        // Handle regular inputs
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Handle checkboxes separately (they're not in FormData if unchecked)
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        // Handle radio buttons
        const radios = form.querySelectorAll('input[type="radio"]');
        const radioGroups = new Set();
        radios.forEach(radio => radioGroups.add(radio.name));
        radioGroups.forEach(name => {
            const checked = form.querySelector(`input[name="${name}"]:checked`);
            data[name] = checked ? checked.value : null;
        });

        return data;
    }
};

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
