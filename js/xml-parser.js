/**
 * XML Parser - Import autounattend.xml and extract configuration
 */

class XmlParser {
    constructor(xmlString) {
        this.parser = new DOMParser();
        this.doc = this.parser.parseFromString(xmlString, 'application/xml');
        this.ns = {
            'u': 'urn:schemas-microsoft-com:unattend',
            'wcm': 'http://schemas.microsoft.com/WMIConfig/2002/State'
        };
        this.config = {};
    }

    /**
     * Parse XML and extract configuration
     */
    parse() {
        // Check for parsing errors
        const parserError = this.doc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid XML: ' + parserError.textContent);
        }

        // Extract from all passes
        this.parseWindowsPE();
        this.parseSpecialize();
        this.parseOobeSystem();

        return this.config;
    }

    /**
     * Helper to get element text content
     */
    getElementText(parent, tagName) {
        const elem = parent.querySelector(tagName);
        return elem ? elem.textContent.trim() : null;
    }

    /**
     * Parse WindowsPE pass
     */
    parseWindowsPE() {
        const windowsPE = this.doc.querySelector('settings[pass="windowsPE"]');
        if (!windowsPE) return;

        // International settings
        const intlCore = windowsPE.querySelector('component[name="Microsoft-Windows-International-Core-WinPE"]');
        if (intlCore) {
            const lang = this.getElementText(intlCore, 'UILanguage');
            if (lang) this.config.language = lang;

            const keyboard = this.getElementText(intlCore, 'InputLocale');
            if (keyboard) this.config.keyboard = keyboard;
        }

        // Windows Setup component
        const setup = windowsPE.querySelector('component[name="Microsoft-Windows-Setup"]');
        if (setup) {
            // Disk configuration
            const diskConfig = setup.querySelector('DiskConfiguration');
            if (diskConfig) {
                const disk = diskConfig.querySelector('Disk');
                if (disk) {
                    const diskId = this.getElementText(disk, 'DiskID');
                    if (diskId) this.config.installDisk = diskId;

                    const wipe = this.getElementText(disk, 'WillWipeDisk');
                    if (wipe) this.config.wipeDisk = wipe === 'true';

                    // Partition layout
                    const partitions = disk.querySelectorAll('CreatePartition');
                    if (partitions.length === 4) {
                        this.config.partitionLayout = 'uefi-recovery';
                    } else if (partitions.length === 3) {
                        this.config.partitionLayout = 'uefi';
                    } else if (partitions.length === 2) {
                        this.config.partitionLayout = 'bios';
                    }

                    // Recovery partition size
                    const recoveryPartition = Array.from(partitions).find(p => {
                        const size = this.getElementText(p, 'Size');
                        return size && parseInt(size) > 500;
                    });
                    if (recoveryPartition) {
                        const size = this.getElementText(recoveryPartition, 'Size');
                        if (size) this.config.recoveryPartitionSize = size;
                    }
                }
            }

            // Image install
            const installTo = setup.querySelector('InstallTo');
            if (installTo) {
                const partId = this.getElementText(installTo, 'PartitionID');
                if (partId) this.config.installPartition = partId;
            }

            // Edition
            const metadata = setup.querySelector('InstallFrom MetaData');
            if (metadata) {
                const key = this.getElementText(metadata, 'Key');
                const value = this.getElementText(metadata, 'Value');

                if (key === '/IMAGE/NAME' || key === '/IMAGE/INDEX') {
                    if (value) this.config.windowsEdition = value;
                }
            }

            // Product key
            const productKey = setup.querySelector('ProductKey Key');
            if (productKey) {
                const key = productKey.textContent.trim();
                if (key && key !== '') this.config.productKey = key;
            }

            // Bypass checks (from RunSynchronous commands)
            const runSync = setup.querySelector('RunSynchronous');
            if (runSync) {
                const commands = runSync.querySelectorAll('RunSynchronousCommand Path');
                commands.forEach(cmd => {
                    const path = cmd.textContent;
                    if (path.includes('BypassTPMCheck')) this.config.bypassTPM = true;
                    if (path.includes('BypassSecureBootCheck')) this.config.bypassSecureBoot = true;
                    if (path.includes('BypassRAMCheck')) this.config.bypassRAM = true;
                    if (path.includes('BypassStorageCheck')) this.config.bypassStorage = true;
                });
            }
        }

        // Extract processor architectures
        const components = windowsPE.querySelectorAll('component[processorArchitecture]');
        const archs = new Set();
        components.forEach(comp => {
            const arch = comp.getAttribute('processorArchitecture');
            if (arch) archs.add(arch);
        });

        // Set architecture checkboxes
        if (archs.has('x86')) this.config.arch_x86 = true;
        if (archs.has('amd64')) this.config.arch_amd64 = true;
        if (archs.has('arm64')) this.config.arch_arm64 = true;
    }

    /**
     * Parse Specialize pass
     */
    parseSpecialize() {
        const specialize = this.doc.querySelector('settings[pass="specialize"]');
        if (!specialize) return;

        // Shell setup
        const shell = specialize.querySelector('component[name="Microsoft-Windows-Shell-Setup"]');
        if (shell) {
            const computerName = this.getElementText(shell, 'ComputerName');
            if (computerName) {
                if (computerName === '*') {
                    this.config.computerNameMode = 'random';
                } else {
                    this.config.computerNameMode = 'custom';
                    this.config.computerName = computerName;
                }
            }

            const timezone = this.getElementText(shell, 'TimeZone');
            if (timezone) this.config.timezone = timezone;
        }

        // Windows Defender
        const defender = specialize.querySelector('component[name="Windows-Defender-ApplicationGuard"]');
        if (defender) {
            const disabled = this.getElementText(defender, 'DisableAntiSpyware');
            if (disabled === 'true') this.config.disableDefender = true;
        }
    }

    /**
     * Parse OobeSystem pass
     */
    parseOobeSystem() {
        const oobeSystem = this.doc.querySelector('settings[pass="oobeSystem"]');
        if (!oobeSystem) return;

        const shell = oobeSystem.querySelector('component[name="Microsoft-Windows-Shell-Setup"]');
        if (!shell) return;

        // OOBE settings
        const oobe = shell.querySelector('OOBE');
        if (oobe) {
            const hideEula = this.getElementText(oobe, 'HideEULAPage');
            const hideOEM = this.getElementText(oobe, 'HideOEMRegistrationScreen');
            const hideOnline = this.getElementText(oobe, 'HideOnlineAccountScreens');
            const hideWireless = this.getElementText(oobe, 'HideWirelessSetupInOOBE');
            const skipMachine = this.getElementText(oobe, 'SkipMachineOOBE');
            const skipUser = this.getElementText(oobe, 'SkipUserOOBE');
            const protectPC = this.getElementText(oobe, 'ProtectYourPC');

            // Set OOBE bypass flags
            if (hideEula === 'true') this.config.hideEula = true;
            if (hideOnline === 'true') this.config.bypassNRO = true;
            if (hideWireless === 'true') this.config.hideWireless = true;
            if (protectPC === '3') this.config.disablePrivacyQuestions = true;
        }

        // User accounts
        const localAccounts = shell.querySelector('UserAccounts LocalAccounts');
        if (localAccounts) {
            const accounts = localAccounts.querySelectorAll('LocalAccount');
            accounts.forEach((account, index) => {
                const name = this.getElementText(account, 'Name');
                const displayName = this.getElementText(account, 'DisplayName');
                const group = this.getElementText(account, 'Group');
                const password = this.getElementText(account, 'Password Value');

                if (name) {
                    this.config[`account${index + 1}Name`] = name;
                    if (displayName) this.config[`account${index + 1}DisplayName`] = displayName;
                    if (group) this.config[`account${index + 1}Group`] = group;
                    if (password) this.config[`account${index + 1}Password`] = password;
                }
            });
        }

        // Auto logon
        const autoLogon = shell.querySelector('AutoLogon');
        if (autoLogon) {
            const enabled = this.getElementText(autoLogon, 'Enabled');
            if (enabled === 'true') {
                this.config.autoLogon = true;
                const username = this.getElementText(autoLogon, 'Username');
                const password = this.getElementText(autoLogon, 'Password Value');
                if (username) this.config.autoLogonUsername = username;
                if (password) this.config.autoLogonPassword = password;
            }
        }

        // First logon commands
        const firstLogon = shell.querySelector('FirstLogonCommands');
        if (firstLogon) {
            const commands = firstLogon.querySelectorAll('SynchronousCommand');

            commands.forEach(cmd => {
                const commandLine = this.getElementText(cmd, 'CommandLine');
                if (!commandLine) return;

                // Detect registry tweaks
                if (commandLine.includes('AllowTelemetry')) this.config.disableTelemetry = true;
                if (commandLine.includes('HideFileExt')) this.config.showFileExtensions = true;
                if (commandLine.includes('LaunchTo')) this.config.explorerThisPC = true;
                if (commandLine.includes('TaskbarDa')) this.config.disableWidgets = true;
                if (commandLine.includes('TaskbarMn')) this.config.disableChat = true;
                if (commandLine.includes('ShowTaskViewButton')) this.config.hideTaskView = true;
                if (commandLine.includes('DisableSearchBoxSuggestions')) this.config.disableSearchHighlights = true;
                if (commandLine.includes('Start_TrackProgs')) this.config.disableStartMenuAds = true;

                // Detect custom scripts
                if (commandLine.includes('powershell') || commandLine.includes('cmd')) {
                    if (!commandLine.includes('reg add')) {
                        // This is a custom script, not a tweak
                        if (!this.config.customScript) {
                            this.config.customScript = commandLine;
                        }
                    }
                }
            });
        }
    }
}
