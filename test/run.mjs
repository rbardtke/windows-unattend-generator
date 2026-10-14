/**
 * Regression test: the configuration of a real schneegans.de answer file (test/fixtures/snoops-2024.xml,
 * generated April 2024) must come out of XmlGenerator byte for byte, apart from the generator comment.
 *
 *   node test/run.mjs
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

globalThis.ScriptTemplates = require(join(root, 'js/script-templates.js'));
globalThis.RemovalCatalog = require(join(root, 'js/removal-catalog.js'));
globalThis.ConfigModel = require(join(root, 'js/config-model.js'));
const XmlGenerator = require(join(root, 'js/xml-generator.js'));

const fixture = readFileSync(join(root, 'test/fixtures/snoops-2024.xml'), 'utf8');
const firstLogonScript = readFileSync(join(root, 'test/fixtures/snoops-firstlogon.ps1'), 'utf8');

const config = {
    arch_amd64: true,
    language: 'de-DE',
    keyboard: '0407:00000407',
    windowsEdition: 'Professional',
    productKeyMode: 'generic',
    computerNameMode: 'custom',
    computerName: 'Snoops',
    partitionMode: 'interactive',
    account_0_username: 'Admin',
    account_0_displayname: '',
    account_0_password: '',
    account_0_group: 'Administrators',
    account_0_autologon: true,
    passwordExpiration: 'never',
    lockoutMode: 'disabled',
    bypassNRO: true,
    explorerShowHidden: false,
    explorerShowExtensions: true,
    explorerThisPCView: true,
    taskbarSearch: 'hide',
    taskbarHideWidgets: true,
    taskbarAlignLeft: true,
    taskbarDisableBingSearch: true,
    startTilesWin10: 'none',
    startPinsWin11: 'none',
    disableFastStartup: true,
    disableAppSuggestions: true,
    disableDeviceEncryption: true,
    disableEdgeFirstRun: true,
    disableMouseAcceleration: true,
    visualEffectsPreset: 'performance',
    desktopIconsMode: 'custom',
    desktopIconRecycleBin: true,
    desktopIconThisPC: true,
    wifiMode: 'skip',
    privacySettings: 'disable',
    wallpaperMode: 'solid',
    wallpaperColor: '#293133',
    firstLogonScriptType: 'ps1',
    firstLogonScript,
};
for (const key of [
    'remove3DViewer', 'removeBingSearch', 'removeCamera', 'removeClipchamp', 'removeCopilot', 'removeCortana',
    'removeDevHome', 'removeFamily', 'removeFeedbackHub', 'removeGetHelp', 'removeHandwriting', 'removeMaps',
    'removeMathInputPanel', 'removeMixedReality', 'removeZuneVideo', 'removeNews', 'removeOffice365',
    'removeOneDrive', 'removeOneNote', 'removeOneSync', 'removeOutlook', 'removePaint3D', 'removePeople',
    'removePhotos', 'removePowerAutomate', 'removeQuickAssist', 'removeRecall', 'removeSkype', 'removeSolitaire',
    'removeSpeech', 'removeStepsRecorder', 'removeStickyNotes', 'removeTeams', 'removeGetStarted', 'removeToDo',
    'removeVoiceRecorder', 'removeWallet', 'removeWeather', 'removeFaxAndScan', 'removeWindowsHello',
    'removeXboxApps', 'removeYourPhone',
]) config[key] = true;

const generated = new XmlGenerator(config).generate();

const strip = text => text.split('\r\n').filter(line => !line.startsWith('\t<!--')).join('\r\n');
const expected = strip(fixture);
const actual = strip(generated);

if (expected === actual) {
    console.log(`OK: generated output matches test/fixtures/snoops-2024.xml (${actual.length} chars)`);
    process.exit(0);
}

const e = expected.split('\r\n'), a = actual.split('\r\n');
let i = 0;
while (i < e.length && i < a.length && e[i] === a[i]) i++;
console.log(`MISMATCH at line ${i + 1} (expected ${e.length} lines, got ${a.length})`);
for (let j = Math.max(0, i - 3); j < Math.min(e.length, i + 8); j++) console.log(`  exp ${j + 1}: ${JSON.stringify(e[j])}`);
console.log('  ---');
for (let j = Math.max(0, i - 3); j < Math.min(a.length, i + 8); j++) console.log(`  got ${j + 1}: ${JSON.stringify(a[j])}`);
process.exit(1);
