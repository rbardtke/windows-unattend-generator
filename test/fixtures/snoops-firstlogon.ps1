if( [System.Environment]::OSVersion.Version.Build -lt 26100 ) {
    'This script requires Windows 11 24H2 or later.' | Write-Warning;
    return;
}

$timeout = [datetime]::Now.AddMinutes(5);
$exe = "$env:LOCALAPPDATA\Microsoft\WindowsApps\winget.exe";

while ($true) {
    if (Test-Path $exe) {
        $packages = @(
            "Valve.Steam",
            "Git.Git",
            "Discord.Discord",
            "Mozilla.Firefox",
            "Google.Chrome",
            "7zip.7zip",
            "Docker.DockerDesktop",
            "Microsoft.VisualStudioCode"
        )
        
        foreach ($package in $packages) {
            & $exe install --exact --id $package --silent --disable-interactivity --accept-package-agreements --accept-source-agreements --source winget --scope machine
        }
        
        # Download and install Blizzard Battle.net manually
        $bnetInstaller = "$env:TEMP\Battle.net-Setup.exe"
        Invoke-WebRequest -Uri "https://downloader.battle.net/download/getInstaller?os=win&installer=Battle.net-Setup.exe" -OutFile $bnetInstaller
        Start-Process -FilePath $bnetInstaller -ArgumentList "/silent" -Wait
        
        return;
    }
    
    if ([datetime]::Now -gt $timeout) {
        'File {0} does not exist.' -f $exe | Write-Warning;
        return;
    }
    Start-Sleep -Seconds 1;
}
