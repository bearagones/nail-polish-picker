# Tauri Desktop App Guide

## Overview

This Nail Polish Picker application has been successfully converted to run as a native desktop application using Tauri v2. This provides a faster, more integrated experience compared to running in a web browser.

## What is Tauri?

Tauri is a framework for building tiny, fast desktop applications using web technologies (HTML, CSS, JavaScript) with a Rust backend. It's similar to Electron but much smaller and more performant.

## Benefits of the Desktop App

✅ **Smaller Size**: ~5-10MB installer vs 50-100MB+ for Electron
✅ **Better Performance**: Native system integration with Rust
✅ **Lower Memory Usage**: More efficient than browser-based apps
✅ **Offline Support**: Full functionality without internet
✅ **Native Experience**: System notifications, file dialogs, etc.
✅ **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **Rust** (latest stable)
   - Download from: https://rustup.rs/
   - After installation, verify with: `rustc --version`

3. **System Dependencies**
   - **Windows**: WebView2 (pre-installed on Windows 10/11)
   - **macOS**: Xcode Command Line Tools
   - **Linux**: WebKitGTK, libappindicator, etc. (varies by distro)

### Project Setup

```bash
# Clone the repository
git clone https://github.com/bearagones/nail-polish-picker.git
cd nail-polish-picker

# Install dependencies
npm install

# Verify Rust is installed
rustc --version
```

## Running the Desktop App

### Development Mode

```bash
npm run tauri:dev
```

This command will:
1. Start the React development server on `http://localhost:3000`
2. Compile the Rust backend
3. Launch the desktop app window
4. Enable hot-reload for React changes
5. Open DevTools automatically (in development mode)

**Note**: First run will take longer as Rust dependencies are downloaded and compiled.

### Production Build

```bash
npm run tauri:build
```

This creates optimized installers in:
- **Windows**: `src-tauri/target/release/bundle/msi/` or `nsis/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `appimage/`

## Project Structure

```
nail-polish-picker/
├── src/                          # React source code
│   ├── components/               # React components
│   ├── context/                  # Context providers
│   ├── firebase/                 # Firebase configuration
│   └── styles/                   # CSS styles
├── src-tauri/                    # Tauri backend
│   ├── src/
│   │   └── main.rs              # Rust entry point
│   ├── icons/                    # App icons (all platforms)
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   └── build.rs                 # Build script
├── public/                       # Static assets
└── package.json                  # Node dependencies & scripts
```

## Key Configuration Files

### `src-tauri/tauri.conf.json`

Main configuration file that controls:
- App name and identifier
- Window dimensions and behavior
- Build commands
- Bundle settings
- Security policies (CSP)
- Permissions

Key settings:
```json
{
  "identifier": "com.nailpolishpicker.app",
  "productName": "Nail Polish Picker",
  "app": {
    "windows": [{
      "title": "Nail Polish Picker",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600
    }],
    "security": {
      "csp": "... includes Firebase Storage domains ..."
    }
  }
}
```

### `src-tauri/Cargo.toml`

Rust dependencies and project metadata. Uses Tauri v2.

### `src-tauri/src/main.rs`

Rust backend that:
- Initializes the Tauri application
- Opens DevTools in development mode
- Handles window management

## Features Specific to Desktop App

### 1. Native Window Controls
- Minimize, maximize, close buttons
- Resizable window with minimum dimensions
- Native title bar

### 2. DevTools in Development
- Automatically opens DevTools in debug builds
- Disabled in production builds

### 3. Secure Content Security Policy
- Allows Firebase domains for auth and storage
- Blocks unauthorized external resources
- Supports local data URLs and blobs

### 4. Offline Functionality
- Works completely offline with localStorage
- Firebase sync when online

### 5. System Integration
- Desktop icon
- System tray integration (can be added)
- File dialogs for image uploads (native)
- Notifications (can be added)

## Common Development Tasks

### Update App Icon

Replace the icon source image, then regenerate:
```bash
npx @tauri-apps/cli icon "path/to/icon.png"
```

Icon should be at least 512x512 pixels, PNG format.

### Add Custom Commands

1. Define Rust commands in `src-tauri/src/main.rs`:
```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

2. Register in builder:
```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    // ...
```

3. Call from React:
```javascript
import { invoke } from '@tauri-apps/api/core';

const greeting = await invoke('greet', { name: 'User' });
```

### Update Dependencies

```bash
# Update npm packages
npm update

# Update Rust dependencies
cd src-tauri
cargo update
cd ..
```

## Troubleshooting

### Build Errors

**"Rust compiler not found"**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or on Windows, download from https://rustup.rs/
```

**"WebView2 not found" (Windows)**
- Download from: https://developer.microsoft.com/microsoft-edge/webview2/
- Usually pre-installed on Windows 10/11

**Cargo build errors**
```bash
# Clean Rust build cache
cd src-tauri
cargo clean
cd ..

# Retry build
npm run tauri:dev
```

### Firebase Storage Issues

If images don't load, see [FIREBASE_STORAGE_SETUP.md](./FIREBASE_STORAGE_SETUP.md) for CORS configuration.

The desktop app uses `tauri://localhost` as its origin, which needs to be allowed in Firebase Storage CORS settings.

### Performance Issues

- Clear Rust build cache: `cargo clean` in `src-tauri/`
- Clear React build cache: Delete `build/` and `node_modules/.cache/`
- Update dependencies: `npm update` and `cargo update`

### Window Issues

If window doesn't open or displays incorrectly:
1. Check `src-tauri/tauri.conf.json` window settings
2. Verify React dev server is running on localhost:3000
3. Check console for errors

## Development Workflow

1. **Start Development**:
   ```bash
   npm run tauri:dev
   ```

2. **Make Changes**:
   - Edit React components in `src/`
   - Changes hot-reload automatically
   - For Rust changes, app restarts automatically

3. **Test Features**:
   - Use DevTools (auto-opened in dev mode)
   - Test Firebase authentication
   - Test image upload/display
   - Test offline functionality

4. **Build for Distribution**:
   ```bash
   npm run tauri:build
   ```

5. **Test Installer**:
   - Install the built app
   - Verify all features work
   - Check that images load correctly

## Production Checklist

Before building for production:

- [ ] Update version in `package.json` and `src-tauri/tauri.conf.json`
- [ ] Test all features in development mode
- [ ] Verify Firebase configuration is correct
- [ ] Test image upload and display
- [ ] Configure Firebase Storage CORS
- [ ] Update app icon if needed
- [ ] Test offline functionality
- [ ] Build production version
- [ ] Test the installer
- [ ] Verify app works on clean system

## Security Considerations

1. **Firebase Keys**: Safe to include in desktop app (client-side)
2. **CSP**: Configured to allow only necessary domains
3. **File Access**: Limited by Tauri permissions
4. **Updates**: Consider implementing Tauri updater for automatic updates

## Resources

- **Tauri Documentation**: https://tauri.app/
- **Tauri v2 API**: https://tauri.app/v2/api/js/
- **React Documentation**: https://react.dev/
- **Firebase Documentation**: https://firebase.google.com/docs

## Support

For issues specific to:
- **Tauri**: https://github.com/tauri-apps/tauri/issues
- **This App**: Create an issue in the GitHub repository
- **Firebase**: https://firebase.google.com/support

## Future Enhancements

Potential features to add:
- [ ] System tray integration
- [ ] Desktop notifications
- [ ] Auto-updater
- [ ] Keyboard shortcuts
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Multi-window support
- [ ] Drag-and-drop image uploads
