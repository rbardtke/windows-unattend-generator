/**
 * XML Generator - builds autounattend.xml the way the schneegans.de generator does.
 *
 * All tweaks are PowerShell blocks collected into four runner scripts that are embedded in an
 * <Extensions> block and extracted to C:\Windows\Setup\Scripts during the specialize pass:
 *
 *   Specialize.ps1   runs as SYSTEM during specialize (machine-wide settings, app removal)
 *   DefaultUser.ps1  runs against the loaded default user hive (HKU\DefaultUser), so every
 *                    account created later inherits the settings
 *   UserOnce.ps1     runs once per user through RunOnce (settings that need a live profile)
 *   FirstLogon.ps1   runs at the first logon of the auto-logon account
 *
 * Output uses CRLF line endings and tab indentation, like the original generator.
 */

const SCRIPTS_DIR = 'C:\\Windows\\Setup\\Scripts';
const CRLF = '\r\n';

const GENERIC_KEYS = {
    'Home': 'YTMG3-N6DKC-DKB77-7M9GH-8HVX7',
    'Home N': '4CPRK-NM3K3-X6XXQ-RXX86-WXCHW',
    'Professional': 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    'Professional N': '2B87N-8KFHP-DKV6R-Y2C8J-PKCKT',
    'Education': 'YNMGQ-8RYV3-4PGQ3-C8XTP-7CFBY',
    'Education N': '84NGF-MHBT6-FXBX8-QWJK7-DRR8H',
    'Enterprise': 'XGVPP-NMH47-7TTHJ-W3FW7-8HV2C',
    'Enterprise N': 'WGGHN-J84D6-QYCPR-T7PJ7-X766F',
    'ProfessionalWorkstation': 'DXG7C-N36C4-C4HTG-X4T3X-2YV77',
};

const VISUAL_EFFECT_KEYS = [
    'ControlAnimations', 'AnimateMinMax', 'TaskbarAnimations', 'DWMAeroPeekEnabled', 'MenuAnimation',
    'TooltipAnimation', 'SelectionFade', 'DWMSaveThumbnailEnabled', 'CursorShadow', 'ListviewShadow',
    'ThumbnailsOrIcon', 'ListviewAlphaSelect', 'DragFullWindows', 'ComboBoxAnimation', 'FontSmoothing',
    'ListBoxSmoothScrolling', 'DropShadow',
];

const VISUAL_EFFECT_FORM_KEYS = {
    vfxAnimateWindows: 'AnimateMinMax',
    vfxAnimateControls: 'ControlAnimations',
    vfxFadeMenu: 'MenuAnimation',
    vfxFadeTooltips: 'TooltipAnimation',
    vfxSmoothScroll: 'ListBoxSmoothScrolling',
    vfxSlideTaskbar: 'ComboBoxAnimation',
    vfxShadowsWindows: 'DropShadow',
    vfxShadowsMouse: 'CursorShadow',
    vfxThumbnails: 'ThumbnailsOrIcon',
    vfxTranslucent: 'ListviewAlphaSelect',
    vfxPeek: 'DWMAeroPeekEnabled',
    vfxTaskbarThumbnails: 'DWMSaveThumbnailEnabled',
};

/** Desktop icon CLSIDs in the order the original generator writes them. */
const DESKTOP_ICONS = [
    ['{5399e694-6ce5-4d6c-8fce-1d8870fdcba0}', 'desktopIconControlPanel'],
    ['{b4bfcc3a-db2c-424c-b029-7fe99a87c641}', 'desktopIconDesktop'],
    ['{a8cdff1c-4878-43be-b5fd-f8091c1c60d0}', 'desktopIconDocuments'],
    ['{374de290-123f-4565-9164-39c4925e467b}', 'desktopIconDownloads'],
    ['{e88865ea-0e1c-4e20-9aa6-edcd0212c87c}', 'desktopIconGallery'],
    ['{f874310e-b6b7-47dc-bc84-b9e6b38f5903}', 'desktopIconHome'],
    ['{1cf1260c-4dd0-4ebb-811f-33c572699fde}', 'desktopIconMusic'],
    ['{f02c1a0d-be21-4350-88b0-7367fc96ef3c}', 'desktopIconNetwork'],
    ['{3add1653-eb32-4cb0-bbd7-dfa0abb5acca}', 'desktopIconPictures'],
    ['{645ff040-5081-101b-9f08-00aa002f954e}', 'desktopIconRecycleBin'],
    ['{20d04fe0-3aea-1069-a2d8-08002b30309d}', 'desktopIconThisPC'],
    ['{59031a47-3f72-44a7-89c5-5595fe6b30ee}', 'desktopIconUserFiles'],
    ['{a0953c92-50dc-43bf-be83-3742fed03c9c}', 'desktopIconVideos'],
];

const START_FOLDERS = {
    startFolderSettings: 'AllowPinnedFolderSettings',
    startFolderFileExplorer: 'AllowPinnedFolderFileExplorer',
    startFolderDocuments: 'AllowPinnedFolderDocuments',
    startFolderDownloads: 'AllowPinnedFolderDownloads',
    startFolderMusic: 'AllowPinnedFolderMusic',
    startFolderPictures: 'AllowPinnedFolderPictures',
    startFolderVideos: 'AllowPinnedFolderVideos',
    startFolderNetwork: 'AllowPinnedFolderNetwork',
    startFolderPersonalFolder: 'AllowPinnedFolderPersonalFolder',
};

const CONTENT_DELIVERY_NAMES = [
    'ContentDeliveryAllowed', 'FeatureManagementEnabled', 'OEMPreInstalledAppsEnabled', 'PreInstalledAppsEnabled',
    'PreInstalledAppsEverEnabled', 'SilentInstalledAppsEnabled', 'SoftLandingEnabled', 'SubscribedContentEnabled',
    'SubscribedContent-310093Enabled', 'SubscribedContent-338387Enabled', 'SubscribedContent-338388Enabled',
    'SubscribedContent-338389Enabled', 'SubscribedContent-338393Enabled', 'SubscribedContent-353694Enabled',
    'SubscribedContent-353696Enabled', 'SubscribedContent-353698Enabled', 'SystemPaneSuggestionsEnabled',
];

class XmlGenerator {
    constructor(config, options) {
        const defaults = (typeof ConfigModel !== 'undefined') ? ConfigModel.getDefaults() : {};
        this.config = Object.assign(defaults, config || {});
        this.options = options || {};
        this.accounts = this.collectAccounts();
        this.files = [];
        this.specialize = [];
        this.defaultUser = [];
        this.userOnce = [];
        this.firstLogon = [];
        this.userOnceNeedsExplorerRestart = false;
        this.customScriptIndex = 0;
    }

    /* ------------------------------------------------------------------ helpers */

    static escapeXml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/[^\x00-\x7f]/g, ch => '&#x' + ch.codePointAt(0).toString(16).toUpperCase() + ';');
    }

    static escapeAttr(value) {
        return XmlGenerator.escapeXml(value).replace(/"/g, '&quot;');
    }

    /** PowerShell single-quoted string literal. */
    static ps(value) {
        return "'" + String(value).replace(/'/g, "''") + "'";
    }

    static crlf(text) {
        return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, CRLF);
    }

    collectAccounts() {
        const c = this.config;
        if (Array.isArray(c.accounts) && c.accounts.some(a => a && a.username)) {
            return c.accounts.filter(a => a && a.username);
        }
        const accounts = [];
        for (let i = 0; i < 99; i++) {
            const username = c[`account_${i}_username`];
            if (!username) {
                if (i === 0) continue;
                break;
            }
            accounts.push({
                username,
                displayname: c[`account_${i}_displayname`] || '',
                password: c[`account_${i}_password`] || '',
                group: c[`account_${i}_group`] || 'Users',
                autologon: Boolean(c[`account_${i}_autologon`]),
            });
        }
        return accounts;
    }

    architectures() {
        const archs = [];
        if (this.config.arch_x86) archs.push('x86');
        if (this.config.arch_amd64) archs.push('amd64');
        if (this.config.arch_arm64) archs.push('arm64');
        return archs.length ? archs : ['amd64'];
    }

    addFile(path, content) {
        this.files.push({ path, content: XmlGenerator.crlf(content) });
    }

    invoke(fileName) {
        return `& '${SCRIPTS_DIR}\\${fileName}';`;
    }

    /** Command line that runs an embedded script file (specialize pass, RunOnce, first logon). */
    static runScriptCommand(fileName, forRegValue) {
        const q = forRegValue ? '\\""' : '"';
        return `powershell.exe -WindowStyle ${q}Normal${q} -ExecutionPolicy ${q}Unrestricted${q} -NoProfile -File ${q}${SCRIPTS_DIR}\\${fileName}${q}`;
    }

    /** All custom scripts of a phase: <prefix>Script / <prefix>ScriptType, then <prefix>Script_2 ... */
    customScriptsFor(prefix, phase) {
        const c = this.config;
        const blocks = [];
        for (let i = 1; i <= 50; i++) {
            const suffix = i === 1 ? '' : `_${i}`;
            const type = c[`${prefix}ScriptType${suffix}`];
            const content = c[`${prefix}Script${suffix}`];
            if (i > 1 && type === undefined && content === undefined) break;
            const block = this.customScript(type, content, phase);
            if (block) blocks.push(block);
        }
        return blocks;
    }

    /** Embed a user script for a phase and return the block that runs it. */
    customScript(type, content, phase) {
        if (!type || !content || !content.trim()) return null;
        this.customScriptIndex++;
        const name = `unattend-${String(this.customScriptIndex).padStart(2, '0')}.${type}`;
        let body = content.trim();
        if (type === 'reg' && phase === 'defaultUser') {
            body = body.replace(/HKEY_CURRENT_USER/g, 'HKEY_USERS\\DefaultUser').replace(/\bHKCU\\/g, 'HKU\\DefaultUser\\');
        }
        this.addFile(`${SCRIPTS_DIR}\\${name}`, body);
        const path = `${SCRIPTS_DIR}\\${name}`;
        switch (type) {
            case 'ps1': return this.invoke(name);
            case 'cmd': return `cmd.exe /c "${path}";`;
            case 'reg': return `reg.exe import "${path}";`;
            default: return `cscript.exe //nologo "${path}";`;
        }
    }

    /** Render a runner script with the given blocks. */
    runner(blocks, activity, logFile) {
        const lines = ['$scripts = @('];
        for (const block of blocks) {
            lines.push('\t{');
            for (const line of XmlGenerator.crlf(block).split(CRLF)) lines.push('\t\t' + line);
            lines.push('\t};');
        }
        lines.push(');');
        lines.push('');
        lines.push('& {');
        lines.push('  [float] $complete = 0;');
        lines.push('  [float] $increment = 100 / $scripts.Count;');
        lines.push('  foreach( $script in $scripts ) {');
        lines.push(`    Write-Progress -Id 0 -Activity '${activity}' -PercentComplete $complete;`);
        lines.push("    '*** Will now execute command «{0}».' -f $(");
        lines.push("      $script.ToString().Trim() -replace '\\s+', ' ' -replace '^(.{99})(.+)$', '$1…';");
        lines.push('    );');
        lines.push('    $start = [datetime]::Now;');
        lines.push('    & $script;');
        lines.push("    '*** Finished executing command after {0:0} ms.' -f [datetime]::Now.Subtract( $start ).TotalMilliseconds;");
        lines.push('    "`r`n" * 3;');
        lines.push('    $complete += $increment;');
        lines.push('  }');
        lines.push(`} *>&1 | Out-String -Width 1KB -Stream >> "${logFile}";`);
        return lines.join(CRLF);
    }

    static selectorList(selectors) {
        return selectors.map(s => `\t'${s}';`).join(CRLF);
    }

    lockKeyMask() {
        const c = this.config;
        const states = [c.capsLockState, c.numLockState, c.scrollLockState];
        if (states.every(s => !s || s === 'default')) return null;
        let mask = 0;
        if (c.capsLockState === 'on') mask |= 1;
        if (c.numLockState === 'on') mask |= 2;
        if (c.scrollLockState === 'on') mask |= 4;
        return mask;
    }

    static base64Payload(value) {
        if (!value) return '';
        const comma = value.indexOf(',');
        return value.startsWith('data:') && comma > 0 ? value.slice(comma + 1) : value;
    }

    static imageExtension(value) {
        const m = /^data:image\/(png|jpeg|jpg|bmp)/i.exec(value || '');
        if (!m) return 'jpg';
        return m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    }

    /* ---------------------------------------------------------------- scripts */

    buildScripts() {
        this.buildSpecialize();
        this.buildDefaultUser();
        this.buildUserOnce();
        this.buildFirstLogon();

        if (this.userOnce.length) {
            this.defaultUser.push(String.raw`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "UnattendedSetup" /t REG_SZ /d "` + XmlGenerator.runScriptCommand('UserOnce.ps1', true) + '" /f;');
        }

        if (this.specialize.length) {
            this.addFile(`${SCRIPTS_DIR}\\Specialize.ps1`, this.runner(this.specialize,
                'Running scripts to customize your Windows installation. Do not close this window.',
                `${SCRIPTS_DIR}\\Specialize.log`));
        }
        if (this.userOnce.length) {
            this.addFile(`${SCRIPTS_DIR}\\UserOnce.ps1`, this.runner(this.userOnce,
                'Running scripts to configure this user account. Do not close this window.',
                '$env:TEMP\\UserOnce.log'));
        }
        if (this.defaultUser.length) {
            this.addFile(`${SCRIPTS_DIR}\\DefaultUser.ps1`, this.runner(this.defaultUser,
                'Running scripts to modify the default user\u2019\u2019s registry hive. Do not close this window.',
                `${SCRIPTS_DIR}\\DefaultUser.log`));
        }
        if (this.firstLogon.length) {
            this.addFile(`${SCRIPTS_DIR}\\FirstLogon.ps1`, this.runner(this.firstLogon,
                'Running scripts to finalize your Windows installation. Do not close this window.',
                `${SCRIPTS_DIR}\\FirstLogon.log`));
        }
    }

    buildSpecialize() {
        const c = this.config;
        const S = this.specialize;
        const R = String.raw;

        if (c.bypassNRO) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OOBE" /v BypassNRO /t REG_DWORD /d 1 /f;`);

        if (c.computerNameMode === 'script' && c.computerNameScript && c.computerNameScript.trim()) {
            S.push('$name = & {' + CRLF + XmlGenerator.crlf(c.computerNameScript.trim()).split(CRLF).map(l => '\t' + l).join(CRLF) + CRLF + '};' + CRLF + "Rename-Computer -NewName $name -Force -ErrorAction 'Continue';");
        }

        if (c.removeDevHome) S.push(R`Remove-Item -LiteralPath 'Registry::HKLM\Software\Microsoft\WindowsUpdate\Orchestrator\UScheduler_Oobe\DevHomeUpdate' -Force -ErrorAction 'SilentlyContinue';`);
        if (c.removeOneDrive) {
            S.push('@(' + CRLF +
                R`  'C:\Users\Default\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\OneDrive.lnk';` + CRLF +
                R`  'C:\Windows\System32\OneDriveSetup.exe';` + CRLF +
                R`  'C:\Windows\SysWOW64\OneDriveSetup.exe';` + CRLF +
                R`) | Where-Object -FilterScript { [System.IO.File]::Exists( $_ ); } | Remove-Item -Verbose -ErrorAction 'Continue';`);
        }
        if (c.removeOutlook) S.push(R`Remove-Item -LiteralPath 'Registry::HKLM\Software\Microsoft\WindowsUpdate\Orchestrator\UScheduler_Oobe\OutlookUpdate' -Force -ErrorAction 'SilentlyContinue';`);
        if (c.removeTeams) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Communications" /v ConfigureChatAutoInstall /t REG_DWORD /d 0 /f;`);

        const packages = RemovalCatalog.selectors(c, 'packages');
        if (packages.length) {
            this.addFile(`${SCRIPTS_DIR}\\RemovePackage.ps1`, ScriptTemplates.removePackages.replace('__SELECTORS__', XmlGenerator.selectorList(packages)));
            S.push(this.invoke('RemovePackage.ps1'));
        }
        const capabilities = RemovalCatalog.selectors(c, 'capabilities');
        if (capabilities.length) {
            this.addFile(`${SCRIPTS_DIR}\\RemoveCapability.ps1`, ScriptTemplates.removeCapabilities.replace('__SELECTORS__', XmlGenerator.selectorList(capabilities)));
            S.push(this.invoke('RemoveCapability.ps1'));
        }
        const features = RemovalCatalog.selectors(c, 'features');
        if (features.length) {
            this.addFile(`${SCRIPTS_DIR}\\RemoveFeature.ps1`, ScriptTemplates.removeFeatures.replace('__SELECTORS__', XmlGenerator.selectorList(features)));
            S.push(this.invoke('RemoveFeature.ps1'));
        }
        if (c.removeEdge) {
            S.push('$setup = Get-ChildItem -Path "${env:ProgramFiles(x86)}\\Microsoft\\Edge\\Application\\*\\Installer\\setup.exe" -ErrorAction \'SilentlyContinue\' | Select-Object -First 1;' + CRLF +
                R`if( $setup ) {` + CRLF +
                R`	& $setup.FullName --uninstall --system-level --verbose-logging --force-uninstall;` + CRLF +
                R`}`);
        }

        if (c.lockoutMode === 'disabled') {
            S.push('net.exe accounts /lockoutthreshold:0;');
        } else if (c.lockoutMode === 'custom') {
            S.push(`net.exe accounts /lockoutthreshold:${parseInt(c.lockoutThreshold, 10) || 5} /lockoutwindow:${parseInt(c.lockoutWindow, 10) || 30} /lockoutduration:${parseInt(c.lockoutDuration, 10) || 30};`);
        }
        if (c.passwordExpiration === 'never') {
            S.push('net.exe accounts /maxpwage:UNLIMITED;');
        } else if (c.passwordExpiration === 'custom') {
            S.push(`net.exe accounts /maxpwage:${parseInt(c.passwordExpirationDays, 10) || 90};`);
        }

        if (c.disableFastStartup) S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Power" /v HiberbootEnabled /t REG_DWORD /d 0 /f;`);
        if (c.taskbarHideWidgets) S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Dsh" /v AllowNewsAndInterests /t REG_DWORD /d 0 /f;`);
        if (c.disableAppSuggestions) S.push(R`reg.exe add "HKLM\Software\Policies\Microsoft\Windows\CloudContent" /v "DisableWindowsConsumerFeatures" /t REG_DWORD /d 1 /f;`);
        if (c.disableDeviceEncryption) S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\BitLocker" /v "PreventDeviceEncryption" /t REG_DWORD /d 1 /f;`);
        if (c.disableEdgeFirstRun) S.push(R`reg.exe add "HKLM\Software\Policies\Microsoft\Edge" /v HideFirstRunExperience /t REG_DWORD /d 1 /f;`);
        if (c.disableEdgeStartupBoost) S.push(R`reg.exe add "HKLM\Software\Policies\Microsoft\Edge" /v StartupBoostEnabled /t REG_DWORD /d 0 /f;`);

        if (c.startPinsWin11 === 'none' || (c.startPinsWin11 === 'custom' && c.startPinsWin11JSON && c.startPinsWin11JSON.trim())) {
            const json = c.startPinsWin11 === 'none' ? '{"pinnedList":[]}' : c.startPinsWin11JSON.trim().replace(/'/g, "''");
            this.addFile(`${SCRIPTS_DIR}\\SetStartPins.ps1`, ScriptTemplates.setStartPins.replace('__JSON__', json));
            S.push(this.invoke('SetStartPins.ps1'));
        }
        if (c.startTilesWin10 === 'none') {
            this.addFile('C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\LayoutModification.xml', ScriptTemplates.layoutModificationEmpty);
        } else if (c.startTilesWin10 === 'custom' && c.startTilesWin10XML && c.startTilesWin10XML.trim()) {
            this.addFile('C:\\Users\\Default\\AppData\\Local\\Microsoft\\Windows\\Shell\\LayoutModification.xml', c.startTilesWin10XML.trim());
        }

        const effects = this.visualEffectValues();
        if (effects) {
            S.push(effects.map(([key, value]) =>
                `Set-ItemProperty -LiteralPath "Registry::HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects\\${key}" -Name 'DefaultValue' -Value ${value} -Type 'DWord' -Force;`
            ).join(CRLF));
        }

        const folders = Object.entries(START_FOLDERS).filter(([formKey]) => c[formKey]);
        if (folders.length) {
            const lines = [];
            for (const [, name] of folders) {
                lines.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Start" /v ` + name + ' /t REG_DWORD /d 1 /f;');
                lines.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Start" /v ` + name + '_ProviderSet /t REG_DWORD /d 1 /f;');
            }
            S.push(lines.join(CRLF));
        }

        if (c.disableDefender) {
            S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows Defender" /v DisableAntiSpyware /t REG_DWORD /d 1 /f;` + CRLF +
                R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection" /v DisableRealtimeMonitoring /t REG_DWORD /d 1 /f;`);
        }
        if (c.disableUpdates) S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v NoAutoUpdate /t REG_DWORD /d 1 /f;`);
        if (c.disableAutoReboot) S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" /v NoAutoRebootWithLoggedOnUsers /t REG_DWORD /d 1 /f;`);
        if (c.disableUAC) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 0 /f;`);
        if (c.disableSmartScreen) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" /v SmartScreenEnabled /t REG_SZ /d "Off" /f;`);
        if (c.disableSmartAppControl) S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\CI\Policy" /v VerifiedAndReputablePolicyState /t REG_DWORD /d 0 /f;`);
        if (c.disableCoreIsolation) S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v Enabled /t REG_DWORD /d 0 /f;`);
        if (c.disableTelemetry) S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f;`);
        if (c.enableLongPaths) S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f;`);
        if (c.enableRemoteDesktop) {
            S.push(R`reg.exe add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f;` + CRLF +
                R`netsh.exe advfirewall firewall set rule group="remote desktop" new enable=Yes;`);
        }
        if (c.disableSystemRestore) S.push("Disable-ComputerRestore -Drive 'C:\\' -ErrorAction 'Continue';");
        if (c.optimizeLastAccessTime) S.push('fsutil.exe behavior set disablelastaccess 1;');
        if (c.setPowerShellExecutionPolicy) S.push("Set-ExecutionPolicy -ExecutionPolicy 'RemoteSigned' -Scope 'LocalMachine' -Force;");
        if (c.disableAutoSignIn) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableAutomaticRestartSignOn /t REG_DWORD /d 1 /f;`);
        if (c.enableProcessAuditing) {
            S.push(R`auditpol.exe /set /subcategory:"{0CCE922B-69AE-11D9-BED3-505054503030}" /success:enable /failure:enable;` + CRLF +
                R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v ProcessCreationIncludeCmdLine_Enabled /t REG_DWORD /d 1 /f;`);
        }
        if (c.enableEdgeUninstall) {
            S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft Edge" /v NoRemove /t REG_DWORD /d 0 /f;` + CRLF +
                R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Microsoft Edge" /v NoRepair /t REG_DWORD /d 0 /f;`);
        }
        if (c.disableLockScreen) S.push(R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v NoLockScreen /t REG_DWORD /d 1 /f;`);
        if (c.customLockScreen && c.lockScreenFile_base64) {
            const ext = XmlGenerator.imageExtension(c.lockScreenFile_base64);
            S.push(`[System.IO.File]::WriteAllBytes( '${SCRIPTS_DIR}\\LockScreen.${ext}', [System.Convert]::FromBase64String( '${XmlGenerator.base64Payload(c.lockScreenFile_base64)}' ) );` + CRLF +
                R`reg.exe add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Personalization" /v LockScreenImage /t REG_SZ /d "` + `${SCRIPTS_DIR}\\LockScreen.${ext}" /f;`);
        }
        if (c.disableNarrator) S.push(R`reg.exe add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\Narrator.exe" /v Debugger /t REG_SZ /d "C:\Windows\System32\taskkill.exe /f /im Narrator.exe" /f;`);

        const mask = this.lockKeyMask();
        if (mask !== null) S.push(R`reg.exe add "HKU\.DEFAULT\Control Panel\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d "` + mask + '" /f;');

        this.buildWifi();
        this.buildVmTools();

        S.push(...this.customScriptsFor('system', 'specialize'));
    }

    buildWifi() {
        const c = this.config;
        let profile = null;
        if (c.wifiMode === 'xml' && c.wifiXMLProfile && c.wifiXMLProfile.trim()) {
            profile = c.wifiXMLProfile.trim();
        } else if (c.wifiMode === 'configure' && c.wifiSSID) {
            const ssid = XmlGenerator.escapeXml(c.wifiSSID);
            const auth = { open: 'open', wpa2psk: 'WPA2PSK', wpa3psk: 'WPA3SAE', wpa2: 'WPA2' }[c.wifiAuth] || 'WPA2PSK';
            const encryption = auth === 'open' ? 'none' : 'AES';
            const lines = [
                '<?xml version="1.0"?>',
                '<WLANProfile xmlns="http://www.microsoft.com/networking/WLAN/profile/v1">',
                `\t<name>${ssid}</name>`,
                '\t<SSIDConfig>',
                `\t\t<SSID>`,
                `\t\t\t<name>${ssid}</name>`,
                '\t\t</SSID>',
                `\t\t<nonBroadcast>${c.wifiHiddenNetwork ? 'true' : 'false'}</nonBroadcast>`,
                '\t</SSIDConfig>',
                '\t<connectionType>ESS</connectionType>',
                `\t<connectionMode>${c.wifiAutoConnect ? 'auto' : 'manual'}</connectionMode>`,
                '\t<MSM>',
                '\t\t<security>',
                '\t\t\t<authEncryption>',
                `\t\t\t\t<authentication>${auth}</authentication>`,
                `\t\t\t\t<encryption>${encryption}</encryption>`,
                `\t\t\t\t<useOneX>${auth === 'WPA2' ? 'true' : 'false'}</useOneX>`,
                '\t\t\t</authEncryption>',
            ];
            if (auth === 'WPA2PSK' || auth === 'WPA3SAE') {
                lines.push('\t\t\t<sharedKey>', '\t\t\t\t<keyType>passPhrase</keyType>', '\t\t\t\t<protected>false</protected>',
                    `\t\t\t\t<keyMaterial>${XmlGenerator.escapeXml(c.wifiPassword || '')}</keyMaterial>`, '\t\t\t</sharedKey>');
            }
            lines.push('\t\t</security>', '\t</MSM>', '</WLANProfile>');
            profile = lines.join(CRLF);
        }
        if (profile) {
            this.addFile(`${SCRIPTS_DIR}\\Wifi.xml`, profile);
            this.specialize.push(`netsh.exe wlan add profile filename="${SCRIPTS_DIR}\\Wifi.xml" user=all;`);
        }
    }

    buildVmTools() {
        const c = this.config;
        const tools = [
            ['vmVirtualBox', 'VBoxWindowsAdditions.exe', "'/S'"],
            ['vmVMware', 'setup.exe', "'/S', '/v', '\"/qn REBOOT=R\"'"],
            ['vmVirtIO', 'virtio-win-guest-tools.exe', "'/passive', '/norestart'"],
            ['vmParallels', 'PTAgent.exe', "'/install_silent'"],
        ];
        for (const [key, exe, args] of tools) {
            if (!c[key]) continue;
            this.specialize.push(
                `$installer = Get-PSDrive -PSProvider 'FileSystem' | ForEach-Object { Get-Item -LiteralPath "$($_.Root)${exe}" -ErrorAction 'SilentlyContinue'; } | Select-Object -First 1;` + CRLF +
                'if( $installer ) {' + CRLF +
                `\tStart-Process -FilePath $installer.FullName -ArgumentList ${args} -Wait;` + CRLF +
                '}'
            );
        }
    }

    visualEffectValues() {
        const c = this.config;
        if (c.visualEffectsPreset === 'performance') return VISUAL_EFFECT_KEYS.map(k => [k, 0]);
        if (c.visualEffectsPreset === 'appearance') return VISUAL_EFFECT_KEYS.map(k => [k, 1]);
        if (c.visualEffectsPreset === 'custom') {
            return VISUAL_EFFECT_KEYS
                .filter(k => Object.values(VISUAL_EFFECT_FORM_KEYS).includes(k))
                .map(k => [k, Object.entries(VISUAL_EFFECT_FORM_KEYS).some(([formKey, regKey]) => regKey === k && c[formKey]) ? 1 : 0]);
        }
        return null;
    }

    buildDefaultUser() {
        const c = this.config;
        const D = this.defaultUser;
        const R = String.raw;

        if (c.removeCopilot) D.push(R`reg.exe add "HKU\DefaultUser\Software\Policies\Microsoft\Windows\WindowsCopilot" /v TurnOffWindowsCopilot /t REG_DWORD /d 1 /f;`);
        if (c.removeOneDrive) D.push(R`Remove-ItemProperty -LiteralPath 'Registry::HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'OneDriveSetup' -Force -ErrorAction 'Continue';`);
        if (c.removeXboxApps) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f;`);
        if (c.explorerShowExtensions) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v "HideFileExt" /t REG_DWORD /d 0 /f;`);
        if (c.explorerShowHidden) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v "Hidden" /t REG_DWORD /d 1 /f;`);
        if (c.disableAppSuggestions) {
            D.push('$names = @(' + CRLF + CONTENT_DELIVERY_NAMES.map(n => `  '${n}';`).join(CRLF) + CRLF + ');' + CRLF + '' + CRLF +
                'foreach( $name in $names ) {' + CRLF +
                R`  reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v $name /t REG_DWORD /d 0 /f;` + CRLF +
                '}');
        }
        if (c.taskbarAlignLeft) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarAl /t REG_DWORD /d 0 /f;`);
        if (c.disableMouseAcceleration) {
            D.push('$params = @{' + CRLF +
                R`  LiteralPath = 'Registry::HKU\DefaultUser\Control Panel\Mouse';` + CRLF +
                "  Type = 'String';" + CRLF +
                '  Value = 0;' + CRLF +
                '  Force = $true;' + CRLF +
                '};' + CRLF +
                "Set-ItemProperty @params -Name 'MouseSpeed';" + CRLF +
                "Set-ItemProperty @params -Name 'MouseThreshold1';" + CRLF +
                "Set-ItemProperty @params -Name 'MouseThreshold2';");
        }
        if (c.taskbarDisableBingSearch) D.push(R`reg.exe add "HKU\DefaultUser\Software\Policies\Microsoft\Windows\Explorer" /v DisableSearchBoxSuggestions /t REG_DWORD /d 1 /f;`);

        if (c.explorerClassicContextMenu) D.push(R`reg.exe add "HKU\DefaultUser\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /ve /t REG_SZ /d "" /f;`);
        if (c.explorerEndTaskButton) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings" /v TaskbarEndTask /t REG_DWORD /d 1 /f;`);
        if (c.taskbarHideTaskView) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f;`);
        if (c.taskbarHideChat) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f;`);
        if (c.taskbarAutoHideTray) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Explorer" /v EnableAutoTray /t REG_DWORD /d 1 /f;`);
        if (c.themeMode === 'dark' || c.themeMode === 'light') {
            const v = c.themeMode === 'dark' ? 0 : 1;
            D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v AppsUseLightTheme /t REG_DWORD /d ` + v + ' /f;' + CRLF +
                R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d ` + v + ' /f;');
        }
        if (c.enableTransparency) D.push(R`reg.exe add "HKU\DefaultUser\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" /v EnableTransparency /t REG_DWORD /d 1 /f;`);

        const mask = this.lockKeyMask();
        if (mask !== null) D.push(R`reg.exe add "HKU\DefaultUser\Control Panel\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d "` + mask + '" /f;');

        if (c.stickyKeysMode === 'disabled' || c.stickyKeysMode === 'custom') {
            let flags = 506;
            if (c.stickyKeysMode === 'custom') {
                flags = 2;
                if (c.stickyKeysActivation) flags |= 4;
                if (c.stickyKeysConfirm) flags |= 8;
                if (c.stickyKeysAudio) flags |= 16 | 64;
                if (c.stickyKeysIcon) flags |= 32;
                if (c.stickyKeysLock) flags |= 128;
                if (c.stickyKeysTwoKeys) flags |= 256;
            }
            D.push(R`reg.exe add "HKU\DefaultUser\Control Panel\Accessibility\StickyKeys" /v Flags /t REG_SZ /d "` + flags + '" /f;');
        }
        if (c.disableSystemSounds) {
            D.push(R`Get-Item -Path 'Registry::HKU\DefaultUser\AppEvents\Schemes\Apps\*\*\.Current' -ErrorAction 'SilentlyContinue' | ForEach-Object {` + CRLF +
                "\tSet-ItemProperty -LiteralPath $_.PSPath -Name '(Default)' -Value '' -ErrorAction 'SilentlyContinue';" + CRLF +
                '};' + CRLF +
                R`reg.exe add "HKU\DefaultUser\AppEvents\Schemes" /ve /t REG_SZ /d ".None" /f;`);
        }

        D.push(...this.customScriptsFor('defaultUser', 'defaultUser'));
    }

    buildUserOnce() {
        const c = this.config;
        const U = this.userOnce;
        const R = String.raw;

        if (c.removeCopilot) U.push("Get-AppxPackage -Name 'Microsoft.Windows.Ai.Copilot.Provider' | Remove-AppxPackage;");
        if (c.explorerThisPCView) {
            U.push(R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name 'LaunchTo' -Type 'DWord' -Value 1;`);
            this.userOnceNeedsExplorerRestart = true;
        }
        const searchMode = { hide: 0, icon: 1, box: 2, label: 3 }[c.taskbarSearch];
        if (searchMode !== undefined) {
            U.push(R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\CurrentVersion\Search' -Name 'SearchboxTaskbarMode' -Type 'DWord' -Value ` + searchMode + ';');
            this.userOnceNeedsExplorerRestart = true;
        }
        const vfx = { performance: 2, appearance: 1, custom: 3 }[c.visualEffectsPreset];
        if (vfx !== undefined) {
            U.push(R`Set-ItemProperty -LiteralPath 'Registry::HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Name 'VisualFXSetting' -Type 'DWord' -Value ` + vfx + ' -Force;');
            this.userOnceNeedsExplorerRestart = true;
        }
        if (c.desktopIconsMode === 'custom') {
            const lines = [];
            for (const panel of ['ClassicStartMenu', 'NewStartPanel']) {
                const key = `Registry::HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\${panel}`;
                lines.push(`New-Item -Path '${key}' -Force;`);
                for (const [clsid, formKey] of DESKTOP_ICONS) {
                    lines.push(`Set-ItemProperty -Path '${key}' -Name '${clsid}' -Value ${c[formKey] ? 0 : 1} -Type 'DWord';`);
                }
            }
            U.push(lines.join(CRLF));
            this.userOnceNeedsExplorerRestart = true;
        }

        const wallpaper = this.wallpaperCommand();
        if (wallpaper) {
            this.addFile(`${SCRIPTS_DIR}\\SetWallpaper.ps1`, ScriptTemplates.setWallpaper.replace('__COMMAND__', wallpaper));
            U.push(this.invoke('SetWallpaper.ps1'));
            this.userOnceNeedsExplorerRestart = true;
        }

        if (c.enableCustomAccent && /^#[0-9a-f]{6}$/i.test(c.accentColor || '')) {
            const r = parseInt(c.accentColor.slice(1, 3), 16), g = parseInt(c.accentColor.slice(3, 5), 16), b = parseInt(c.accentColor.slice(5, 7), 16);
            const abgr = '0x' + ((0xff << 24 >>> 0) + (b << 16) + (g << 8) + r).toString(16).padStart(8, '0');
            U.push(R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Accent' -Name 'AccentColorMenu' -Type 'DWord' -Value ` + abgr + ' -Force;' + CRLF +
                R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\DWM' -Name 'AccentColor' -Type 'DWord' -Value ` + abgr + ' -Force;' + CRLF +
                R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\DWM' -Name 'ColorizationColor' -Type 'DWord' -Value ` + abgr + ' -Force;' + CRLF +
                R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' -Name 'ColorPrevalence' -Type 'DWord' -Value ` + (c.accentOnStartTaskbar ? 1 : 0) + ' -Force;' + CRLF +
                R`Set-ItemProperty -LiteralPath 'Registry::HKCU\Software\Microsoft\Windows\DWM' -Name 'ColorPrevalence' -Type 'DWord' -Value ` + (c.accentOnTitleBars ? 1 : 0) + ' -Force;');
            this.userOnceNeedsExplorerRestart = true;
        }

        U.push(...this.customScriptsFor('userOnce', 'userOnce'));

        if (this.userOnceNeedsExplorerRestart) {
            U.push("Get-Process -Name 'explorer' -ErrorAction 'SilentlyContinue' | Where-Object -FilterScript {" + CRLF +
                '\t$_.SessionId -eq ( Get-Process -Id $PID ).SessionId;' + CRLF +
                '} | Stop-Process -Force;');
        }
    }

    wallpaperCommand() {
        const c = this.config;
        const styles = { fill: [10, 0], fit: [6, 0], stretch: [2, 0], tile: [0, 1], center: [0, 0], span: [22, 0] };
        const styleLines = () => {
            const [style, tile] = styles[c.wallpaperStyle] || styles.fill;
            return `Set-ItemProperty -Path 'Registry::HKCU\\Control Panel\\Desktop' -Name 'WallpaperStyle' -Type 'String' -Value '${style}' -Force;` + CRLF +
                `Set-ItemProperty -Path 'Registry::HKCU\\Control Panel\\Desktop' -Name 'TileWallpaper' -Type 'String' -Value '${tile}' -Force;` + CRLF;
        };
        if (c.wallpaperMode === 'solid' && /^#[0-9a-f]{6}$/i.test(c.wallpaperColor || '')) {
            return `Set-WallpaperColor -HtmlColor '${c.wallpaperColor}';`;
        }
        if (c.wallpaperMode === 'path' && c.wallpaperPath && c.wallpaperPath.trim()) {
            return styleLines() + `Set-WallpaperImage -LiteralPath ${XmlGenerator.ps(c.wallpaperPath.trim())};`;
        }
        if (c.wallpaperMode === 'custom' && c.wallpaperFile_base64) {
            const file = `${SCRIPTS_DIR}\\Wallpaper.${XmlGenerator.imageExtension(c.wallpaperFile_base64)}`;
            return `[System.IO.File]::WriteAllBytes( '${file}', [System.Convert]::FromBase64String( '${XmlGenerator.base64Payload(c.wallpaperFile_base64)}' ) );` + CRLF +
                styleLines() + `Set-WallpaperImage -LiteralPath '${file}';`;
        }
        return null;
    }

    /** The winget install script for the Software tab's package list. */
    static installSoftwareScript(ids, timeoutMinutes) {
        return [
            '# Generated from the Software tab: install winget packages at first logon.',
            `$timeout = [datetime]::Now.AddMinutes(${timeoutMinutes});`,
            '$exe = "$env:LOCALAPPDATA\\Microsoft\\WindowsApps\\winget.exe";',
            'while( -not ( Test-Path $exe ) ) {',
            "\tif( [datetime]::Now -gt $timeout ) { 'winget did not become available; no packages installed.' | Write-Warning; return; }",
            '\tStart-Sleep -Seconds 1;',
            '}',
            '$packages = @(',
            ...ids.map((id, i) => `\t'${id.replace(/'/g, "''")}'${i < ids.length - 1 ? ',' : ''}`),
            ');',
            "$common = @( '--exact', '--silent', '--disable-interactivity', '--accept-package-agreements', '--accept-source-agreements', '--source', 'winget' );",
            'foreach( $package in $packages ) {',
            '\t"*** winget install $package";',
            '\t& $exe install --id $package @common --scope machine;',
            '\tif( $LASTEXITCODE -ne 0 ) {',
            '\t\t# no machine-scope installer for this package: retry with the default scope',
            '\t\t& $exe install --id $package @common;',
            '\t}',
            '}',
        ].join(CRLF);
    }

    buildFirstLogon() {
        const c = this.config;
        const F = this.firstLogon;
        if (this.accounts.some(a => a.autologon)) {
            F.push(String.raw`Set-ItemProperty -LiteralPath 'Registry::HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' -Name 'AutoLogonCount' -Type 'DWord' -Force -Value 0;`);
        }
        const packages = String(c.softwarePackages || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (packages.length) {
            this.addFile(`${SCRIPTS_DIR}\\InstallSoftware.ps1`, XmlGenerator.installSoftwareScript([...new Set(packages)], parseInt(c.softwareTimeout, 10) || 10));
            F.push(this.invoke('InstallSoftware.ps1'));
        }
        if (c.cleanupWindowsOld) {
            F.push("Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'takeown /F C:\\Windows.old /R /A /D Y & icacls C:\\Windows.old /grant Administrators:F /T & rd /s /q C:\\Windows.old' -Wait -WindowStyle 'Hidden';");
        }
        F.push(...this.customScriptsFor('firstLogon', 'firstLogon'));
        // Remove the answer file (it may hold plaintext passwords and Wi-Fi keys) and the Wi-Fi profile
        F.push('Remove-Item -LiteralPath @(' + CRLF +
            "  'C:\\Windows\\Panther\\unattend.xml';" + CRLF +
            "  'C:\\Windows\\Panther\\unattend-original.xml';" + CRLF +
            "  'C:\\Windows\\Setup\\Scripts\\Wifi.xml';" + CRLF +
            ") -Force -ErrorAction 'SilentlyContinue' -Verbose;");
    }

    /* -------------------------------------------------------------------- xml */

    generate() {
        this.files = [];
        this.specialize = [];
        this.defaultUser = [];
        this.userOnce = [];
        this.firstLogon = [];
        this.userOnceNeedsExplorerRestart = false;
        this.customScriptIndex = 0;
        this.buildScripts();

        const L = [];
        L.push('<?xml version="1.0" encoding="utf-8"?>');
        L.push('<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">');
        // The comment carries a link that reopens this configuration in the generator (XML comments may not contain "--")
        const link = this.options.link ? String(this.options.link).replace(/--/g, '%2D%2D') : 'https://github.com/rbardtke/windows-unattend-generator';
        L.push(`\t<!--${link}-->`);
        L.push('\t<settings pass="offlineServicing"></settings>');
        L.push('\t<settings pass="windowsPE">');
        this.forEachArch(L, (buffer, arch) => this.windowsPEComponents(buffer, arch));
        L.push('\t</settings>');
        L.push('\t<settings pass="generalize"></settings>');
        L.push('\t<settings pass="specialize">');
        this.forEachArch(L, (buffer, arch) => this.specializeComponents(buffer, arch));
        L.push('\t</settings>');
        L.push('\t<settings pass="auditSystem"></settings>');
        L.push('\t<settings pass="auditUser"></settings>');
        L.push('\t<settings pass="oobeSystem">');
        this.forEachArch(L, (buffer, arch) => this.oobeSystemComponents(buffer, arch));
        L.push('\t</settings>');
        if (this.files.length) {
            L.push('\t<Extensions xmlns="https://schneegans.de/windows/unattend-generator/">');
            L.push('\t\t<ExtractScript>');
            L.push(XmlGenerator.escapeXml(ScriptTemplates.extractScript));
            L.push('\t\t</ExtractScript>');
            for (const file of this.files) {
                L.push(`\t\t<File path="${XmlGenerator.escapeAttr(file.path)}">`);
                L.push(XmlGenerator.escapeXml(file.content));
                L.push('\t\t</File>');
            }
            L.push('\t</Extensions>');
        }
        L.push('</unattend>');
        return L.join(CRLF);
    }

    /**
     * Components are emitted once per selected architecture. The callback pushes one or more
     * components for a single architecture; we call it per architecture and interleave so each
     * component is followed by its clones, as the original generator does.
     */
    forEachArch(L, emit) {
        const archs = this.architectures();
        const perArch = archs.map(arch => {
            const buffer = [];
            emit(buffer, arch);
            return XmlGenerator.splitComponents(buffer);
        });
        const count = perArch[0].length;
        for (let i = 0; i < count; i++) {
            for (const components of perArch) L.push(...components[i]);
        }
    }

    static splitComponents(lines) {
        const components = [];
        let current = null;
        for (const line of lines) {
            if (line.startsWith('\t\t<component ')) current = [];
            current.push(line);
            if (line === '\t\t</component>') { components.push(current); current = null; }
        }
        return components;
    }

    static component(name, arch) {
        return `\t\t<component name="${name}" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">`;
    }

    windowsPEComponents(L, arch) {
        const c = this.config;
        const lang = c.language || 'en-US';
        const keyboard = c.keyboard || '0409:00000409';
        L.push(XmlGenerator.component('Microsoft-Windows-International-Core-WinPE', arch));
        L.push(`\t\t\t<UILanguage>${lang}</UILanguage>`);
        L.push('\t\t</component>');

        L.push(XmlGenerator.component('Microsoft-Windows-Setup', arch));

        const bypasses = [
            ['bypassTPM', 'BypassTPMCheck'], ['bypassSecureBoot', 'BypassSecureBootCheck'],
            ['bypassRAM', 'BypassRAMCheck'], ['bypassStorage', 'BypassStorageCheck'],
        ].filter(([key]) => c[key]);
        const diskpart = (c.partitionMode === 'custom' && c.customDiskPart) ? c.customDiskPart.split(/\r?\n/).map(l => l.trim()).filter(Boolean) : [];
        if (bypasses.length || diskpart.length) {
            let order = 1;
            L.push('\t\t\t<RunSynchronous>');
            for (const [, name] of bypasses) {
                L.push('\t\t\t\t<RunSynchronousCommand wcm:action="add">');
                L.push(`\t\t\t\t\t<Order>${order++}</Order>`);
                L.push(`\t\t\t\t\t<Path>reg.exe add "HKLM\\SYSTEM\\Setup\\LabConfig" /v ${name} /t REG_DWORD /d 1 /f</Path>`);
                L.push('\t\t\t\t</RunSynchronousCommand>');
            }
            for (const line of diskpart) {
                L.push('\t\t\t\t<RunSynchronousCommand wcm:action="add">');
                L.push(`\t\t\t\t\t<Order>${order++}</Order>`);
                L.push(`\t\t\t\t\t<Path>cmd.exe /c "&gt;&gt;"X:\\diskpart.txt" echo ${XmlGenerator.escapeXml(line)}"</Path>`);
                L.push('\t\t\t\t</RunSynchronousCommand>');
            }
            if (diskpart.length) {
                L.push('\t\t\t\t<RunSynchronousCommand wcm:action="add">');
                L.push(`\t\t\t\t\t<Order>${order++}</Order>`);
                L.push('\t\t\t\t\t<Path>diskpart.exe /s "X:\\diskpart.txt"</Path>');
                L.push('\t\t\t\t</RunSynchronousCommand>');
            }
            L.push('\t\t\t</RunSynchronous>');
        }

        if (c.partitionMode === 'auto') this.diskConfiguration(L);

        const imageInstall = [];
        if (c.partitionMode === 'auto') {
            imageInstall.push('\t\t\t\t\t<InstallTo>', '\t\t\t\t\t\t<DiskID>0</DiskID>',
                `\t\t\t\t\t\t<PartitionID>${c.partitionStyle === 'gpt' ? 3 : 1}</PartitionID>`, '\t\t\t\t\t</InstallTo>');
        } else if (diskpart.length) {
            imageInstall.push('\t\t\t\t\t<InstallToAvailablePartition>true</InstallToAvailablePartition>');
        }
        if (c.compactOS === 'enabled' || c.compactOS === 'disabled') {
            imageInstall.push(`\t\t\t\t\t<Compact>${c.compactOS === 'enabled' ? 'true' : 'false'}</Compact>`);
        }
        if (imageInstall.length) {
            L.push('\t\t\t<ImageInstall>', '\t\t\t\t<OSImage>', ...imageInstall, '\t\t\t\t</OSImage>', '\t\t\t</ImageInstall>');
        }

        L.push('\t\t\t<UserData>');
        const key = this.productKey();
        if (key) {
            L.push('\t\t\t\t<ProductKey>');
            L.push(`\t\t\t\t\t<Key>${XmlGenerator.escapeXml(key)}</Key>`);
            L.push('\t\t\t\t\t<WillShowUI>OnError</WillShowUI>');
            L.push('\t\t\t\t</ProductKey>');
        }
        L.push('\t\t\t\t<AcceptEula>true</AcceptEula>');
        L.push('\t\t\t</UserData>');
        L.push('\t\t\t<UseConfigurationSet>false</UseConfigurationSet>');
        L.push('\t\t</component>');
    }

    productKey() {
        const c = this.config;
        if (c.productKeyMode === 'custom' && c.productKey) return c.productKey.trim();
        if (c.productKeyMode === 'generic') return GENERIC_KEYS[c.windowsEdition] || null;
        return null;
    }

    diskConfiguration(L) {
        const c = this.config;
        const p = (n, s) => '\t'.repeat(n) + s;
        L.push(p(3, '<DiskConfiguration>'));
        L.push(p(4, '<Disk wcm:action="add">'));
        L.push(p(5, '<DiskID>0</DiskID>'));
        L.push(p(5, `<WillWipeDisk>${c.wipeDisk === false || c.wipeDisk === 'false' ? 'false' : 'true'}</WillWipeDisk>`));
        L.push(p(5, '<CreatePartitions>'));
        const createPartition = (order, type, extra) => {
            L.push(p(6, '<CreatePartition wcm:action="add">'));
            L.push(p(7, `<Order>${order}</Order>`));
            L.push(p(7, `<Type>${type}</Type>`));
            for (const line of extra) L.push(p(7, line));
            L.push(p(6, '</CreatePartition>'));
        };
        const modifyPartition = (order, id, extra) => {
            L.push(p(6, '<ModifyPartition wcm:action="add">'));
            L.push(p(7, `<Order>${order}</Order>`));
            L.push(p(7, `<PartitionID>${id}</PartitionID>`));
            for (const line of extra) L.push(p(7, line));
            L.push(p(6, '</ModifyPartition>'));
        };
        const recovery = c.recoveryMode === 'partition';
        if (c.partitionStyle === 'gpt') {
            createPartition(1, 'EFI', [`<Size>${parseInt(c.efiSize, 10) || 100}</Size>`]);
            createPartition(2, 'MSR', ['<Size>16</Size>']);
            createPartition(3, 'Primary', recovery ? [] : ['<Extend>true</Extend>']);
            if (recovery) createPartition(4, 'Primary', [`<Size>${parseInt(c.recoverySize, 10) || 990}</Size>`]);
            L.push(p(5, '</CreatePartitions>'));
            L.push(p(5, '<ModifyPartitions>'));
            modifyPartition(1, 1, ['<Label>System</Label>', '<Format>FAT32</Format>']);
            modifyPartition(2, 3, ['<Label>Windows</Label>', '<Letter>C</Letter>', '<Format>NTFS</Format>']);
            if (recovery) modifyPartition(3, 4, ['<Label>Recovery</Label>', '<Format>NTFS</Format>', '<TypeID>de94bba4-06d1-4d40-a16a-bfd50179d6ac</TypeID>']);
        } else {
            createPartition(1, 'Primary', ['<Extend>true</Extend>']);
            L.push(p(5, '</CreatePartitions>'));
            L.push(p(5, '<ModifyPartitions>'));
            modifyPartition(1, 1, ['<Active>true</Active>', '<Label>Windows</Label>', '<Letter>C</Letter>', '<Format>NTFS</Format>']);
        }
        L.push(p(5, '</ModifyPartitions>'));
        L.push(p(4, '</Disk>'));
        L.push(p(3, '</DiskConfiguration>'));
    }

    specializeComponents(L, arch) {
        const c = this.config;
        let computerName = '*';
        if (c.computerNameMode === 'custom' && c.computerName) computerName = c.computerName.substring(0, 15).replace(/[^a-zA-Z0-9-]/g, '');
        L.push(XmlGenerator.component('Microsoft-Windows-Shell-Setup', arch));
        L.push(`\t\t\t<ComputerName>${XmlGenerator.escapeXml(computerName)}</ComputerName>`);
        if (c.timezoneMode === 'explicit' && c.timezone) L.push(`\t\t\t<TimeZone>${XmlGenerator.escapeXml(c.timezone)}</TimeZone>`);
        L.push('\t\t</component>');

        const commands = [];
        if (this.files.length) {
            commands.push(`powershell.exe -WindowStyle "Normal" -NoProfile -Command "$xml = [xml]::new(); $xml.Load('C:\\Windows\\Panther\\unattend.xml'); $sb = [scriptblock]::Create( $xml.unattend.Extensions.ExtractScript ); Invoke-Command -ScriptBlock $sb -ArgumentList $xml;"`);
        }
        if (this.specialize.length) commands.push(XmlGenerator.runScriptCommand('Specialize.ps1'));
        if (this.defaultUser.length) {
            commands.push('reg.exe load "HKU\\DefaultUser" "C:\\Users\\Default\\NTUSER.DAT"');
            commands.push(XmlGenerator.runScriptCommand('DefaultUser.ps1'));
            commands.push('reg.exe unload "HKU\\DefaultUser"');
        }
        if (commands.length) {
            L.push(XmlGenerator.component('Microsoft-Windows-Deployment', arch));
            L.push('\t\t\t<RunSynchronous>');
            commands.forEach((command, i) => {
                L.push('\t\t\t\t<RunSynchronousCommand wcm:action="add">');
                L.push(`\t\t\t\t\t<Order>${i + 1}</Order>`);
                L.push(`\t\t\t\t\t<Path>${XmlGenerator.escapeXml(command)}</Path>`);
                L.push('\t\t\t\t</RunSynchronousCommand>');
            });
            L.push('\t\t\t</RunSynchronous>');
            L.push('\t\t</component>');
        }
    }

    oobeSystemComponents(L, arch) {
        const c = this.config;
        const lang = c.language || 'en-US';
        L.push(XmlGenerator.component('Microsoft-Windows-International-Core', arch));
        L.push(`\t\t\t<InputLocale>${c.keyboard || '0409:00000409'}</InputLocale>`);
        L.push(`\t\t\t<SystemLocale>${lang}</SystemLocale>`);
        L.push(`\t\t\t<UILanguage>${lang}</UILanguage>`);
        L.push(`\t\t\t<UserLocale>${lang}</UserLocale>`);
        if (c.geoLocation) L.push(`\t\t\t<GeoID>${parseInt(c.geoLocation, 10)}</GeoID>`);
        L.push('\t\t</component>');

        L.push(XmlGenerator.component('Microsoft-Windows-Shell-Setup', arch));
        const password = (value, indent) => {
            const p = '\t'.repeat(indent);
            L.push(`${p}<Password>`);
            L.push(`${p}\t<Value>${XmlGenerator.escapeXml(value || '')}</Value>`);
            L.push(`${p}\t<PlainText>true</PlainText>`);
            L.push(`${p}</Password>`);
        };
        if (this.accounts.length || c.enableBuiltinAdmin) {
            L.push('\t\t\t<UserAccounts>');
            if (this.accounts.length) {
                L.push('\t\t\t\t<LocalAccounts>');
                for (const account of this.accounts) {
                    L.push('\t\t\t\t\t<LocalAccount wcm:action="add">');
                    L.push(`\t\t\t\t\t\t<Name>${XmlGenerator.escapeXml(account.username)}</Name>`);
                    L.push(`\t\t\t\t\t\t<DisplayName>${XmlGenerator.escapeXml(account.displayname || '')}</DisplayName>`);
                    L.push(`\t\t\t\t\t\t<Group>${XmlGenerator.escapeXml(account.group || 'Users')}</Group>`);
                    password(account.password, 6);
                    L.push('\t\t\t\t\t</LocalAccount>');
                }
                L.push('\t\t\t\t</LocalAccounts>');
            }
            if (c.enableBuiltinAdmin) {
                L.push('\t\t\t\t<AdministratorPassword>');
                L.push(`\t\t\t\t\t<Value>${XmlGenerator.escapeXml(c.builtinAdminPassword || '')}</Value>`);
                L.push('\t\t\t\t\t<PlainText>true</PlainText>');
                L.push('\t\t\t\t</AdministratorPassword>');
            }
            L.push('\t\t\t</UserAccounts>');
        }
        const autoLogon = this.accounts.find(a => a.autologon);
        if (autoLogon) {
            L.push('\t\t\t<AutoLogon>');
            L.push(`\t\t\t\t<Username>${XmlGenerator.escapeXml(autoLogon.username)}</Username>`);
            L.push('\t\t\t\t<Enabled>true</Enabled>');
            L.push('\t\t\t\t<LogonCount>1</LogonCount>');
            password(autoLogon.password, 4);
            L.push('\t\t\t</AutoLogon>');
        }
        L.push('\t\t\t<OOBE>');
        if (c.privacySettings === 'disable') L.push('\t\t\t\t<ProtectYourPC>3</ProtectYourPC>');
        else if (c.privacySettings === 'enable') L.push('\t\t\t\t<ProtectYourPC>1</ProtectYourPC>');
        L.push('\t\t\t\t<HideEULAPage>true</HideEULAPage>');
        if (c.wifiMode && c.wifiMode !== 'interactive') L.push('\t\t\t\t<HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>');
        L.push(`\t\t\t\t<HideOnlineAccountScreens>${c.hideOnlineAccountScreens ? 'true' : 'false'}</HideOnlineAccountScreens>`);
        L.push('\t\t\t</OOBE>');
        if (this.firstLogon.length) {
            L.push('\t\t\t<FirstLogonCommands>');
            L.push('\t\t\t\t<SynchronousCommand wcm:action="add">');
            L.push('\t\t\t\t\t<Order>1</Order>');
            L.push(`\t\t\t\t\t<CommandLine>${XmlGenerator.escapeXml(XmlGenerator.runScriptCommand('FirstLogon.ps1'))}</CommandLine>`);
            L.push('\t\t\t\t</SynchronousCommand>');
            L.push('\t\t\t</FirstLogonCommands>');
        }
        L.push('\t\t</component>');
    }
}

if (typeof module !== 'undefined') module.exports = XmlGenerator;
