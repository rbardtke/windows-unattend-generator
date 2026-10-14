/**
 * UI Components - Handles dynamic UI elements and conditional visibility
 */

class UIComponents {
    static init() {
        if (this.initialized) return;
        this.initialized = true;
        this.initRemovalOptions();
        this.initTabs();
        this.initConditionalFields();
        this.initAccountsTable();
        this.initScriptTypeSelectors();
        this.initFileUploads();
    }

    /**
     * Build the "Remove Apps" checkboxes from the removal catalog
     */
    static initRemovalOptions() {
        const container = document.getElementById('removalOptions');
        if (!container || container.children.length) return;
        for (const option of RemovalCatalog.options) {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = option.key;
            input.id = option.key;
            if (option.description) label.title = option.description;
            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + option.label));
            container.appendChild(label);
        }
        const setAll = (checked) => {
            container.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.checked = checked;
            });
            container.dispatchEvent(new Event('input', { bubbles: true }));
        };
        document.getElementById('removeAllBtn').addEventListener('click', () => setAll(true));
        document.getElementById('removeNoneBtn').addEventListener('click', () => setAll(false));
    }

    /**
     * Make sure the accounts table has at least `count` rows (used when importing a configuration)
     */
    static ensureAccountRows(count) {
        const addButton = document.getElementById('addAccountBtn');
        while (document.querySelectorAll('.account-row').length < count && count <= 99) {
            addButton.click();
        }
    }

    /**
     * Initialize tab navigation
     */
    static initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;

                // Update buttons
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content
                tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }

    /**
     * Initialize conditional field visibility
     */
    static initConditionalFields() {
        // Product Key Mode
        document.querySelectorAll('input[name="productKeyMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const group = document.getElementById('productKeyGroup');
                group.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });
        });

        // Computer Name Mode
        document.querySelectorAll('input[name="computerNameMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('computerNameCustomGroup').style.display =
                    e.target.value === 'custom' ? 'block' : 'none';
                document.getElementById('computerNameScriptGroup').style.display =
                    e.target.value === 'script' ? 'block' : 'none';
            });
        });

        // Built-in Admin
        document.getElementById('enableBuiltinAdmin').addEventListener('change', (e) => {
            document.getElementById('builtinAdminPasswordGroup').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // Password Expiration
        document.getElementById('passwordExpiration').addEventListener('change', (e) => {
            document.getElementById('passwordExpirationCustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        // Account Lockout
        document.getElementById('lockoutMode').addEventListener('change', (e) => {
            document.getElementById('accountLockoutGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        // Time Zone Mode
        document.getElementById('timezoneMode').addEventListener('change', (e) => {
            document.getElementById('timezoneExplicitGroup').style.display =
                e.target.value === 'explicit' ? 'block' : 'none';
        });

        // Desktop Icons Mode
        document.getElementById('desktopIconsMode').addEventListener('change', (e) => {
            document.getElementById('desktopIconsCustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        // Partition Mode
        document.getElementById('partitionMode').addEventListener('change', (e) => {
            const autoGroup = document.getElementById('autoPartitionGroup');
            const customGroup = document.getElementById('customDiskPartGroup');

            if (e.target.value === 'custom') {
                autoGroup.style.display = 'none';
                customGroup.style.display = 'block';
            } else {
                autoGroup.style.display = 'block';
                customGroup.style.display = 'none';
            }
        });

        // Partition Style (GPT/MBR)
        document.getElementById('partitionStyle').addEventListener('change', (e) => {
            document.getElementById('efiSizeGroup').style.display =
                e.target.value === 'gpt' ? 'block' : 'none';
        });

        // Recovery Mode
        document.getElementById('recoveryMode').addEventListener('change', (e) => {
            document.getElementById('recoverySizeGroup').style.display =
                e.target.value === 'partition' ? 'block' : 'none';
        });

        // Visual Effects
        document.getElementById('visualEffectsPreset').addEventListener('change', (e) => {
            document.getElementById('visualEffectsCustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        // Custom Accent Color
        document.getElementById('enableCustomAccent').addEventListener('change', (e) => {
            document.getElementById('customAccentGroup').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // Wallpaper Mode
        document.getElementById('wallpaperMode').addEventListener('change', (e) => {
            document.getElementById('wallpaperSolidGroup').style.display =
                e.target.value === 'solid' ? 'block' : 'none';
            document.getElementById('wallpaperCustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
            document.getElementById('wallpaperPathGroup').style.display =
                e.target.value === 'path' ? 'block' : 'none';
            document.getElementById('wallpaperStyleGroup').style.display =
                (e.target.value === 'custom' || e.target.value === 'path') ? 'block' : 'none';
        });

        // Lock Screen
        document.getElementById('customLockScreen').addEventListener('change', (e) => {
            document.getElementById('lockScreenImageGroup').style.display =
                e.target.checked ? 'block' : 'none';
        });

        // Wi-Fi Mode
        document.getElementById('wifiMode').addEventListener('change', (e) => {
            document.getElementById('wifiConfigureGroup').style.display =
                e.target.value === 'configure' ? 'block' : 'none';
            document.getElementById('wifiXMLGroup').style.display =
                e.target.value === 'xml' ? 'block' : 'none';
        });

        // Wi-Fi Auth
        document.getElementById('wifiAuth').addEventListener('change', (e) => {
            const needsPassword = e.target.value !== 'open';
            document.getElementById('wifiPasswordGroup').style.display =
                needsPassword ? 'block' : 'none';
        });

        // Sticky Keys
        document.getElementById('stickyKeysMode').addEventListener('change', (e) => {
            document.getElementById('stickyKeysCustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        // Start Menu Tiles/Pins
        document.getElementById('startTilesWin10').addEventListener('change', (e) => {
            document.getElementById('startTilesWin10CustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });

        document.getElementById('startPinsWin11').addEventListener('change', (e) => {
            document.getElementById('startPinsWin11CustomGroup').style.display =
                e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    /**
     * Initialize accounts table (add/remove accounts)
     */
    static initAccountsTable() {
        let accountIndex = 0;

        document.getElementById('addAccountBtn').addEventListener('click', () => {
            accountIndex++;
            if (accountIndex >= 99) return; // Max 99 accounts

            const tbody = document.getElementById('accountsTableBody');
            const row = document.createElement('tr');
            row.className = 'account-row';
            row.dataset.index = accountIndex;
            row.innerHTML = `
                <td><input type="text" name="account_${accountIndex}_username" placeholder="User${accountIndex}" required></td>
                <td><input type="text" name="account_${accountIndex}_displayname" placeholder="User${accountIndex}"></td>
                <td><input type="password" name="account_${accountIndex}_password" placeholder="(no password)"></td>
                <td>
                    <select name="account_${accountIndex}_group">
                        <option value="Administrators">Administrators</option>
                        <option value="Users" selected>Users</option>
                        <option value="Power Users">Power Users</option>
                        <option value="Guests">Guests</option>
                    </select>
                </td>
                <td><input type="checkbox" name="account_${accountIndex}_autologon"></td>
                <td><button type="button" class="btn-small btn-danger remove-account">Remove</button></td>
            `;
            tbody.appendChild(row);

            // Add remove handler
            row.querySelector('.remove-account').addEventListener('click', () => {
                row.remove();
                this.updateRemoveButtons();
            });

            this.updateRemoveButtons();
        });

        // Update remove button states
        this.updateRemoveButtons();
    }

    static updateRemoveButtons() {
        const rows = document.querySelectorAll('.account-row');
        rows.forEach((row, index) => {
            const btn = row.querySelector('.remove-account');
            btn.disabled = rows.length === 1; // Can't remove if it's the last one
        });
    }

    /**
     * Initialize script type selectors
     */
    static initScriptTypeSelectors() {
        const phases = ['system', 'userOnce', 'firstLogon', 'defaultUser'];

        phases.forEach(phase => {
            const selector = document.getElementById(`${phase}ScriptType`);
            const group = document.getElementById(`${phase}ScriptGroup`);
            const textarea = group.querySelector('textarea');
            CodeEditor.enhance(textarea, selector.value || 'ps1');

            selector.addEventListener('change', (e) => {
                group.style.display = e.target.value ? 'block' : 'none';

                // Update textarea placeholder and highlighting based on script type
                this.updateScriptPlaceholder(textarea, e.target.value);
                CodeEditor.setLanguage(textarea, e.target.value || 'ps1');
            });
        });

        // Other script-like boxes
        CodeEditor.enhance(document.getElementById('computerNameScript'), 'ps1');
        CodeEditor.enhance(document.getElementById('customDiskPart'), 'cmd');
    }

    static updateScriptPlaceholder(textarea, scriptType) {
        const placeholders = {
            cmd: ':: Batch script\n@echo off\necho Running custom script...',
            ps1: '# PowerShell script\nWrite-Host "Running custom script..."',
            reg: 'Windows Registry Editor Version 5.00\n\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\...]',
            vbs: '\' VBScript\nMsgBox "Running custom script..."',
            js: '// JScript\nWScript.Echo("Running custom script...");'
        };
        textarea.placeholder = placeholders[scriptType] || '';
    }

    /**
     * Initialize file upload handlers
     */
    static initFileUploads() {
        // Wallpaper upload
        const wallpaperFile = document.getElementById('wallpaperFile');
        if (wallpaperFile) {
            wallpaperFile.addEventListener('change', (e) => {
                this.handleImageUpload(e.target, 'wallpaper');
            });
        }

        // Lock screen upload
        const lockScreenFile = document.getElementById('lockScreenFile');
        if (lockScreenFile) {
            lockScreenFile.addEventListener('change', (e) => {
                this.handleImageUpload(e.target, 'lockScreen');
            });
        }
    }

    static handleImageUpload(fileInput, type) {
        const file = fileInput.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(jpeg|png|bmp)/)) {
            Utils.showNotification('Please select a valid image file (JPEG, PNG, or BMP)', 'error');
            fileInput.value = '';
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showNotification('Image file is too large. Maximum size is 5MB.', 'error');
            fileInput.value = '';
            return;
        }

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
            // Store base64 data in a hidden field or data attribute
            fileInput.dataset.base64 = e.target.result;
            Utils.showNotification(`${type} image loaded successfully`, 'success');
        };
        reader.onerror = () => {
            Utils.showNotification('Failed to read image file', 'error');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show notification to user
     */
    static showNotification(message, type = 'info') {
        Utils.showNotification(message, type);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UIComponents.init();
});
