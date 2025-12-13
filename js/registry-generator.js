/**
 * Registry Generator - Creates registry scripts for system tweaks
 */

class RegistryGenerator {
    /**
     * Generate registry commands for system tweaks
     */
    static generate(config) {
        const commands = [];

        // Windows Defender
        if (config.disableDefender) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender" /v DisableAntiSpyware /t REG_DWORD /d 1 /f',
                'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection" /v DisableRealtimeMonitoring /t REG_DWORD /d 1 /f'
            );
        }

        // Windows Updates
        if (config.disableUpdates) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU" /v NoAutoUpdate /t REG_DWORD /d 1 /f'
            );
        }

        // UAC
        if (config.disableUAC) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f'
            );
        }

        // SmartScreen
        if (config.disableSmartScreen) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer" /v SmartScreenEnabled /t REG_SZ /d "Off" /f'
            );
        }

        // Telemetry
        if (config.disableTelemetry) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f'
            );
        }

        // Long Paths
        if (config.enableLongPaths) {
            commands.push(
                'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f'
            );
        }

        // Remote Desktop
        if (config.enableRemoteDesktop) {
            commands.push(
                'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f',
                'netsh advfirewall firewall set rule group="remote desktop" new enable=Yes'
            );
        }

        // Show Hidden Files
        if (config.explorerShowHidden) {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 1 /f'
            );
        }

        // Show File Extensions
        if (config.explorerShowExtensions) {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f'
            );
        }

        // Classic Context Menu (Windows 11)
        if (config.explorerClassicContextMenu) {
            commands.push(
                'reg add "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /f /ve'
            );
        }

        // This PC View
        if (config.explorerThisPCView) {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v LaunchTo /t REG_DWORD /d 1 /f'
            );
        }

        // Disable Mouse Acceleration
        if (config.disableMouseAcceleration) {
            commands.push(
                'reg add "HKCU\\Control Panel\\Mouse" /v MouseSpeed /t REG_SZ /d "0" /f',
                'reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold1 /t REG_SZ /d "0" /f',
                'reg add "HKCU\\Control Panel\\Mouse" /v MouseThreshold2 /t REG_SZ /d "0" /f'
            );
        }

        // Taskbar Alignment (Windows 11)
        if (config.taskbarAlignLeft) {
            commands.push(
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAl /t REG_DWORD /d 0 /f'
            );
        }

        // Disable Bing Search
        if (config.taskbarDisableBingSearch) {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Search" /v BingSearchEnabled /t REG_DWORD /d 0 /f'
            );
        }

        // PowerShell Execution Policy
        if (config.setPowerShellExecutionPolicy) {
            commands.push(
                'powershell -Command "Set-ExecutionPolicy RemoteSigned -Force"'
            );
        }

        // Disable Edge First Run
        if (config.disableEdgeFirstRun) {
            commands.push(
                'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v HideFirstRunExperience /t REG_DWORD /d 1 /f'
            );
        }

        // Theme Mode
        if (config.themeMode === 'dark') {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f',
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d 0 /f'
            );
        } else if (config.themeMode === 'light') {
            commands.push(
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 1 /f',
                'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d 1 /f'
            );
        }

        // Num Lock State
        if (config.numLockState === 'on') {
            commands.push(
                'reg add "HKU\\.DEFAULT\\Control Panel\\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d "2" /f'
            );
        } else if (config.numLockState === 'off') {
            commands.push(
                'reg add "HKU\\.DEFAULT\\Control Panel\\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d "0" /f'
            );
        }

        return commands;
    }

    /**
     * Generate a batch file content with all registry commands
     */
    static generateBatchScript(config) {
        const commands = this.generate(config);
        if (commands.length === 0) return '';

        return `@echo off
:: Windows Registry Tweaks
:: Generated by Windows Unattend Generator

${commands.join('\n')}

echo Registry tweaks applied successfully.
`;
    }

    /**
     * Generate a PowerShell script with all registry commands
     */
    static generatePowerShellScript(config) {
        const commands = this.generate(config);
        if (commands.length === 0) return '';

        return `# Windows Registry Tweaks
# Generated by Windows Unattend Generator

${commands.map(cmd => {
    if (cmd.startsWith('reg add')) {
        return `Start-Process -FilePath "reg.exe" -ArgumentList '${cmd.substring(4)}' -NoNewWindow -Wait`;
    } else if (cmd.startsWith('powershell')) {
        return cmd.substring(11); // Remove 'powershell ' prefix
    }
    return `Start-Process -FilePath "cmd.exe" -ArgumentList '/c ${cmd}' -NoNewWindow -Wait`;
}).join('\n')}

Write-Host "Registry tweaks applied successfully."
`;
    }
}
