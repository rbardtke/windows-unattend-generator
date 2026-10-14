/**
 * Configuration Model - Default values and structure
 *
 * Every key here has a form field of the same name in index.html and is read by XmlGenerator.
 */

const ConfigModel = {
    getDefaults() {
        const defaults = {
            // Architecture
            arch_x86: false,
            arch_amd64: true,
            arch_arm64: false,

            // Language & Region
            language: 'en-US',
            languageSecondary: '',
            languageTertiary: '',
            keyboard: '0409:00000409',
            geoLocation: '',
            timezoneMode: 'implicit',
            timezone: 'Pacific Standard Time',

            // Setup Options
            bypassTPM: false,
            bypassSecureBoot: false,
            bypassRAM: false,
            bypassStorage: false,
            bypassNRO: false,
            disableNarrator: false,
            hideOnlineAccountScreens: false,

            // Windows Edition
            windowsEdition: 'Professional',
            productKeyMode: 'none',
            productKey: '',

            // Computer Name
            computerNameMode: 'random',
            computerName: '',
            computerNameScript: '',

            // User Accounts (flat account_N_* keys come from the form; `accounts` is for programmatic use)
            enableBuiltinAdmin: false,
            builtinAdminPassword: '',
            accounts: [],
            account_0_username: '',
            account_0_displayname: '',
            account_0_password: '',
            account_0_group: 'Users',
            account_0_autologon: false,

            // Password Policies
            passwordExpiration: 'default',
            passwordExpirationDays: 90,
            lockoutMode: 'default',
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

            // File Explorer
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
            desktopIconsMode: 'default',
            desktopIconThisPC: false,
            desktopIconUserFiles: false,
            desktopIconNetwork: false,
            desktopIconRecycleBin: false,
            desktopIconControlPanel: false,
            desktopIconDesktop: false,
            desktopIconDocuments: false,
            desktopIconDownloads: false,
            desktopIconGallery: false,
            desktopIconHome: false,
            desktopIconMusic: false,
            desktopIconPictures: false,
            desktopIconVideos: false,

            // Start Folders
            startFolderSettings: false,
            startFolderFileExplorer: false,
            startFolderDocuments: false,
            startFolderDownloads: false,
            startFolderMusic: false,
            startFolderPictures: false,
            startFolderVideos: false,
            startFolderNetwork: false,
            startFolderPersonalFolder: false,

            // Appearance
            visualEffectsPreset: 'default',
            vfxAnimateWindows: false,
            vfxAnimateControls: false,
            vfxFadeMenu: false,
            vfxFadeTooltips: false,
            vfxSmoothScroll: false,
            vfxSlideTaskbar: false,
            vfxShadowsWindows: false,
            vfxShadowsMouse: false,
            vfxThumbnails: false,
            vfxTranslucent: false,
            vfxPeek: false,
            vfxTaskbarThumbnails: false,
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
            wallpaperFile_base64: '',

            // Lock Screen
            disableLockScreen: false,
            customLockScreen: false,
            lockScreenFile_base64: '',

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
            stickyKeysActivation: false,
            stickyKeysAudio: false,
            stickyKeysIcon: false,
            stickyKeysLock: false,
            stickyKeysTwoKeys: false,
            stickyKeysConfirm: false,

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
        };

        // Remove apps / capabilities / features
        if (typeof RemovalCatalog !== 'undefined') {
            for (const option of RemovalCatalog.options) defaults[option.key] = false;
        }

        return defaults;
    }
};

if (typeof module !== 'undefined') module.exports = ConfigModel;
