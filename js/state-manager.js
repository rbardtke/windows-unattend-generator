/**
 * State Manager - Handles state persistence and localStorage
 */

class StateManager {
    static STORAGE_KEY = 'unattend_config';

    /**
     * Save current configuration to localStorage
     */
    static saveState(config) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
            return true;
        } catch (e) {
            console.error('Failed to save state:', e);
            return false;
        }
    }

    /**
     * Load configuration from localStorage
     */
    static loadState() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load state:', e);
            return null;
        }
    }

    /**
     * Clear saved configuration
     */
    static clearState() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear state:', e);
            return false;
        }
    }

    /**
     * Export configuration as JSON
     */
    static exportConfig(config) {
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unattend-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import configuration from JSON file
     */
    static importConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    resolve(config);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}
