# Windows Unattend Generator - Complete Edition

A comprehensive pure HTML/JavaScript web application for generating highly customized `autounattend.xml` files for automated Windows 10/11 installations with **100+ configuration options**.

## Features

✨ **Complete Feature Parity** with the original [schneegans.de](https://schneegans.de/windows/unattend-generator/) generator

### Core Features
- **Pure Client-Side**: No server required, runs entirely in your browser
- **100+ Configuration Options**: Complete control over every aspect of Windows installation
- **8 Organized Tabs**: Intuitive interface with tabbed navigation
- **Multi-Architecture Support**: x86, amd64 (x64), and ARM64
- **Live XML Preview**: See the generated XML in real-time with syntax highlighting
- **Configuration Presets**: 5 pre-configured templates for common scenarios
- **Import/Export**: Save and load configurations in JSON or **XML format** 🆕
- **XML Import**: Import generated autounattend.xml files back into the generator 🆕
- **XML Validation**: Built-in Python validator for Linux users 🆕
- **Auto-Save**: Configuration automatically saved to localStorage
- **No Dependencies**: Pure vanilla JavaScript, no frameworks needed
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Automatic dark mode based on system preferences

## Complete Feature List

### Tab 1: Basic Setup
- **Processor Architecture**: x86 (32-bit), amd64 (64-bit), ARM64
- **Multi-Language Support**: Primary, secondary, and tertiary languages
- **Regional Settings**: GeoLocation (240+ countries), keyboard layouts, time zones
- **Windows 11 Bypasses**: TPM, Secure Boot, RAM, and storage requirement bypasses
- **Setup Options**: PowerShell window visibility, narrator control, OOBE skip options
- **Windows Edition**: Pro, Home, Education, Enterprise, Workstation, Server editions
- **Product Key Modes**: None, generic, custom, interactive, or firmware-based

### Tab 2: Computer & Accounts
- **Computer Naming**: Random, custom name, or PowerShell script-generated
- **Multiple User Accounts**: Add up to 99 local user accounts
- **Account Management**: Username, display name, password, group assignment, auto-logon
- **Built-in Administrator**: Enable and configure built-in admin account
- **Password Policies**: Never expire, default (42 days), or custom expiration
- **Account Lockout**: Configurable threshold, observation window, and lockout duration

### Tab 3: Disk Configuration
- **Partitioning Modes**: Automatic, interactive, or custom DiskPart script
- **Partition Styles**: GPT (UEFI) or MBR (BIOS)
- **Advanced Options**: Configurable EFI partition size, MSR partition
- **Windows RE**: Separate partition, inside Windows, or disabled
- **Custom Scripting**: Full DiskPart script support
- **Disk Assertion**: VBScript validation before partitioning

### Tab 4: System Configuration
- **Compact OS**: Auto, enabled, or disabled compression
- **24 System Tweaks** including:
  - Disable: Windows Defender, Updates, UAC, SmartScreen, telemetry
  - Disable: Fast Startup, System Restore, device encryption, app suggestions
  - Enable: RDP, long paths (260+ chars), PowerShell RemoteSigned
  - Edge: Suppress first run, disable startup boost, enable uninstall option
  - Performance: Disable mouse acceleration, last access time stamps
  - Security: Process auditing, Core Isolation/VBS control
  - System: Auto-reboot prevention, Windows.old cleanup, auto sign-in control

### Tab 5: User Interface
- **File Explorer**: Hidden files, extensions, classic context menu (Win11), default view, end task button
- **Taskbar**: Search box styles, Task View, Widgets, Chat, alignment (Win11), tray auto-hide, Bing search
- **Start Menu - Windows 10**: Default tiles, no tiles, or custom XML layout
- **Start Menu - Windows 11**: Default pins, no pins, or custom JSON layout
- **Desktop Icons**: 10 icon types (This PC, Network, Recycle Bin, Control Panel, Documents, Downloads, Music, Pictures, Videos, User Files)
- **Start Folders (Win11)**: 9 configurable folders

### Tab 6: Appearance
- **Visual Effects**: Presets (default, best appearance, best performance) or 12 custom toggles:
  - Window/control animations, menu fade/slide, tooltips, smooth scrolling
  - Shadows (windows, mouse), thumbnails, translucent selection, Peek, taskbar previews
- **Theme**: Dark/light mode selection
- **Accent Colors**: Custom RGB color picker, show on Start/taskbar/title bars
- **Desktop Wallpaper**: Default, solid color, custom image (base64), or file path
- **Wallpaper Style**: Fill, fit, stretch, tile, center, span
- **Lock Screen**: Disable or custom image upload
- **Transparency Effects**: Enable/disable

### Tab 7: Network & Tools
- **Wi-Fi Configuration**:
  - Modes: Interactive, skip, pre-configure, or custom XML profile
  - Settings: SSID, authentication (Open, WPA2, WPA3), password, hidden network
- **VM Guest Tools**: Automatic installation support for:
  - Oracle VirtualBox Guest Additions
  - VMware Tools
  - VirtIO Guest Tools + QEMU Guest Agent
  - Parallels Tools
- **Accessibility**:
  - Lock Keys: Caps Lock, Num Lock, Scroll Lock initial states
  - Sticky Keys: Default, disabled, or 6 custom configuration options
- **Privacy/Express Settings**: Interactive, disable all (max privacy), or enable all

### Tab 8: Scripts & Advanced
- **4-Phase Script System**:
  - **System Phase** (Specialize pass): Runs with SYSTEM privileges before first logon
  - **UserOnce Phase**: Runs once for each new user on first logon
  - **FirstLogon Phase**: Runs on first administrator logon
  - **DefaultUser Phase**: Applied to default user profile, affects all new users
- **Script Types**: .cmd, .ps1, .reg, .vbs, .js support for all phases
- **Advanced Components**: Custom XML components injection
- **AppLocker Policy**: Application control policy XML
- **Distribution Share**: $OEM$ folder structure documentation

## Quick Start

### Local Usage
1. **Open the application**: Open `index.html` in any modern web browser
2. **Configure**: Navigate through the 8 tabs and configure your Windows installation
3. **Preview**: View the live XML preview at the bottom of the Scripts & Advanced tab
4. **Download**: Click "Generate & Download" to get your `autounattend.xml`
5. **Deploy**: Place the file on your Windows installation media

### Web Server
```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server

# Then open http://localhost:8000
```

## Configuration Presets

The application includes 5 pre-configured presets:

1. **Minimal**: Bare minimum configuration for basic Windows installation
2. **Single User**: One admin account with privacy settings
3. **VM Guest**: Optimized for virtual machines with tool installation
4. **Privacy**: Maximum privacy with telemetry disabled and all tracking off
5. **Gaming**: Performance-optimized for gaming systems

## Usage Tips

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Generate and download XML
- `Ctrl/Cmd + O`: Import configuration file

### Save & Resume
- Configuration is automatically saved to browser localStorage
- Return anytime and your settings will be restored
- Use "Save Config (JSON)" to export configuration for backup

### Import/Export
- **Export JSON**: Click "Save Config (JSON)" to save your configuration
- **Import JSON**: Click "Import (XML/JSON)" and select a JSON file
- **Import XML**: Click "Import (XML/JSON)" and select an autounattend.xml file 🆕
  - Import generated XML files back into the generator
  - Edit and regenerate existing configurations
  - Works with files from schneegans.de or other sources
- Share configurations between systems or with team members

### XML Validation (Linux Users) 🆕
```bash
# Validate generated XML files
python3 validate_xml.py autounattend.xml

# Output shows:
# - XML well-formedness check
# - Structure validation
# - Component listing
# - Architecture detection
```

See [VALIDATION.md](VALIDATION.md) for complete validation documentation.

### Multi-Account Setup
- Click "Add Account" to create additional user accounts (up to 99)
- Configure username, display name, password, and group for each
- Select one account for auto-logon if desired

## File Structure

```
schneegans-unattend-web/
├── index.html                 # Main application (tabbed interface)
├── css/
│   └── styles.css            # Complete styling with tabs, dark mode
├── js/
│   ├── app.js               # Main application controller
│   ├── xml-generator.js     # Comprehensive XML generation engine
│   ├── xml-parser.js        # XML import parser 🆕
│   ├── ui-components.js     # Dynamic UI components (tabs, accounts table)
│   ├── config-model.js      # Configuration data model
│   ├── state-manager.js     # localStorage persistence
│   ├── registry-generator.js # System tweaks via registry
│   ├── validation.js        # Form validation logic
│   ├── presets.js           # 5 configuration presets
│   ├── utils.js             # Utility functions
│   ├── countries-data.js    # 240+ countries for GeoLocation
│   └── languages-data.js    # Language/keyboard/timezone data
├── validate_xml.py           # Python XML validator (Linux) 🆕
├── VALIDATION.md             # XML validation guide 🆕
├── TEST_XML_IMPORT.md        # XML import testing guide 🆕
├── test_xml_parser.html      # Standalone XML parser tester 🆕
├── backup/                   # Backup of simple version
└── README.md                # This file
```

## Deployment Options

This is a **100% static** application with no backend requirements:

### Free Hosting Options
- **GitHub Pages**: Push to repo, enable Pages in Settings
- **Netlify**: Drag & drop or connect git repo
- **Vercel**: Import git repository
- **Cloudflare Pages**: Connect git repository
- **Any Static Host**: Upload files to any web server

### Example: GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main

# Then enable GitHub Pages in repository Settings → Pages
# Your app will be at: https://yourusername.github.io/your-repo/
```

## Technical Details

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ support

### Technologies Used
- **HTML5**: Semantic markup, forms, file upload
- **CSS3**: Variables, Flexbox, Grid, animations, media queries
- **Vanilla JavaScript (ES6+)**: Classes, modules, async/await
- **Web APIs**: DOM, File API, Blob, localStorage, FormData

### XML Generation
Generates valid Microsoft Windows Answer Files (unattend.xml) with:
- **windowsPE pass (1)**: Language, disk configuration, bypasses
- **specialize pass (4)**: Computer name, timezone, system tweaks
- **oobeSystem pass (7)**: User accounts, OOBE, first logon commands

Supports:
- Multi-architecture components (x86/amd64/ARM64)
- Complex disk partitioning (GPT/MBR, custom sizes, WinRE)
- Multiple user accounts with encoded passwords
- Registry tweaks via FirstLogonCommands
- Custom scripts in multiple languages
- VM guest tools installation

## Comparison with Original

This implementation has **feature parity** with the original [schneegans.de generator](https://schneegans.de/windows/unattend-generator/):

### ✅ Fully Implemented
- All 8 major configuration sections
- 100+ individual configuration options
- Multi-architecture support
- Multiple user accounts
- Advanced disk partitioning
- System tweaks (24 options)
- UI customization (File Explorer, Taskbar, Start Menu)
- Visual effects controls
- VM guest tools
- Wi-Fi configuration
- Accessibility settings
- 4-phase custom scripting
- Password policies
- Wallpaper/lock screen customization

### Advantages of This Version
✅ Pure client-side (no server needed)
✅ Works completely offline
✅ Free hosting (static files)
✅ Easy to customize (just edit JS)
✅ Auto-save to localStorage
✅ Dark mode support
✅ Mobile responsive

## Security & Privacy

- **100% Client-Side**: All processing happens in your browser
- **No Servers**: No data is ever sent to any server
- **No Tracking**: No analytics, no telemetry, no cookies
- **Open Source**: Review all code in the repository
- **Password Encoding**: Uses Microsoft's standard base64 encoding for unattend.xml

### Important Notes
- The generated XML contains your configuration in plain text (including encoded passwords)
- Handle autounattend.xml files securely
- Don't share XML files containing sensitive passwords
- Use the JSON export feature to save configurations without generating XML

## Known Limitations

- XML import not yet implemented (use JSON for now)
- Some advanced original features may have slight differences
- Custom DiskPart scripts are not validated for syntax
- Wallpaper base64 embedding increases XML file size significantly

## Troubleshooting

### Application Won't Load
- Check browser console for errors (F12)
- Ensure all JavaScript files are present in the `js/` folder
- Try clearing browser cache and localStorage

### XML Generation Fails
- Verify all required fields are filled
- Check browser console for detailed error messages
- Ensure usernames don't contain invalid characters

### Preview Not Updating
- Wait 500ms after making changes (debounced)
- Check if JavaScript is enabled
- Look for console errors

## Contributing

Contributions are welcome! Areas for improvement:

- XML import functionality
- Additional validation rules
- More configuration presets
- Better error messages
- UI/UX improvements
- Documentation enhancements
- Test coverage
- Accessibility improvements

## License

MIT License - Free to use, modify, and distribute.

## Credits & Inspiration

This project is inspired by and aims for feature parity with:
- [cschneegans/unattend-generator](https://github.com/cschneegans/unattend-generator) - Original C#/.NET implementation by Christian Schneegans
- [schneegans.de/windows/unattend-generator](https://schneegans.de/windows/unattend-generator/) - Official web version

Special thanks to Christian Schneegans for creating the original comprehensive unattend generator.

## Support & Resources

### This Tool
- Check browser console (F12) for errors
- Review generated XML for syntax errors
- Try different presets to understand options

### Windows Installation
- [Microsoft Windows Setup Documentation](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/)
- [Answer Files Reference](https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/update-windows-settings-and-scripts-create-your-own-answer-file-sxs)
- [Unattended Windows Setup Reference](https://docs.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/)

## Changelog

### Version 2.0.0 (Complete Edition)
- ✅ Complete rewrite with 100+ configuration options
- ✅ 8-tab interface for organized configuration
- ✅ Multi-architecture support (x86/amd64/ARM64)
- ✅ Multiple user accounts (up to 99)
- ✅ Advanced disk partitioning with custom DiskPart
- ✅ 24 system tweaks and optimizations
- ✅ Complete UI customization (Explorer, Taskbar, Start Menu)
- ✅ Visual effects controls (12 options)
- ✅ VM guest tools integration
- ✅ Wi-Fi pre-configuration
- ✅ 4-phase custom scripting system
- ✅ Password policies and account lockout
- ✅ Wallpaper and lock screen customization
- ✅ Accessibility settings
- ✅ Registry tweaks generator
- ✅ Auto-save to localStorage
- ✅ 5 configuration presets
- ✅ Dark mode support
- ✅ Responsive mobile design

### Version 1.0.0 (Initial Release - Basic)
- Basic HTML/JS implementation
- Simple form configuration
- Limited options (25% of current features)
