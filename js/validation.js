/**
 * Form validation logic
 */

const Validation = {
    /**
     * Validation rules for form fields
     */
    rules: {
        computerName: {
            pattern: /^[a-zA-Z0-9-]{1,15}$/,
            message: 'Computer name must be 1-15 characters, alphanumeric and hyphens only'
        },
        username: {
            pattern: /^[a-zA-Z0-9_-]{1,20}$/,
            message: 'Username must be 1-20 characters, alphanumeric, underscores, and hyphens only'
        },
        productKey: {
            pattern: /^([A-Z0-9]{5}-){4}[A-Z0-9]{5}$/,
            message: 'Product key must be in format: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
        }
    },

    /**
     * Initialize validation on form
     * @param {HTMLFormElement} form - Form to validate
     */
    init(form) {
        // Validate on blur
        const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    this.validateField(input);
                }
            });
        });

        // Handle computer name mode changes
        const computerNameRadios = form.querySelectorAll('input[name="computerNameMode"]');
        const computerNameInput = form.querySelector('#computerName');

        computerNameRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'custom') {
                    computerNameInput.disabled = false;
                    computerNameInput.required = true;
                } else {
                    computerNameInput.disabled = true;
                    computerNameInput.required = false;
                    computerNameInput.classList.remove('invalid', 'valid');
                }
            });
        });

        // Product key formatting
        const productKeyInput = form.querySelector('#productKey');
        if (productKeyInput) {
            productKeyInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                let formatted = '';

                for (let i = 0; i < value.length && i < 25; i++) {
                    if (i > 0 && i % 5 === 0) {
                        formatted += '-';
                    }
                    formatted += value[i];
                }

                e.target.value = formatted;
            });
        }
    },

    /**
     * Validate a single field
     * @param {HTMLInputElement} field - Field to validate
     * @returns {boolean} True if valid
     */
    validateField(field) {
        // Skip disabled fields
        if (field.disabled) {
            return true;
        }

        const value = field.value.trim();
        const fieldName = field.name;

        // Remove previous error messages
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Required field check
        if (field.required && !value) {
            this.markInvalid(field, 'This field is required');
            return false;
        }

        // Skip validation if field is empty and not required
        if (!value) {
            this.markValid(field);
            return true;
        }

        // Apply specific validation rules
        if (this.rules[fieldName]) {
            const rule = this.rules[fieldName];
            if (!rule.pattern.test(value)) {
                this.markInvalid(field, rule.message);
                return false;
            }
        }

        // Special validations
        if (fieldName === 'password') {
            // Password can be empty, but if provided should meet minimum criteria
            if (value && value.length < 4) {
                this.markInvalid(field, 'Password should be at least 4 characters');
                return false;
            }
        }

        this.markValid(field);
        return true;
    },

    /**
     * Mark field as invalid
     * @param {HTMLInputElement} field - Field to mark
     * @param {string} message - Error message
     */
    markInvalid(field, message) {
        field.classList.remove('valid');
        field.classList.add('invalid');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    },

    /**
     * Mark field as valid
     * @param {HTMLInputElement} field - Field to mark
     */
    markValid(field) {
        field.classList.remove('invalid');
        if (field.value.trim()) {
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
        }
    },

    /**
     * Validate entire form
     * @param {HTMLFormElement} form - Form to validate
     * @returns {boolean} True if all fields are valid
     */
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    /**
     * Validate PowerShell script syntax (basic check)
     * @param {string} script - PowerShell script
     * @returns {Object} Validation result with isValid and errors
     */
    validatePowerShellScript(script) {
        if (!script || !script.trim()) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const lines = script.split('\n');

        // Basic syntax checks
        let openBraces = 0;
        let openParens = 0;

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('#')) return;

            // Count braces and parentheses
            openBraces += (line.match(/{/g) || []).length;
            openBraces -= (line.match(/}/g) || []).length;
            openParens += (line.match(/\(/g) || []).length;
            openParens -= (line.match(/\)/g) || []).length;

            // Check for common errors
            if (trimmed.includes('=') && !trimmed.includes('-eq') && !trimmed.includes('=')) {
                if (!/\$\w+\s*=/.test(trimmed)) {
                    // Might be using = instead of -eq
                }
            }
        });

        if (openBraces !== 0) {
            errors.push('Mismatched braces {}');
        }
        if (openParens !== 0) {
            errors.push('Mismatched parentheses ()');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
