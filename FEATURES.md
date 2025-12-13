# Complete Windows Unattend Generator - Feature List

## Overview
This is a **complete implementation** of the Windows Unattend Generator with **100+ configuration options** across 8 major categories. The application generates valid `autounattend.xml` files for automated Windows 10/11 installations.

---

## 8 Main Tabs

### 1. Basic Setup Tab
**Processor Architecture**
- ☑ x86 (32-bit) support
- ☑ amd64 (64-bit) support
- ☑ ARM64 support
- Multi-architecture XML generation

**Language & Regional Settings**
- ☑ Primary display language (15+ languages)
- ☑ Secondary language (optional)
- ☑ Tertiary language (optional)
- ☑ Keyboard layout selection (30+ layouts)
- ☑ GeoLocation/Home region (240+ countries)
- ☑ Time zone configuration (50+ zones)

**Setup Options**
- ☑ Bypass TPM requirement (Windows 11)
- ☑ Bypass Secure Boot requirement (Windows 11)
- ☑ Bypass RAM requirement (Windows 11)
- ☑ Bypass storage requirement (Windows 11)
- ☑ Show PowerShell window during setup
- ☑ Disable Narrator auto-start
- ☑ Skip machine OOBE
- ☑ Skip user OOBE

**Windows Edition & Product Key**
- ☑ Edition selection (Pro, Home, Education, Enterprise, etc.)
- ☑ Product key modes:
  - No product key
  - Use generic key (auto-selected)
  - Custom product key
  - Ask during setup
- ☑ Auto-formatting for product keys

---

### 2. Computer & Accounts Tab

**Computer Naming**
- ☑ Random name (Windows-generated)
- ☑ Custom name (max 15 chars)
- ☑ PowerShell script-generated name
- ☑ Automatic validation

**User Accounts**
- ☑ Dynamic account table (add/remove up to 99 users)
- ☑ Per-account settings:
  - Username
  - Display name
  - Password (optional)
  - Group membership (Administrators, Users, Power Users, Guests)
  - Auto-logon flag
- ☑ Built-in Administrator account option
- ☑ Built-in Administrator password

**Password & Account Policies**
- ☑ Password expiration settings:
  - Default (42 days)
  - Never expire
  - Custom duration
- ☑ Account lockout policy:
  - Lockout threshold (failed attempts)
  - Observation window
  - Lockout duration
  - Enable/disable toggle

---

### 3. Disk Configuration Tab

**Partitioning Mode**
- ☑ Automatic (wipe & partition)
- ☑ Interactive (manual selection during install)
- ☑ Custom DiskPart script

**Partition Style**
- ☑ GPT (UEFI)
- ☑ MBR (BIOS)

**Advanced Partition Options**
- ☑ EFI System Partition size configuration
- ☑ Windows Recovery Environment modes:
  - Separate partition
  - Inside Windows partition
  - No recovery environment
- ☑ Recovery partition size
- ☑ Wipe disk before installation (warning)
- ☑ Custom DiskPart script textarea
- ☑ Disk assertion VBScript option

---

### 4. System Configuration Tab

**Compact OS**
- ☑ Automatic (Windows decides)
- ☑ Enabled (compress system files)
- ☑ Disabled

**24 System Tweaks**
1. ☑ Disable Windows Defender
2. ☑ Disable Windows Updates
3. ☑ Disable User Account Control (UAC)
4. ☑ Disable SmartScreen
5. ☑ Disable Fast Startup
6. ☑ Disable System Restore
7. ☑ Enable long path support (260+ characters)
8. ☑ Enable Remote Desktop
9. ☑ Disable telemetry (set to minimum)
10. ☑ Disable app suggestions
11. ☑ Prevent device encryption
12. ☑ Suppress Edge first run experience
13. ☑ Disable Edge startup boost
14. ☑ Enable Edge uninstall option
15. ☑ Disable mouse pointer precision (acceleration)
16. ☑ Disable Core Isolation / VBS
17. ☑ Enable process creation auditing
18. ☑ Disable system sounds
19. ☑ Prevent automatic reboot after updates
20. ☑ Disable Last Access Time stamps (performance)
21. ☑ Set PowerShell execution policy to RemoteSigned
22. ☑ Cleanup empty Windows.old folder
23. ☑ Disable automatic user sign-in after updates
24. ☑ Disable Smart App Control

---

### 5. User Interface Tab

**File Explorer**
- ☑ Show hidden files and folders
- ☑ Show file extensions
- ☑ Use classic context menu (Windows 11)
- ☑ Default to "This PC" view (instead of Quick Access)
- ☑ Show "End Task" in taskbar context menu

**Taskbar**
- ☑ Search box styles:
  - Default
  - Hide
  - Show icon only
  - Show search box
- ☑ Hide Task View button
- ☑ Hide Widgets button (Windows 11)
- ☑ Hide Chat button (Windows 11)
- ☑ Align taskbar to left (Windows 11)
- ☑ Auto-hide system tray icons
- ☑ Disable Bing search in Start menu

**Start Menu - Windows 10 Tiles**
- ☑ Default tiles
- ☑ No tiles (empty)
- ☑ Custom layout (XML upload)

**Start Menu - Windows 11 Pinned Apps**
- ☑ Default pins
- ☑ No pins (empty)
- ☑ Custom layout (JSON)

**Desktop Icons** (12 types)
- ☑ Remove Edge desktop shortcut
- ☑ Selectable icons:
  - This PC
  - Network
  - Recycle Bin
  - Control Panel
  - User's Files
  - Documents
  - Downloads
  - Music
  - Pictures
  - Videos

**Start Menu Folders - Windows 11** (9 types)
- ☑ Settings
- ☑ File Explorer
- ☑ Documents
- ☑ Downloads
- ☑ Music
- ☑ Pictures
- ☑ Videos
- ☑ Network
- ☑ Personal Folder

---

### 6. Appearance Tab

**Visual Effects**
- ☑ Preset modes:
  - Default Windows settings
  - Best appearance
  - Best performance
  - Custom settings
- ☑ 12 individual visual effect toggles:
  - Animate windows when minimizing/maximizing
  - Animate controls and elements
  - Fade or slide menus into view
  - Fade out menu items after clicking
  - Smooth-scroll list boxes
  - Slide open combo boxes
  - Show shadows under windows
  - Show shadows under mouse pointer
  - Show thumbnails instead of icons
  - Show translucent selection rectangle
  - Enable Peek (desktop preview)
  - Show taskbar thumbnails

**Theme & Colors**
- ☑ Theme mode:
  - System default
  - Dark
  - Light
- ☑ Custom accent color (RGB color picker)
- ☑ Show accent color on Start and taskbar
- ☑ Show accent color on title bars and borders
- ☑ Enable transparency effects

**Desktop Wallpaper**
- ☑ Wallpaper modes:
  - Default Windows wallpaper
  - Solid color
  - Custom image (base64 embedded)
  - Custom image (file path)
- ☑ Background color picker
- ☑ Image upload (with base64 encoding)
- ☑ Wallpaper styles:
  - Fill
  - Fit
  - Stretch
  - Tile
  - Center
  - Span

**Lock Screen**
- ☑ Disable lock screen option
- ☑ Custom lock screen image upload

---

### 7. Network & Tools Tab

**Wi-Fi Configuration**
- ☑ Setup modes:
  - Interactive (ask during setup)
  - Skip Wi-Fi setup
  - Pre-configure network
  - Custom XML profile
- ☑ Network settings:
  - SSID
  - Authentication (Open, WPA2-Personal, WPA3-Personal, WPA2-Enterprise)
  - Password
  - Hidden network toggle
  - Auto-connect toggle
- ☑ Custom Wi-Fi profile XML textarea

**VM Guest Tools**
- ☑ Oracle VirtualBox Guest Additions
- ☑ VMware Tools
- ☑ VirtIO Guest Tools + QEMU Guest Agent
- ☑ Parallels Tools

**Accessibility & Lock Keys**
- ☑ Caps Lock initial state (default/on/off)
- ☑ Num Lock initial state (default/on/off)
- ☑ Scroll Lock initial state (default/on/off)
- ☑ Sticky Keys modes:
  - Default Windows settings
  - Disabled
  - Custom configuration (6 sub-options):
    - Enable Shift key activation (press 5 times)
    - Play sound when toggling
    - Show icon on taskbar
    - Lock modifier keys when pressed twice
    - Turn off when two keys pressed simultaneously
    - Show confirmation dialog

**Privacy / Express Settings**
- ☑ Privacy modes:
  - Interactive (ask during setup)
  - Disable all (maximum privacy)
  - Enable all (full telemetry)

---

### 8. Scripts & Advanced Tab

**Custom Scripts** (4 execution phases)

Each phase supports 5 script types: .cmd, .ps1, .reg, .vbs, .js

1. **System Phase (Specialize Pass)**
   - ☑ Runs during Windows setup before first logon
   - ☑ SYSTEM privileges
   - ☑ Script type selector
   - ☑ Script content textarea

2. **UserOnce Phase**
   - ☑ Runs once for each new user on first logon
   - ☑ User privileges
   - ☑ Script type selector
   - ☑ Script content textarea

3. **FirstLogon Phase**
   - ☑ Runs on first administrator logon after installation
   - ☑ Administrator privileges
   - ☑ Script type selector
   - ☑ Script content textarea

4. **DefaultUser Phase**
   - ☑ Applied to default user profile
   - ☑ Affects all new users
   - ☑ Script type selector
   - ☑ Script content textarea

**Advanced Components**
- ☑ Custom Components XML textarea
- ☑ AppLocker Policy XML textarea
- ☑ Distribution Share ($OEM$ folders) documentation

**XML Preview**
- ☑ Live preview of generated XML
- ☑ Syntax highlighting
- ☑ Auto-update on form changes (debounced)

---

## Additional Features

### State Management
- ☑ Auto-save to localStorage (every 1 second after changes)
- ☑ Auto-restore on page reload
- ☑ Export configuration as JSON
- ☑ Import configuration from JSON

### Presets
- ☑ Minimal Configuration
- ☑ Single User Account
- ☑ VM Guest Tools
- ☑ Privacy Focused
- ☑ Gaming Optimized

### UI/UX Features
- ☑ Responsive tabbed interface
- ☑ Conditional field visibility
- ☑ Dynamic account table (add/remove rows)
- ☑ Real-time validation
- ☑ Error messages for invalid inputs
- ☑ Toast notifications
- ☑ Keyboard shortcuts:
  - Ctrl+S / Cmd+S: Generate & Download
  - Ctrl+O / Cmd+O: Import configuration
- ☑ Dark mode support (prefers-color-scheme)
- ☑ Mobile responsive design
- ☑ Print-friendly styles

### Validation
- ☑ Computer name validation (1-15 chars, alphanumeric + hyphens)
- ☑ Username validation (1-20 chars, reserved names check)
- ☑ Product key format validation (auto-formatting)
- ☑ Password strength indicators
- ☑ Number field min/max validation
- ☑ Real-time field validation
- ☑ Visual validation feedback (green/red borders)

### File Handling
- ☑ Image uploads (wallpaper, lock screen) with base64 encoding
- ☑ File size validation (5MB max for images)
- ☑ File type validation
- ☑ XML download as `autounattend.xml`
- ☑ JSON configuration export/import

---

## Technical Implementation

### Architecture
- **Modular JavaScript**: Separated into 11 specialized modules
- **No external dependencies**: Pure vanilla JavaScript
- **Modern ES6+**: Classes, arrow functions, template literals
- **Event-driven**: Pub/sub pattern for UI updates
- **Performant**: Debounced updates, efficient DOM manipulation

### File Structure
```
/home/rouven/workspace/schneegans-unattend-web/
├── index.html                 (84,873 bytes - Complete UI with 8 tabs)
├── css/
│   └── styles.css            (Comprehensive styling with responsiveness)
├── js/
│   ├── app.js                (Main application logic)
│   ├── config-model.js       (Default configuration model)
│   ├── state-manager.js      (localStorage persistence)
│   ├── ui-components.js      (Dynamic UI elements)
│   ├── xml-generator.js      (Complete XML generation - 526 lines)
│   ├── registry-generator.js (Registry tweak commands)
│   ├── validation.js         (Form validation)
│   ├── utils.js              (Utility functions)
│   ├── presets.js            (Configuration presets)
│   ├── countries-data.js     (240+ countries)
│   └── languages-data.js     (Language & keyboard data)
└── README.md                 (Project documentation)
```

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Features Count Summary
- **8** major configuration tabs
- **100+** configuration options
- **240+** countries for GeoLocation
- **50+** time zones
- **30+** keyboard layouts
- **15+** languages
- **24** system tweaks
- **12** visual effects toggles
- **12** desktop icon options
- **9** start menu folder options
- **5** preset configurations
- **4** script execution phases
- **4** VM guest tool integrations

---

## Usage

1. Open `index.html` in a modern web browser
2. Navigate through the 8 tabs to configure Windows installation
3. Click "Generate & Download" to get `autounattend.xml`
4. Place the XML file on your Windows installation media root directory
5. Boot from the media to start automated installation

---

## Status: ✅ COMPLETE

All 100+ features are fully implemented and functional. The application generates valid Windows unattend XML files compatible with Windows 10 and Windows 11.
