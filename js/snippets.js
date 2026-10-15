/**
 * Script snippets for the script boxes. Each snippet is PowerShell unless stated otherwise;
 * <<PLACEHOLDERS>> are meant to be replaced after inserting.
 */

const Snippets = [
    {
        id: 'download-run',
        title: 'Download an installer and run it silently',
        phase: 'firstLogon',
        body: `# Download an installer and run it silently
$url = '<<https://example.com/setup.exe>>';
$installer = Join-Path $env:TEMP 'setup.exe';
for( $attempt = 1; $attempt -le 3; $attempt++ ) {
    try {
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing;
        break;
    } catch {
        if( $attempt -eq 3 ) { throw; }
        Start-Sleep -Seconds 10;
    }
}
# Common silent switches: /S (NSIS), /silent or /verysilent (Inno), /quiet /norestart (MSI/burn)
Start-Process -FilePath $installer -ArgumentList '<</S>>' -Wait;
Remove-Item -LiteralPath $installer -Force -ErrorAction 'SilentlyContinue';`,
    },
    {
        id: 'msi',
        title: 'Install an .msi silently',
        phase: 'firstLogon',
        body: `# Install an MSI silently (from a URL or a path on the install media)
$msi = '<<C:\\path\\to\\package.msi>>';
Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', "\`"$msi\`"", '/qn', '/norestart' -Wait;`,
    },
    {
        id: 'winget',
        title: 'Install packages with winget',
        phase: 'firstLogon',
        body: `# Install packages with winget (waits for winget to become available, retries without machine scope)
$timeout = [datetime]::Now.AddMinutes(5);
$exe = "$env:LOCALAPPDATA\\Microsoft\\WindowsApps\\winget.exe";
while( -not ( Test-Path $exe ) ) {
    if( [datetime]::Now -gt $timeout ) { 'winget not available.' | Write-Warning; return; }
    Start-Sleep -Seconds 1;
}
$packages = @(
    '<<7zip.7zip>>',
    '<<Mozilla.Firefox>>'
);
$common = @( '--exact', '--silent', '--disable-interactivity', '--accept-package-agreements', '--accept-source-agreements', '--source', 'winget' );
foreach( $package in $packages ) {
    & $exe install --id $package @common --scope machine;
    if( $LASTEXITCODE -ne 0 ) {
        & $exe install --id $package @common;
    }
}`,
    },
    {
        id: 'features',
        title: 'Enable Windows features (Hyper-V, WSL, ...)',
        phase: 'firstLogon',
        body: `# Enable optional Windows features; a reboot is needed afterwards
$features = @(
    'Microsoft-Hyper-V-All',
    'VirtualMachinePlatform',
    'Microsoft-Windows-Subsystem-Linux',
    'Containers',
    'NetFx3'
);
foreach( $feature in $features ) {
    Enable-WindowsOptionalFeature -Online -FeatureName $feature -All -NoRestart -ErrorAction 'Continue' | Out-Null;
}`,
    },
    {
        id: 'power-plan',
        title: 'Set the power plan',
        phase: 'specialize',
        body: `# Power plan: Balanced 381b4222-f694-41f0-9685-ff5bb260df2e, High performance 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c, Power saver a1841308-3541-4fab-bc81-f71556f20b4a
powercfg.exe /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c;
# Never sleep or turn off the display while plugged in
powercfg.exe /change standby-timeout-ac 0;
powercfg.exe /change monitor-timeout-ac 0;`,
    },
    {
        id: 'developer-mode',
        title: 'Enable developer mode',
        phase: 'specialize',
        body: `reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense /t REG_DWORD /d 1 /f;`,
    },
    {
        id: 'vscode-extensions',
        title: 'Install VS Code extensions',
        phase: 'firstLogon',
        body: `# Install VS Code extensions (VS Code itself via winget: Microsoft.VisualStudioCode)
$code = "$env:ProgramFiles\\Microsoft VS Code\\bin\\code.cmd";
if( -not ( Test-Path $code ) ) { $code = "$env:LOCALAPPDATA\\Programs\\Microsoft VS Code\\bin\\code.cmd"; }
$extensions = @(
    '<<ms-python.python>>',
    '<<esbenp.prettier-vscode>>'
);
foreach( $extension in $extensions ) {
    & $code --install-extension $extension --force;
}`,
    },
    {
        id: 'git-identity',
        title: 'Set the git identity',
        phase: 'firstLogon',
        body: `git.exe config --global user.name '<<Your Name>>';
git.exe config --global user.email '<<you@example.com>>';`,
    },
    {
        id: 'copy-from-media',
        title: 'Copy files from the install media',
        phase: 'specialize',
        body: `# Find the drive that holds autounattend.xml and copy a folder from it
$media = Get-PSDrive -PSProvider 'FileSystem' | Where-Object { Test-Path ( Join-Path $_.Root 'autounattend.xml' ) } | Select-Object -First 1;
if( $media ) {
    $source = Join-Path $media.Root '<<Files>>';
    $target = '<<C:\\Setup>>';
    New-Item -ItemType 'Directory' -Path $target -Force | Out-Null;
    Copy-Item -Path "$source\\*" -Destination $target -Recurse -Force;
}`,
    },
    {
        id: 'reg-import',
        title: 'Import a .reg file',
        phase: 'specialize',
        body: `# Import a registry file (for the current user put it in the UserOnce phase)
reg.exe import "<<C:\\Setup\\settings.reg>>";`,
    },
    {
        id: 'scheduled-task',
        title: 'Register a scheduled task that runs at logon',
        phase: 'specialize',
        body: `# Run a script at every logon of any user
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File "<<C:\\Setup\\logon.ps1>>"';
$trigger = New-ScheduledTaskTrigger -AtLogOn;
Register-ScheduledTask -TaskName '<<MyLogonTask>>' -Action $action -Trigger $trigger -RunLevel 'Highest' -Force | Out-Null;`,
    },
    {
        id: 'windows-update',
        title: 'Install all Windows updates',
        phase: 'firstLogon',
        body: `# Install all available Windows updates with the PSWindowsUpdate module, then reboot if needed
Set-PSRepository -Name 'PSGallery' -InstallationPolicy 'Trusted';
Install-PackageProvider -Name 'NuGet' -Force | Out-Null;
Install-Module -Name 'PSWindowsUpdate' -Force -Scope 'AllUsers';
Import-Module 'PSWindowsUpdate';
Install-WindowsUpdate -AcceptAll -IgnoreReboot | Out-Null;`,
    },
    {
        id: 'time-zone',
        title: 'Set the time zone',
        phase: 'specialize',
        body: `tzutil.exe /s '<<W. Europe Standard Time>>';`,
    },
    {
        id: 'remove-shortcuts',
        title: 'Remove desktop shortcuts',
        phase: 'userOnce',
        body: `# Delete the shortcuts installers put on the desktop
Get-ChildItem -Path ( [Environment]::GetFolderPath( 'Desktop' ) ), "$env:PUBLIC\\Desktop" -Filter '*.lnk' -ErrorAction 'SilentlyContinue' | Remove-Item -Force;`,
    },
    {
        id: 'reboot',
        title: 'Reboot when done',
        phase: 'firstLogon',
        body: `# Reboot in 60 seconds (needed after enabling Hyper-V / WSL)
shutdown.exe /r /t 60 /c 'Unattended setup finished. Rebooting.';`,
    },
];

if (typeof module !== 'undefined') module.exports = Snippets;
