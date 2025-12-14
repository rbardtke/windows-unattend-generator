/**
 * Main Application Logic - Complete Edition
 */

class UnattendApp {
    constructor() {
        this.form = document.getElementById('unattendForm');
        this.fileInput = document.getElementById('fileInput');
        this.init();
    }

    init() {
        // Initialize UI components
        UIComponents.init();

        // Set up event listeners
        this.setupEventListeners();

        // Load saved state if available
        this.loadState();

        // Generate initial preview
        this.updatePreview();

        console.log('Complete Windows Unattend Generator initialized');
    }

    setupEventListeners() {
        // Export XML button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.generateAndDownload();
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            this.fileInput.click();
        });

        // Save config as JSON
        document.getElementById('saveConfigBtn').addEventListener('click', () => {
            this.saveConfigToFile();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importFile(file);
            }
        });

        // Preset selector
        document.getElementById('presetSelector').addEventListener('change', (e) => {
            const presetName = e.target.value;
            if (presetName && Presets[presetName]) {
                this.applyPreset(presetName);
                e.target.value = '';
            }
        });

        // Update preview on form changes (debounced)
        const debouncedUpdate = this.debounce(() => this.updatePreview(), 500);
        const debouncedSave = this.debounce(() => this.saveState(), 1000);

        this.form.addEventListener('input', () => {
            debouncedUpdate();
            debouncedSave();
        });

        this.form.addEventListener('change', () => {
            debouncedUpdate();
            debouncedSave();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S to download
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.generateAndDownload();
            }
            // Ctrl+O or Cmd+O to import
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.fileInput.click();
            }
        });
    }

    /**
     * Update XML preview
     */
    updatePreview() {
        try {
            const config = this.getFormData();
            const generator = new XmlGenerator(config);
            const xml = generator.generate();

            const preview = document.getElementById('xmlPreview');
            const code = preview.querySelector('code');
            code.textContent = xml;

            this.highlightXml(code);
        } catch (error) {
            console.error('Preview generation failed:', error);
            const preview = document.getElementById('xmlPreview');
            preview.querySelector('code').textContent = `<!-- Error generating preview: ${error.message} -->`;
        }
    }

    /**
     * Simple XML syntax highlighting
     */
    highlightXml(element) {
        let html = element.textContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Highlight tags
        html = html.replace(/(&lt;\/?[\w-]+)(.*?)(&gt;)/g,
            '<span style="color: #569cd6">$1</span><span style="color: #9cdcfe">$2</span><span style="color: #569cd6">$3</span>');

        // Highlight attributes
        html = html.replace(/([\w-]+)=&quot;([^&]+)&quot;/g,
            '<span style="color: #9cdcfe">$1</span>=<span style="color: #ce9178">&quot;$2&quot;</span>');

        // Highlight comments
        html = html.replace(/(&lt;!--.*?--&gt;)/g,
            '<span style="color: #6a9955">$1</span>');

        element.innerHTML = html;
    }

    /**
     * Generate and download XML file
     */
    generateAndDownload() {
        try {
            const config = this.getFormData();
            const generator = new XmlGenerator(config);
            const xml = generator.generate();

            // Debug: Check for extra characters
            console.log('=== XML GENERATION DEBUG ===');
            console.log('First 100 chars:', xml.substring(0, 100));
            console.log('Last 100 chars:', xml.substring(xml.length - 100));
            console.log('Starts with <?xml:', xml.startsWith('<?xml'));
            console.log('Ends with </unattend>:', xml.endsWith('</unattend>'));
            console.log('First char code:', xml.charCodeAt(0), 'Expected 60 for <');
            console.log('Last char code:', xml.charCodeAt(xml.length - 1), 'Expected 62 for >');

            this.downloadFile(xml, 'autounattend.xml', 'text/xml');
            this.showNotification('autounattend.xml generated successfully!', 'success');
        } catch (error) {
            console.error('Generation failed:', error);
            this.showNotification(`Generation failed: ${error.message}`, 'error');
        }
    }

    /**
     * Save configuration to JSON file
     */
    saveConfigToFile() {
        try {
            const config = this.getFormData();
            StateManager.exportConfig(config);
            this.showNotification('Configuration saved successfully!', 'success');
        } catch (error) {
            console.error('Save failed:', error);
            this.showNotification(`Save failed: ${error.message}`, 'error');
        }
    }

    /**
     * Import configuration from file
     */
    async importFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();

        try {
            if (extension === 'json') {
                const config = await StateManager.importConfig(file);
                this.applyConfig(config);
                this.showNotification('Configuration imported from JSON', 'success');
            } else if (extension === 'xml') {
                // Read XML file
                const xmlContent = await this.readFileAsText(file);

                // Parse XML to extract configuration
                const parser = new XmlParser(xmlContent);
                const config = parser.parse();

                console.log('Parsed configuration from XML:', config);

                // Apply configuration to form
                this.applyConfig(config);
                this.showNotification('Configuration imported from XML', 'success');
            } else {
                this.showNotification('Unsupported file type. Use .json or .xml', 'error');
            }

            this.updatePreview();
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification(`Import failed: ${error.message}`, 'error');
        }
    }

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Apply a preset configuration
     */
    applyPreset(presetName) {
        try {
            const preset = Presets[presetName];
            if (preset) {
                this.applyConfig(preset);
                this.updatePreview();
                this.showNotification(`Preset "${presetName}" applied`, 'success');
            }
        } catch (error) {
            console.error('Preset application failed:', error);
            this.showNotification(`Failed to apply preset: ${error.message}`, 'error');
        }
    }

    /**
     * Get form data as configuration object
     */
    getFormData() {
        const config = {};
        const formData = new FormData(this.form);

        // Get all form elements
        for (const element of this.form.elements) {
            const name = element.name;
            if (!name) continue;

            if (element.type === 'checkbox') {
                config[name] = element.checked;
            } else if (element.type === 'radio') {
                if (element.checked) {
                    config[name] = element.value;
                }
            } else if (element.type === 'file') {
                // Handle file uploads (base64 data stored in dataset)
                if (element.dataset.base64) {
                    config[name + '_base64'] = element.dataset.base64;
                }
            } else {
                config[name] = element.value;
            }
        }

        return config;
    }

    /**
     * Apply configuration to form
     */
    applyConfig(config) {
        for (const [key, value] of Object.entries(config)) {
            const element = this.form.elements[key];
            if (!element) continue;

            let targetElement = element; // Element to dispatch event on

            if (element.type === 'checkbox') {
                element.checked = Boolean(value);
            } else if (element.type === 'radio') {
                const radio = this.form.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                    targetElement = radio; // Dispatch on the specific radio button
                } else {
                    continue; // Skip if radio not found
                }
            } else if (element instanceof RadioNodeList) {
                // Handle RadioNodeList case (multiple elements with same name)
                const selectedRadio = Array.from(element).find(r => r.checked);
                if (selectedRadio) {
                    targetElement = selectedRadio;
                } else {
                    continue; // Skip if no radio is selected
                }
            } else if (element.tagName === 'SELECT' || element.type === 'text' ||
                       element.type === 'password' || element.type === 'number' ||
                       element.type === 'color' || element.tagName === 'TEXTAREA') {
                element.value = value;
            }

            // Trigger change event only on actual DOM elements
            if (targetElement && typeof targetElement.dispatchEvent === 'function') {
                targetElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    /**
     * Save current state to localStorage
     */
    saveState() {
        try {
            const config = this.getFormData();
            StateManager.saveState(config);
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const config = StateManager.loadState();
            if (config) {
                this.applyConfig(config);
                console.log('State restored from localStorage');
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Debounce helper
     */
    debounce(func, wait) {
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.unattendApp = new UnattendApp();
});
