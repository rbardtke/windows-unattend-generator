/**
 * UI Components - Handles dynamic UI elements and conditional visibility
 */

class UIComponents {
    static init() {
        if (this.initialized) return;
        this.initialized = true;
        this.initDataLists();
        this.initRemovalOptions();
        this.initTabs();
        this.initConditionalFields();
        this.initAccountsTable();
        this.initScriptTypeSelectors();
        this.initExtraScripts();
        this.initFileUploads();
    }

    /**
     * Fill the language, keyboard, region and time zone selects from the data files
     */
    static initDataLists() {
        const fill = (id, items, valueKey, emptyLabel) => {
            const select = document.getElementById(id);
            if (!select) return;
            const current = select.value;
            select.innerHTML = '';
            if (emptyLabel !== undefined) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = emptyLabel;
                select.appendChild(option);
            }
            for (const item of items) {
                const option = document.createElement('option');
                option.value = String(item[valueKey]);
                option.textContent = item.name;
                select.appendChild(option);
            }
            if (Array.from(select.options).some(o => o.value === current)) select.value = current;
        };
        const byName = list => list.slice().sort((a, b) => a.name.localeCompare(b.name));
        fill('language', LanguagesData.languages, 'code');
        fill('languageSecondary', LanguagesData.languages, 'code', 'None');
        fill('languageTertiary', LanguagesData.languages, 'code', 'None');
        fill('keyboard', LanguagesData.keyboards, 'code');
        fill('geoLocation', byName(CountriesData.countries), 'id', 'Derived from display language (default)');
        fill('timezone', LanguagesData.timezones, 'id');
    }

    static SCRIPT_TYPES = [['', 'None'], ['cmd', '.cmd (Batch)'], ['ps1', '.ps1 (PowerShell)'], ['reg', '.reg (Registry)'], ['vbs', '.vbs (VBScript)'], ['js', '.js (JScript)']];

    /**
     * "Add another script" buttons: extra script boxes per phase, named <phase>ScriptType_N / <phase>Script_N
     */
    static initExtraScripts() {
        document.querySelectorAll('.add-script').forEach(button => {
            button.addEventListener('click', () => this.addScriptRow(button.dataset.phase));
        });
    }

    static scriptRowCount(phase) {
        return 1 + document.querySelectorAll(`#${phase}ExtraScripts .extra-script`).length;
    }

    static addScriptRow(phase) {
        const container = document.getElementById(`${phase}ExtraScripts`);
        if (!container) return null;
        const index = this.scriptRowCount(phase) + 1;
        const row = document.createElement('div');
        row.className = 'extra-script script-phase';
        row.dataset.index = index;
        const select = document.createElement('select');
        select.name = `${phase}ScriptType_${index}`;
        select.id = select.name;
        for (const [value, label] of this.SCRIPT_TYPES) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        }
        select.value = 'ps1';
        const textarea = document.createElement('textarea');
        textarea.name = `${phase}Script_${index}`;
        textarea.id = textarea.name;
        textarea.rows = 8;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn-small btn-danger';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
            row.remove();
            this.renumberScriptRows(phase);
            document.getElementById('unattendForm').dispatchEvent(new Event('input', { bubbles: true }));
        });

        const head = document.createElement('div');
        head.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = `Script ${index} type `;
        label.appendChild(select);
        head.appendChild(label);
        head.appendChild(remove);
        const body = document.createElement('div');
        body.className = 'form-group';
        body.appendChild(textarea);
        row.appendChild(head);
        row.appendChild(body);
        container.appendChild(row);

        CodeEditor.enhance(textarea, select.value);
        select.addEventListener('change', () => CodeEditor.setLanguage(textarea, select.value || 'ps1'));
        return row;
    }

    static renumberScriptRows(phase) {
        document.querySelectorAll(`#${phase}ExtraScripts .extra-script`).forEach((row, i) => {
            const index = i + 2;
            row.dataset.index = index;
            const select = row.querySelector('select');
            const textarea = row.querySelector('textarea');
            select.name = select.id = `${phase}ScriptType_${index}`;
            textarea.name = textarea.id = `${phase}Script_${index}`;
            row.querySelector('label').firstChild.textContent = `Script ${index} type `;
        });
    }

    /** Make sure a phase has at least `count` script boxes (used when importing). */
    static ensureScriptRows(phase, count) {
        while (this.scriptRowCount(phase) < count && count <= 50) this.addScriptRow(phase);
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

        // Read file as base64; large images are downscaled, because the image is embedded in the
        // answer file as a base64 string and setup has to carry it through the whole installation.
        const MAX_EMBED = 1024 * 1024;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            if (file.size <= MAX_EMBED) {
                fileInput.dataset.base64 = dataUrl;
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                Utils.showNotification(`${type} image loaded (${Math.round(file.size / 1024)} KB)`, 'success');
                return;
            }
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, 2560 / img.width, 1600 / img.height);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                let quality = 0.85;
                let out = canvas.toDataURL('image/jpeg', quality);
                while (out.length > MAX_EMBED * 1.37 && quality > 0.5) {
                    quality -= 0.1;
                    out = canvas.toDataURL('image/jpeg', quality);
                }
                fileInput.dataset.base64 = out;
                fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                Utils.showNotification(`${type} image was ${Math.round(file.size / 1024)} KB; embedded as ${canvas.width}x${canvas.height} JPEG (${Math.round(out.length * 0.73 / 1024)} KB)`, 'info');
            };
            img.onerror = () => Utils.showNotification('Failed to decode image file', 'error');
            img.src = dataUrl;
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
