/**
 * Smoke test: switch every option on (or to a non-default value) and make sure generation does not
 * throw and produces an <Extensions> block for every runner script. Writes the result to the path given
 * as the first argument (default: test/smoke-output.xml) so it can be validated by an XML parser.
 *
 *   node test/smoke.mjs [output.xml]
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

globalThis.ScriptTemplates = require(join(root, 'js/script-templates.js'));
globalThis.RemovalCatalog = require(join(root, 'js/removal-catalog.js'));
globalThis.ConfigModel = require(join(root, 'js/config-model.js'));
const XmlGenerator = require(join(root, 'js/xml-generator.js'));

const config = ConfigModel.getDefaults();
for (const [key, value] of Object.entries(config)) {
    if (value === false) config[key] = true;
}
Object.assign(config, {
    arch_x86: true, arch_amd64: true, arch_arm64: false,
    languageSecondary: 'en-GB',
    geoLocation: '94',
    timezoneMode: 'explicit', timezone: 'W. Europe Standard Time',
    windowsEdition: 'Home', productKeyMode: 'generic',
    computerNameMode: 'script', computerNameScript: '$serial = (Get-CimInstance Win32_BIOS).SerialNumber\nreturn "PC-$serial"',
    builtinAdminPassword: 'p&ss<word>',
    account_0_username: 'Alice', account_0_displayname: 'Alice & Bob', account_0_password: 'secret\'s', account_0_group: 'Administrators', account_0_autologon: true,
    account_1_username: 'Bob', account_1_group: 'Users',
    passwordExpiration: 'custom', passwordExpirationDays: 60,
    lockoutMode: 'custom', lockoutThreshold: 3, lockoutWindow: 15, lockoutDuration: 45,
    partitionMode: 'auto', partitionStyle: 'gpt', recoveryMode: 'partition',
    compactOS: 'enabled',
    taskbarSearch: 'icon',
    startTilesWin10: 'custom', startTilesWin10XML: '<LayoutModificationTemplate Version="1" xmlns="http://schemas.microsoft.com/Start/2014/LayoutModification"/>',
    startPinsWin11: 'custom', startPinsWin11JSON: '{"pinnedList":[{"desktopAppId":"MSEdge"}]}',
    desktopIconsMode: 'custom',
    visualEffectsPreset: 'custom',
    themeMode: 'dark',
    accentColor: '#ff8800',
    wallpaperMode: 'path', wallpaperPath: 'C:\\Users\\Public\\it\'s.jpg', wallpaperStyle: 'span',
    lockScreenFile_base64: 'data:image/png;base64,iVBORw0KGgo=',
    wifiMode: 'configure', wifiSSID: 'Home & Away', wifiAuth: 'wpa3psk', wifiPassword: 'pa<ss>',
    capsLockState: 'off', numLockState: 'on', scrollLockState: 'default',
    stickyKeysMode: 'custom',
    privacySettings: 'enable',
    systemScriptType: 'cmd', systemScript: '@echo off\r\necho system',
    userOnceScriptType: 'js', userOnceScript: 'WScript.Echo("once");',
    firstLogonScriptType: 'ps1', firstLogonScript: 'Write-Host "first"',
    defaultUserScriptType: 'reg', defaultUserScript: 'Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\Test]\r\n"a"=dword:00000001',
});

const xml = new XmlGenerator(config).generate();
const out = process.argv[2] || join(root, 'test/smoke-output.xml');
writeFileSync(out, xml);

const files = [...xml.matchAll(/<File path="([^"]+)">/g)].map(m => m[1].split('\\').pop());
const required = ['RemovePackages.ps1', 'RemoveCapabilities.ps1', 'RemoveFeatures.ps1', 'SetStartPins.ps1', 'LayoutModification.xml',
    'SetWallpaper.ps1', 'Wifi.xml', 'unattend-01.cmd', 'unattend-02.reg', 'unattend-03.js', 'unattend-04.ps1',
    'Specialize.ps1', 'UserOnce.ps1', 'DefaultUser.ps1', 'FirstLogon.ps1'];
const missing = required.filter(f => !files.includes(f));
console.log(`generated ${xml.length} chars, ${files.length} embedded files, written to ${out}`);
if (missing.length) {
    console.log('MISSING files:', missing.join(', '));
    process.exit(1);
}
const archs = [...xml.matchAll(/processorArchitecture="(\w+)"/g)].map(m => m[1]);
console.log('architectures:', [...new Set(archs)].join(', '), `(${archs.length} components)`);
console.log('OK');
