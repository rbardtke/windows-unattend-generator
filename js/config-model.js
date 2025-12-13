/**
 * Configuration Model - Default values and structure
 */

const ConfigModel = {
    getDefaults() {
        return {
            // Architecture
            arch_x86: false,
            arch_amd64: true,
            arch_arm64: false,

            // Language & Region
            language: 'en-US',
            languageSecondary: '',
            languageTertiary: '',
            keyboard: '0409:00000409',
            geoLocation: '244',
            timezone: 'Pacific Standard Time',

            // Setup Options
            bypassTPM: false,
            bypassSecureBoot: false,
            bypassRAM: false,
            bypassStorage: false,
            showPowerShell: false,
            disableNarrator: false,
            skipMachineOOBE: true,
            skipUserOOBE: true,

            // Windows Edition
            windowsEdition: 'Professional',
            productKeyMode: 'none',
            productKey: '',

            // Computer Name
            computerNameMode: 'random',
            computerName: '',
            computerNameScript: '',

            // User Accounts
            enableBuiltinAdmin: false,
            builtinAdminPassword: '',
            accounts: [
                { username: '', displayname: '', password: '', group: 'Users', autologon: false }
            ],

            // Password Policies
            passwordExpiration: 'default',
            passwordExpirationDays: 90,
            enableAccountLockout: false,
            lockoutThreshold: 5,
            lockoutWindow: 30,
            lockoutDuration: 30,

            // Disk Configuration
            partitionMode: 'auto',
            partitionStyle: 'gpt',
            efiSize: 100,
            recoveryMode: 'partition',
            recoverySize: 990,
            wipeDisk: true,
            customDiskPart: '',
            enableDiskAssertion: false,
            diskAssertionScript: '',

            // System
            compactOS: 'auto',

            // System Tweaks
            disableDefender: false,
            disableUpdates: false,
            disableUAC: false,
            disableSmartScreen: false,
            disableFastStartup: false,
            disableSystemRestore: false,
            enableLongPaths: false,
            enableRemoteDesktop: false,
            disableTelemetry: false,
            disableAppSuggestions: false,
            disableDeviceEncryption: false,
            disableEdgeFirstRun: false,
            disableEdgeStartupBoost: false,
            enableEdgeUninstall: false,
            disableMouseAcceleration: false,
            disableCoreIsolation: false,
            enableProcessAuditing: false,
            disableSystemSounds: false,
            disableAutoReboot: false,
            optimizeLastAccessTime: false,
            setPowerShellExecutionPolicy: false,
            cleanupWindowsOld: false,
            disableAutoSignIn: false,
            disableSmartAppControl: false,

            // UI
            explorerShowHidden: false,
            explorerShowExtensions: true,
            explorerClassicContextMenu: false,
            explorerThisPCView: true,
            explorerEndTaskButton: false,

            // Taskbar
            taskbarSearch: 'default',
            taskbarHideTaskView: false,
            taskbarHideWidgets: false,
            taskbarHideChat: false,
            taskbarAlignLeft: false,
            taskbarAutoHideTray: false,
            taskbarDisableBingSearch: false,

            // Start Menu
            startTilesWin10: 'default',
            startTilesWin10XML: '',
            startPinsWin11: 'default',
            startPinsWin11JSON: '',

            // Desktop Icons
            desktopRemoveEdge: false,
            desktopIcons: {},

            // Start Folders
            startFolders: {},

            // Appearance
            visualEffectsPreset: 'default',
            visualEffects: {},
            themeMode: 'default',
            enableCustomAccent: false,
            accentColor: '#0078d4',
            accentOnStartTaskbar: false,
            accentOnTitleBars: false,
            enableTransparency: false,

            // Wallpaper
            wallpaperMode: 'default',
            wallpaperColor: '#000000',
            wallpaperPath: '',
            wallpaperStyle: 'fill',

            // Lock Screen
            disableLockScreen: false,
            customLockScreen: false,

            // Network
            wifiMode: 'interactive',
            wifiSSID: '',
            wifiAuth: 'wpa2psk',
            wifiPassword: '',
            wifiHiddenNetwork: false,
            wifiAutoConnect: true,
            wifiXMLProfile: '',

            // VM Tools
            vmVirtualBox: false,
            vmVMware: false,
            vmVirtIO: false,
            vmParallels: false,

            // Accessibility
            capsLockState: 'default',
            numLockState: 'default',
            scrollLockState: 'default',
            stickyKeysMode: 'default',
            stickyKeysSettings: {},

            // Privacy
            privacySettings: 'interactive',

            // Scripts
            systemScriptType: '',
            systemScript: '',
            userOnceScriptType: '',
            userOnceScript: '',
            firstLogonScriptType: '',
            firstLogonScript: '',
            defaultUserScriptType: '',
            defaultUserScript: '',

            // Advanced
            customComponents: '',
            appLockerPolicy: ''
        };
    }
};
