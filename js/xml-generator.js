/**
 * Comprehensive XML Generator for Windows Unattend Files
 * Supports 100+ configuration options
 */

class XmlGenerator {
    constructor(config) {
        this.config = config;
        this.commandOrder = 1;
    }

    /**
     * Generate complete autounattend.xml
     */
    generate() {
        const lines = [];
        lines.push('<?xml version="1.0" encoding="utf-8"?>');
        lines.push('<unattend xmlns="urn:schemas-microsoft-com:unattend">');

        // Get selected architectures
        const architectures = this.getSelectedArchitectures();

        // Generate for each architecture
        architectures.forEach(arch => {
            lines.push(...this.generateWindowsPE(arch));
            lines.push(...this.generateSpecialize(arch));
            lines.push(...this.generateOobeSystem(arch));
        });

        lines.push('</unattend>');

        return this.formatXML(lines.join('\n'));
    }

    /**
     * Get selected processor architectures
     */
    getSelectedArchitectures() {
        const archs = [];
        if (this.config.arch_x86) archs.push('x86');
        if (this.config.arch_amd64) archs.push('amd64');
        if (this.config.arch_arm64) archs.push('arm64');
        return archs.length > 0 ? archs : ['amd64'];
    }

    /**
     * WindowsPE Pass (1) - Initial Setup
     */
    generateWindowsPE(arch) {
        const lines = [];
        lines.push(`    <settings pass="windowsPE">`);

        // International Core
        lines.push(`        <component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">`);
        lines.push(`            <SetupUILanguage><UILanguage>${this.config.language || 'en-US'}</UILanguage></SetupUILanguage>`);
        lines.push(`            <InputLocale>${this.config.keyboard || '0409:00000409'}</InputLocale>`);
        lines.push(`            <SystemLocale>${this.config.language || 'en-US'}</SystemLocale>`);
        lines.push(`            <UILanguage>${this.config.language || 'en-US'}</UILanguage>`);
        lines.push(`            <UserLocale>${this.config.language || 'en-US'}</UserLocale>`);

        // Multi-language support
        if (this.config.languageSecondary || this.config.languageTertiary) {
            lines.push(`            <UILanguageFallback>en-US</UILanguageFallback>`);
        }

        lines.push(`        </component>`);

        // Windows Setup
        lines.push(`        <component name="Microsoft-Windows-Setup" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">`);

        // Bypass Windows 11 requirements
        if (this.config.bypassTPM || this.config.bypassSecureBoot || this.config.bypassRAM || this.config.bypassStorage) {
            lines.push(`            <RunSynchronous>`);
            let order = 1;
            if (this.config.bypassTPM || this.config.bypassSecureBoot || this.config.bypassRAM || this.config.bypassStorage) {
                lines.push(`                <RunSynchronousCommand wcm:action="add">`);
                lines.push(`                    <Order>${order++}</Order>`);
                lines.push(`                    <Path>reg add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassTPMCheck /t REG_DWORD /d 1 /f</Path>`);
                lines.push(`                </RunSynchronousCommand>`);
                lines.push(`                <RunSynchronousCommand wcm:action="add">`);
                lines.push(`                    <Order>${order++}</Order>`);
                lines.push(`                    <Path>reg add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassSecureBootCheck /t REG_DWORD /d 1 /f</Path>`);
                lines.push(`                </RunSynchronousCommand>`);
                lines.push(`                <RunSynchronousCommand wcm:action="add">`);
                lines.push(`                    <Order>${order++}</Order>`);
                lines.push(`                    <Path>reg add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassRAMCheck /t REG_DWORD /d 1 /f</Path>`);
                lines.push(`                </RunSynchronousCommand>`);
                lines.push(`                <RunSynchronousCommand wcm:action="add">`);
                lines.push(`                    <Order>${order++}</Order>`);
                lines.push(`                    <Path>reg add "HKLM\\SYSTEM\\Setup\\LabConfig" /v BypassStorageCheck /t REG_DWORD /d 1 /f</Path>`);
                lines.push(`                </RunSynchronousCommand>`);
            }
            lines.push(`            </RunSynchronous>`);
        }

        // Disk Configuration
        if (this.config.partitionMode === 'auto') {
            lines.push(`            <DiskConfiguration>`);
            lines.push(`                <Disk wcm:action="add">`);
            lines.push(`                    <DiskID>0</DiskID>`);
            lines.push(`                    <WillWipeDisk>${this.config.wipeDisk ? 'true' : 'false'}</WillWipeDisk>`);

            // Create Partitions
            lines.push(`                    <CreatePartitions>`);

            if (this.config.partitionStyle === 'gpt') {
                // GPT/UEFI
                const efiSize = this.config.efiSize || 100;
                const recoverySize = this.config.recoverySize || 990;

                // 1. EFI System Partition
                lines.push(`                        <CreatePartition wcm:action="add">`);
                lines.push(`                            <Order>1</Order>`);
                lines.push(`                            <Type>EFI</Type>`);
                lines.push(`                            <Size>${efiSize}</Size>`);
                lines.push(`                        </CreatePartition>`);

                // 2. MSR Partition
                lines.push(`                        <CreatePartition wcm:action="add">`);
                lines.push(`                            <Order>2</Order>`);
                lines.push(`                            <Type>MSR</Type>`);
                lines.push(`                            <Size>16</Size>`);
                lines.push(`                        </CreatePartition>`);

                // 3. Windows Partition
                const winOrder = this.config.recoveryMode === 'partition' ? 3 : 3;
                lines.push(`                        <CreatePartition wcm:action="add">`);
                lines.push(`                            <Order>${winOrder}</Order>`);
                lines.push(`                            <Type>Primary</Type>`);
                if (this.config.recoveryMode !== 'partition') {
                    lines.push(`                            <Extend>true</Extend>`);
                }
                lines.push(`                        </CreatePartition>`);

                // 4. Recovery Partition (optional)
                if (this.config.recoveryMode === 'partition') {
                    lines.push(`                        <CreatePartition wcm:action="add">`);
                    lines.push(`                            <Order>4</Order>`);
                    lines.push(`                            <Type>Primary</Type>`);
                    lines.push(`                            <Size>${recoverySize}</Size>`);
                    lines.push(`                        </CreatePartition>`);
                }
            } else {
                // MBR/BIOS
                lines.push(`                        <CreatePartition wcm:action="add">`);
                lines.push(`                            <Order>1</Order>`);
                lines.push(`                            <Type>Primary</Type>`);
                lines.push(`                            <Extend>true</Extend>`);
                lines.push(`                        </CreatePartition>`);
            }

            lines.push(`                    </CreatePartitions>`);

            // Modify Partitions
            lines.push(`                    <ModifyPartitions>`);

            if (this.config.partitionStyle === 'gpt') {
                // Format EFI
                lines.push(`                        <ModifyPartition wcm:action="add">`);
                lines.push(`                            <Order>1</Order>`);
                lines.push(`                            <PartitionID>1</PartitionID>`);
                lines.push(`                            <Label>System</Label>`);
                lines.push(`                            <Format>FAT32</Format>`);
                lines.push(`                        </ModifyPartition>`);

                // MSR doesn't need formatting

                // Format Windows
                lines.push(`                        <ModifyPartition wcm:action="add">`);
                lines.push(`                            <Order>2</Order>`);
                lines.push(`                            <PartitionID>3</PartitionID>`);
                lines.push(`                            <Label>Windows</Label>`);
                lines.push(`                            <Letter>C</Letter>`);
                lines.push(`                            <Format>NTFS</Format>`);
                lines.push(`                        </ModifyPartition>`);

                // Format Recovery
                if (this.config.recoveryMode === 'partition') {
                    lines.push(`                        <ModifyPartition wcm:action="add">`);
                    lines.push(`                            <Order>3</Order>`);
                    lines.push(`                            <PartitionID>4</PartitionID>`);
                    lines.push(`                            <Label>Recovery</Label>`);
                    lines.push(`                            <Format>NTFS</Format>`);
                    lines.push(`                            <TypeID>de94bba4-06d1-4d40-a16a-bfd50179d6ac</TypeID>`);
                    lines.push(`                        </ModifyPartition>`);
                }
            } else {
                // MBR
                lines.push(`                        <ModifyPartition wcm:action="add">`);
                lines.push(`                            <Active>true</Active>`);
                lines.push(`                            <Format>NTFS</Format>`);
                lines.push(`                            <Label>Windows</Label>`);
                lines.push(`                            <Letter>C</Letter>`);
                lines.push(`                            <Order>1</Order>`);
                lines.push(`                            <PartitionID>1</PartitionID>`);
                lines.push(`                        </ModifyPartition>`);
            }

            lines.push(`                    </ModifyPartitions>`);
            lines.push(`                </Disk>`);
            lines.push(`            </DiskConfiguration>`);

            // Image Install
            const installPartitionID = this.config.partitionStyle === 'gpt' ? 3 : 1;
            lines.push(`            <ImageInstall>`);
            lines.push(`                <OSImage>`);
            lines.push(`                    <InstallTo>`);
            lines.push(`                        <DiskID>0</DiskID>`);
            lines.push(`                        <PartitionID>${installPartitionID}</PartitionID>`);
            lines.push(`                    </InstallTo>`);

            // Windows Edition
            if (this.config.windowsEdition) {
                lines.push(`                    <InstallFrom>`);
                lines.push(`                        <MetaData wcm:action="add">`);
                lines.push(`                            <Key>/IMAGE/NAME</Key>`);
                lines.push(`                            <Value>${this.config.windowsEdition}</Value>`);
                lines.push(`                        </MetaData>`);
                lines.push(`                    </InstallFrom>`);
            }

            lines.push(`                </OSImage>`);
            lines.push(`            </ImageInstall>`);
        } else if (this.config.partitionMode === 'custom' && this.config.customDiskPart) {
            // Custom DiskPart script
            lines.push(`            <DiskConfiguration>`);
            lines.push(`                <Disk wcm:action="add">`);
            lines.push(`                    <DiskID>0</DiskID>`);
            lines.push(`                    <CreatePartitions />`);
            lines.push(`                </Disk>`);
            lines.push(`            </DiskConfiguration>`);
        }

        // UserData (Product Key & EULA)
        lines.push(`            <UserData>`);
        lines.push(`                <AcceptEula>true</AcceptEula>`);

        if (this.config.productKeyMode === 'custom' && this.config.productKey) {
            lines.push(`                <ProductKey>`);
            lines.push(`                    <Key>${this.config.productKey}</Key>`);
            lines.push(`                    <WillShowUI>OnError</WillShowUI>`);
            lines.push(`                </ProductKey>`);
        } else if (this.config.productKeyMode === 'generic') {
            const genericKeys = {
                'Professional': 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
                'Home': 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99',
                'Education': 'NW6C2-QMPVW-D7KKK-3GKT6-VCFB2',
                'Enterprise': 'NPPR9-FWDCX-D2C8J-H872K-2YT43'
            };
            const key = genericKeys[this.config.windowsEdition] || genericKeys['Professional'];
            lines.push(`                <ProductKey>`);
            lines.push(`                    <Key>${key}</Key>`);
            lines.push(`                    <WillShowUI>OnError</WillShowUI>`);
            lines.push(`                </ProductKey>`);
        }

        lines.push(`            </UserData>`);

        lines.push(`        </component>`);
        lines.push(`    </settings>`);

        return lines;
    }

    /**
     * Specialize Pass (4) - System Configuration
     */
    generateSpecialize(arch) {
        const lines = [];
        lines.push(`    <settings pass="specialize">`);

        // Shell Setup - Computer Name
        lines.push(`        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">`);

        let computerName = '*';
        if (this.config.computerNameMode === 'custom' && this.config.computerName) {
            computerName = this.config.computerName.substring(0, 15).replace(/[^a-zA-Z0-9-]/g, '');
        }
        lines.push(`            <ComputerName>${computerName}</ComputerName>`);
        lines.push(`            <TimeZone>${this.config.timezone || 'Pacific Standard Time'}</TimeZone>`);

        lines.push(`        </component>`);

        // Windows Defender
        if (this.config.disableDefender) {
            lines.push(`        <component name="Windows-Defender-ApplicationGuard" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">`);
            lines.push(`            <DisableAntiSpyware>true</DisableAntiSpyware>`);
            lines.push(`        </component>`);
        }

        lines.push(`    </settings>`);

        return lines;
    }

    /**
     * OobeSystem Pass (7) - User Experience & First Boot
     */
    generateOobeSystem(arch) {
        const lines = [];
        lines.push(`    <settings pass="oobeSystem">`);

        // Shell Setup
        lines.push(`        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">`);

        // OOBE Settings
        lines.push(`            <OOBE>`);
        lines.push(`                <HideEULAPage>true</HideEULAPage>`);
        lines.push(`                <HideOEMRegistrationScreen>true</HideOEMRegistrationScreen>`);
        lines.push(`                <HideOnlineAccountScreens>true</HideOnlineAccountScreens>`);
        lines.push(`                <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>`);

        // Privacy settings
        if (this.config.privacySettings === 'disable') {
            lines.push(`                <ProtectYourPC>3</ProtectYourPC>`);
        } else if (this.config.privacySettings === 'enable') {
            lines.push(`                <ProtectYourPC>1</ProtectYourPC>`);
        }

        if (this.config.skipMachineOOBE) {
            lines.push(`                <SkipMachineOOBE>true</SkipMachineOOBE>`);
        }
        if (this.config.skipUserOOBE) {
            lines.push(`                <SkipUserOOBE>true</SkipUserOOBE>`);
        }

        lines.push(`            </OOBE>`);

        // User Accounts
        const accounts = this.getAccounts();
        if (accounts.length > 0) {
            lines.push(`            <UserAccounts>`);
            lines.push(`                <LocalAccounts>`);

            accounts.forEach((account, index) => {
                lines.push(`                    <LocalAccount wcm:action="add">`);
                lines.push(`                        <Name>${account.username || 'User'}</Name>`);
                lines.push(`                        <DisplayName>${account.displayname || account.username || 'User'}</DisplayName>`);
                lines.push(`                        <Group>${account.group || 'Users'}</Group>`);
                lines.push(`                        <Password>`);
                if (account.password) {
                    const encoded = btoa(account.password + 'Password');
                    lines.push(`                            <Value>${encoded}</Value>`);
                    lines.push(`                            <PlainText>false</PlainText>`);
                } else {
                    lines.push(`                            <Value></Value>`);
                    lines.push(`                            <PlainText>true</PlainText>`);
                }
                lines.push(`                        </Password>`);
                lines.push(`                    </LocalAccount>`);
            });

            lines.push(`                </LocalAccounts>`);

            // Built-in Administrator
            if (this.config.enableBuiltinAdmin) {
                lines.push(`                <AdministratorPassword>`);
                if (this.config.builtinAdminPassword) {
                    const encoded = btoa(this.config.builtinAdminPassword + 'AdministratorPassword');
                    lines.push(`                    <Value>${encoded}</Value>`);
                    lines.push(`                    <PlainText>false</PlainText>`);
                } else {
                    lines.push(`                    <Value></Value>`);
                    lines.push(`                    <PlainText>true</PlainText>`);
                }
                lines.push(`                </AdministratorPassword>`);
            }

            lines.push(`            </UserAccounts>`);

            // Auto Logon
            const autoLogonAccount = accounts.find(a => a.autologon);
            if (autoLogonAccount) {
                lines.push(`            <AutoLogon>`);
                lines.push(`                <Enabled>true</Enabled>`);
                lines.push(`                <LogonCount>999</LogonCount>`);
                lines.push(`                <Username>${autoLogonAccount.username}</Username>`);
                lines.push(`                <Password>`);
                if (autoLogonAccount.password) {
                    const encoded = btoa(autoLogonAccount.password + 'Password');
                    lines.push(`                    <Value>${encoded}</Value>`);
                    lines.push(`                    <PlainText>false</PlainText>`);
                } else {
                    lines.push(`                    <Value></Value>`);
                    lines.push(`                    <PlainText>true</PlainText>`);
                }
                lines.push(`                </Password>`);
                lines.push(`            </AutoLogon>`);
            }
        }

        // First Logon Commands
        const firstLogonCommands = this.generateFirstLogonCommands();
        if (firstLogonCommands.length > 0) {
            lines.push(`            <FirstLogonCommands>`);
            firstLogonCommands.forEach(cmd => lines.push(cmd));
            lines.push(`            </FirstLogonCommands>`);
        }

        lines.push(`        </component>`);
        lines.push(`    </settings>`);

        return lines;
    }

    /**
     * Generate First Logon Commands (scripts and tweaks)
     */
    generateFirstLogonCommands() {
        const commands = [];
        this.commandOrder = 1;

        // Registry tweaks
        const registryCommands = RegistryGenerator.generate(this.config);
        registryCommands.forEach(cmd => {
            commands.push(`                <SynchronousCommand wcm:action="add">`);
            commands.push(`                    <Order>${this.commandOrder++}</Order>`);
            commands.push(`                    <CommandLine>cmd /c ${this.escapeXml(cmd)}</CommandLine>`);
            commands.push(`                    <Description>Registry Tweak</Description>`);
            commands.push(`                </SynchronousCommand>`);
        });

        // VM Guest Tools
        if (this.config.vmVirtualBox) {
            commands.push(`                <SynchronousCommand wcm:action="add">`);
            commands.push(`                    <Order>${this.commandOrder++}</Order>`);
            commands.push(`                    <CommandLine>E:\\VBoxWindowsAdditions.exe /S</CommandLine>`);
            commands.push(`                    <Description>Install VirtualBox Guest Additions</Description>`);
            commands.push(`                </SynchronousCommand>`);
        }

        if (this.config.vmVMware) {
            commands.push(`                <SynchronousCommand wcm:action="add">`);
            commands.push(`                    <Order>${this.commandOrder++}</Order>`);
            commands.push(`                    <CommandLine>E:\\setup.exe /S /v "/qn REBOOT=R"</CommandLine>`);
            commands.push(`                    <Description>Install VMware Tools</Description>`);
            commands.push(`                </SynchronousCommand>`);
        }

        // Custom Scripts
        if (this.config.firstLogonScriptType && this.config.firstLogonScript) {
            const scriptExt = this.config.firstLogonScriptType;
            const scriptContent = this.config.firstLogonScript;
            const scriptPath = `C:\\Windows\\Setup\\Scripts\\FirstLogon.${scriptExt}`;

            // Create script file
            commands.push(`                <SynchronousCommand wcm:action="add">`);
            commands.push(`                    <Order>${this.commandOrder++}</Order>`);
            const encoded = btoa(scriptContent);
            commands.push(`                    <CommandLine>powershell -Command "mkdir C:\\Windows\\Setup\\Scripts -Force; [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${encoded}')) | Out-File '${scriptPath}'"</CommandLine>`);
            commands.push(`                    <Description>Create First Logon Script</Description>`);
            commands.push(`                </SynchronousCommand>`);

            // Execute script
            commands.push(`                <SynchronousCommand wcm:action="add">`);
            commands.push(`                    <Order>${this.commandOrder++}</Order>`);
            if (scriptExt === 'ps1') {
                commands.push(`                    <CommandLine>powershell -ExecutionPolicy Bypass -File "${scriptPath}"</CommandLine>`);
            } else if (scriptExt === 'cmd') {
                commands.push(`                    <CommandLine>cmd /c "${scriptPath}"</CommandLine>`);
            } else if (scriptExt === 'reg') {
                commands.push(`                    <CommandLine>reg import "${scriptPath}"</CommandLine>`);
            } else {
                commands.push(`                    <CommandLine>cscript //nologo "${scriptPath}"</CommandLine>`);
            }
            commands.push(`                    <Description>Execute First Logon Script</Description>`);
            commands.push(`                </SynchronousCommand>`);
        }

        return commands;
    }

    /**
     * Get user accounts from form
     */
    getAccounts() {
        const accounts = [];
        const form = document.getElementById('unattendForm');
        if (!form) return accounts;

        let index = 0;
        while (true) {
            const usernameField = form.elements[`account_${index}_username`];
            if (!usernameField || !usernameField.value) break;

            accounts.push({
                username: usernameField.value,
                displayname: form.elements[`account_${index}_displayname`]?.value || usernameField.value,
                password: form.elements[`account_${index}_password`]?.value || '',
                group: form.elements[`account_${index}_group`]?.value || 'Users',
                autologon: form.elements[`account_${index}_autologon`]?.checked || false
            });

            index++;
        }

        return accounts;
    }

    /**
     * Escape XML special characters
     */
    escapeXml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Format XML with proper indentation
     */
    formatXML(xml) {
        const formatted = [];
        let indent = '';
        xml.split(/>\s*</).forEach(node => {
            if (node.match(/^\/\w/)) indent = indent.substring(4);
            formatted.push(indent + '<' + node + '>');
            if (node.match(/^<?\w[^>]*[^\/]$/)) indent += '    ';
        });
        return formatted.join('\n').replace(/^    /, '').replace(/>[\n]</g, '>\n<');
    }
}
