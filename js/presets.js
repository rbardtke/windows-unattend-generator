/**
 * Configuration presets for common scenarios
 */

const Presets = {
    /**
     * Minimal configuration - bare bones Windows install
     */
    minimal: {
        language: 'en-US',
        keyboard: '0409:00000409',
        timezone: 'Pacific Standard Time',
        computerNameMode: 'random',
        computerName: '',
        skipMachineOOBE: true,
        skipUserOOBE: true,
        username: 'User',
        password: '',
        autoLogon: false,
        diskMode: 'gpt-uefi',
        wipeDisk: true,
        windowsEdition: 'Professional',
        productKey: '',
        disableTelemetry: true,
        disableDefender: false,
        disableUAC: false,
        updatePolicy: 'auto',
        firstLogonCommands: '',
        setupCommands: ''
    },

    /**
     * Single user account with basic privacy settings
     */
    'single-user': {
        language: 'en-US',
        keyboard: '0409:00000409',
        timezone: 'Pacific Standard Time',
        computerNameMode: 'random',
        computerName: '',
        skipMachineOOBE: true,
        skipUserOOBE: true,
        username: 'Admin',
        password: 'Password123',
        autoLogon: true,
        diskMode: 'gpt-uefi',
        wipeDisk: true,
        windowsEdition: 'Professional',
        productKey: '',
        disableTelemetry: true,
        disableDefender: false,
        disableUAC: true,
        updatePolicy: 'notify',
        firstLogonCommands: '# First logon setup\nSet-ExecutionPolicy RemoteSigned -Force\nWrite-Host "Windows Setup Complete"',
        setupCommands: ''
    },

    /**
     * VM Guest Tools - optimized for virtual machines
     */
    'vm-guest': {
        language: 'en-US',
        keyboard: '0409:00000409',
        timezone: 'Pacific Standard Time',
        computerNameMode: 'custom',
        computerName: 'VM-GUEST',
        skipMachineOOBE: true,
        skipUserOOBE: true,
        username: 'VMUser',
        password: '',
        autoLogon: true,
        diskMode: 'gpt-uefi',
        wipeDisk: true,
        windowsEdition: 'Professional',
        productKey: '',
        disableTelemetry: true,
        disableDefender: true,
        disableUAC: true,
        updatePolicy: 'disabled',
        firstLogonCommands: `# VM Guest Tools Installation
# Detect and install VM tools
if (Get-WmiObject -Class Win32_ComputerSystem | Where-Object {$_.Manufacturer -like "*VMware*"}) {
    Write-Host "VMware detected - Install VMware Tools from mounted ISO"
}
elseif (Get-WmiObject -Class Win32_ComputerSystem | Where-Object {$_.Manufacturer -like "*Microsoft*"}) {
    Write-Host "Hyper-V detected - Install Integration Services"
}
elseif (Get-WmiObject -Class Win32_ComputerSystem | Where-Object {$_.Manufacturer -like "*QEMU*"}) {
    Write-Host "QEMU/KVM detected - Install virtio drivers"
}

# Optimize for VM
Set-Service -Name "SysMain" -StartupType Disabled
Stop-Service -Name "SysMain"`,
        setupCommands: ''
    },

    /**
     * Apply preset to form
     * @param {string} presetName - Name of the preset to apply
     * @param {HTMLFormElement} form - Form element to populate
     */
    apply(presetName, form) {
        if (!this[presetName]) {
            console.error(`Preset "${presetName}" not found`);
            return;
        }

        const preset = this[presetName];

        // Apply all preset values to form
        for (const [key, value] of Object.entries(preset)) {
            const element = form.elements[key];

            if (!element) continue;

            if (element.type === 'checkbox') {
                element.checked = value;
            } else if (element.type === 'radio') {
                const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                element.value = value;
            }

            // Trigger change event
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Handle computer name field enable/disable
        const computerNameInput = form.querySelector('#computerName');
        const computerNameMode = preset.computerNameMode;

        if (computerNameMode === 'custom') {
            computerNameInput.disabled = false;
            computerNameInput.required = true;
            computerNameInput.value = preset.computerName;
        } else {
            computerNameInput.disabled = true;
            computerNameInput.required = false;
            computerNameInput.value = '';
        }

        Utils.showNotification(`Applied preset: ${presetName}`, 'success');
    },

    /**
     * Get current form configuration as preset
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Configuration object
     */
    fromForm(form) {
        return Utils.getFormData(form);
    },

    /**
     * Export preset as JSON
     * @param {Object} config - Configuration object
     * @param {string} filename - Name for the file
     */
    exportAsJson(config, filename = 'unattend-config.json') {
        const json = JSON.stringify(config, null, 2);
        Utils.downloadFile(json, filename, 'application/json');
    },

    /**
     * Import preset from JSON
     * @param {File} file - JSON file to import
     * @returns {Promise<Object>} Configuration object
     */
    importFromJson(file) {
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
};
