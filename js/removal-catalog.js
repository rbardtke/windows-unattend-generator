/**
 * Removal catalog: inbox apps, capabilities and features that can be removed.
 *
 * The list is in alphabetical order of the option key. That order is also the order in which the
 * selectors appear in RemovePackages.ps1 / RemoveCapabilities.ps1 / RemoveFeatures.ps1, matching
 * the schneegans.de generator.
 *
 * `special` options have no selector; the generator handles them with dedicated script blocks.
 */

const RemovalCatalog = {
    options: [
        { key: 'remove3DViewer', label: '3D Viewer', packages: ['Microsoft.Microsoft3DViewer'] },
        { key: 'removeAlarms', label: 'Alarms & Clock', packages: ['Microsoft.WindowsAlarms'] },
        { key: 'removeBingSearch', label: 'Bing Search', packages: ['Microsoft.BingSearch'] },
        { key: 'removeCalculator', label: 'Calculator', packages: ['Microsoft.WindowsCalculator'] },
        { key: 'removeCamera', label: 'Camera', packages: ['Microsoft.WindowsCamera'] },
        { key: 'removeClipchamp', label: 'Clipchamp', packages: ['Clipchamp.Clipchamp'] },
        { key: 'removeCopilot', label: 'Copilot', special: true, description: 'Policy switch plus removal of the Copilot provider app' },
        { key: 'removeCortana', label: 'Cortana', packages: ['Microsoft.549981C3F5F10'] },
        { key: 'removeDevHome', label: 'Dev Home', packages: ['Microsoft.Windows.DevHome'], special: true },
        { key: 'removeEdge', label: 'Microsoft Edge', special: true, description: 'Uninstalls Edge with its own setup.exe (no effect in the EEA where Edge is already uninstallable)' },
        { key: 'removeFamily', label: 'Family', packages: ['MicrosoftCorporationII.MicrosoftFamily'] },
        { key: 'removeFaxAndScan', label: 'Fax and Scan', capabilities: ['Print.Fax.Scan'] },
        { key: 'removeFeedbackHub', label: 'Feedback Hub', packages: ['Microsoft.WindowsFeedbackHub'] },
        { key: 'removeGetHelp', label: 'Get Help', packages: ['Microsoft.GetHelp'] },
        { key: 'removeGetStarted', label: 'Tips (Get Started)', packages: ['Microsoft.Getstarted'] },
        { key: 'removeHandwriting', label: 'Handwriting recognition', capabilities: ['Language.Handwriting'] },
        { key: 'removeInternetExplorer', label: 'Internet Explorer mode', capabilities: ['Browser.InternetExplorer'] },
        { key: 'removeMaps', label: 'Maps', packages: ['Microsoft.WindowsMaps'] },
        { key: 'removeMathInputPanel', label: 'Math Input Panel', capabilities: ['MathRecognizer'] },
        { key: 'removeMediaPlayer', label: 'Media Player', packages: ['Microsoft.ZuneMusic'] },
        { key: 'removeMixedReality', label: 'Mixed Reality Portal', packages: ['Microsoft.MixedReality.Portal'] },
        { key: 'removeNews', label: 'News', packages: ['Microsoft.BingNews'] },
        { key: 'removeNotepad', label: 'Notepad', packages: ['Microsoft.WindowsNotepad'] },
        { key: 'removeOffice365', label: 'Office 365 / Microsoft 365 hub', packages: ['Microsoft.MicrosoftOfficeHub'] },
        { key: 'removeOneDrive', label: 'OneDrive', special: true },
        { key: 'removeOneNote', label: 'OneNote', packages: ['Microsoft.Office.OneNote'] },
        { key: 'removeOneSync', label: 'OneSync (Mail/Calendar sync)', capabilities: ['OneCoreUAP.OneSync'] },
        { key: 'removeOpenSSHClient', label: 'OpenSSH client', capabilities: ['OpenSSH.Client'] },
        { key: 'removeOutlook', label: 'Outlook for Windows', packages: ['Microsoft.OutlookForWindows'], special: true },
        { key: 'removePaint', label: 'Paint', packages: ['Microsoft.Paint'] },
        { key: 'removePaint3D', label: 'Paint 3D', packages: ['Microsoft.MSPaint'] },
        { key: 'removePeople', label: 'People', packages: ['Microsoft.People'] },
        { key: 'removePhotos', label: 'Photos', packages: ['Microsoft.Windows.Photos'] },
        { key: 'removePowerAutomate', label: 'Power Automate', packages: ['Microsoft.PowerAutomateDesktop'] },
        { key: 'removePowerShellISE', label: 'PowerShell ISE', capabilities: ['Microsoft.Windows.PowerShell.ISE'] },
        { key: 'removeQuickAssist', label: 'Quick Assist', packages: ['MicrosoftCorporationII.QuickAssist'], capabilities: ['App.Support.QuickAssist'] },
        { key: 'removeRecall', label: 'Recall', features: ['Recall'] },
        { key: 'removeSkype', label: 'Skype', packages: ['Microsoft.SkypeApp'] },
        { key: 'removeSnippingTool', label: 'Snipping Tool', packages: ['Microsoft.ScreenSketch'] },
        { key: 'removeSolitaire', label: 'Solitaire Collection', packages: ['Microsoft.MicrosoftSolitaireCollection'] },
        { key: 'removeSpeech', label: 'Speech recognition and text-to-speech', capabilities: ['Language.Speech', 'Language.TextToSpeech'] },
        { key: 'removeStepsRecorder', label: 'Steps Recorder', capabilities: ['App.StepsRecorder'] },
        { key: 'removeStickyNotes', label: 'Sticky Notes', packages: ['Microsoft.MicrosoftStickyNotes'] },
        { key: 'removeTeams', label: 'Teams', packages: ['MicrosoftTeams', 'MSTeams'], special: true },
        { key: 'removeTerminal', label: 'Windows Terminal', packages: ['Microsoft.WindowsTerminal'] },
        { key: 'removeToDo', label: 'To Do', packages: ['Microsoft.Todos'] },
        { key: 'removeVoiceRecorder', label: 'Voice Recorder / Sound Recorder', packages: ['Microsoft.WindowsSoundRecorder'] },
        { key: 'removeWallet', label: 'Wallet', packages: ['Microsoft.Wallet'] },
        { key: 'removeWeather', label: 'Weather', packages: ['Microsoft.BingWeather'] },
        { key: 'removeWindowsHello', label: 'Windows Hello face recognition', capabilities: ['Hello.Face.18967', 'Hello.Face.Migration.18967', 'Hello.Face.20134'] },
        { key: 'removeWMIC', label: 'WMIC', capabilities: ['WMIC'] },
        { key: 'removeWordPad', label: 'WordPad', capabilities: ['Microsoft.Windows.WordPad'] },
        { key: 'removeXboxApps', label: 'Xbox apps and Game Bar', packages: [
            'Microsoft.Xbox.TCUI', 'Microsoft.XboxApp', 'Microsoft.XboxGameOverlay', 'Microsoft.XboxGamingOverlay',
            'Microsoft.XboxIdentityProvider', 'Microsoft.XboxSpeechToTextOverlay', 'Microsoft.GamingApp'
        ], special: true },
        { key: 'removeYourPhone', label: 'Phone Link (Your Phone)', packages: ['Microsoft.YourPhone'] },
        { key: 'removeZuneVideo', label: 'Movies & TV', packages: ['Microsoft.ZuneVideo'] },
    ],

    /** Selectors of one kind ('packages' | 'capabilities' | 'features') for the enabled options, in catalog order. */
    selectors(config, kind) {
        const out = [];
        for (const option of this.options) {
            if (config[option.key] && option[kind]) out.push(...option[kind]);
        }
        return out;
    },

    /** Option keys whose selectors are all present in the given selector lists (used by the importer). */
    detect(packages, capabilities, features) {
        const has = (list, selectors) => selectors && selectors.length > 0 && selectors.every(s => list.includes(s));
        const keys = [];
        for (const option of this.options) {
            if (option.packages || option.capabilities || option.features) {
                const ok = [
                    option.packages ? has(packages, option.packages) : null,
                    option.capabilities ? has(capabilities, option.capabilities) : null,
                    option.features ? has(features, option.features) : null,
                ].filter(v => v !== null);
                if (ok.length && ok.every(Boolean)) keys.push(option.key);
            }
        }
        return keys;
    },
};

if (typeof module !== 'undefined') module.exports = RemovalCatalog;
