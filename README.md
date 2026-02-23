# Nail Polish Picker

A desktop and web application to help you randomly pick nail polish colors from your collection. Built with React and Tauri for a native desktop experience.

## Features

- 🎨 Random nail polish picker with filtering options
- 🔍 Filter by color groups (reds, pinks, blues, etc.)
- 💅 Filter by formula types (creme, shimmer, glitter, etc.)
- ✨ Optional topper suggestions
- 👤 User authentication with Firebase
- 💾 Save your nail polish collection across devices
- 📱 Responsive design

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/bearagones/nail-polish-picker.git
cd nail-polish-picker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your actual Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### 4. Firebase Setup

To get your Firebase configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General > Your apps
4. Click "Add app" and select "Web"
5. Register your app and copy the configuration values
6. Enable Authentication > Sign-in method > Email/Password
7. Create a Firestore database

### 5. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Desktop Application (Tauri)

This application can also run as a native desktop application using Tauri.

### Prerequisites

- **Rust**: Install from [https://rustup.rs/](https://rustup.rs/)
- **Node.js**: Version 18 or higher
- **System Dependencies** (Windows): WebView2 (usually pre-installed on Windows 10/11)

### Running the Desktop App (Development)

```bash
npm run tauri:dev
```

This will:
1. Start the React development server
2. Build the Rust backend
3. Launch the desktop application with hot-reload

The desktop app will automatically open with DevTools in development mode.

### Building the Desktop App (Production)

```bash
npm run tauri:build
```

The installer will be created in:
- **Windows**: `src-tauri/target/release/bundle/msi/` or `src-tauri/target/release/bundle/nsis/`
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `src-tauri/target/release/bundle/appimage/`

### Desktop App Features

✅ **Offline Support**: Works without internet (local storage)
✅ **Native Performance**: Faster than web browser
✅ **System Integration**: Desktop icons, notifications
✅ **Secure**: Sandboxed environment
✅ **Cross-Platform**: Windows, macOS, Linux

### Troubleshooting Desktop App

If you encounter issues with the desktop app:

1. **Build Errors**: Make sure Rust is installed and updated
   ```bash
   rustup update
   ```

2. **WebView Issues (Windows)**: Ensure WebView2 is installed
   - Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

## Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Framework Preset: **Create React App** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm ci && npm run build` (specified in vercel.json)
   - Output Directory: `build` (specified in vercel.json)
   - Install Command: `npm ci` (specified in vercel.json)

3. **Set Environment Variables in Vercel:**
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add each variable from your `.env` file:
     ```
     REACT_APP_FIREBASE_API_KEY = your_actual_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN = your_project_id.firebaseapp.com
     REACT_APP_FIREBASE_PROJECT_ID = your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET = your_project_id.firebasestorage.app
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID = your_app_id
     ```

4. **Redeploy:**
   - After adding environment variables, trigger a new deployment

## Security Notes

- **Never commit your `.env` file** - it contains sensitive Firebase keys
- The `.env` file is already included in `.gitignore`
- Use `.env.example` as a template for other developers
- For production deployment, set environment variables in your hosting platform (Vercel, Netlify, etc.)
- Your Firebase API keys are safe to expose in client-side code as they're designed for public use, but domain restrictions should be configured in Firebase Console

## Technologies Used

- React 18
- Firebase Authentication
- Cloud Firestore
- CSS3 with custom styling
- Modern JavaScript (ES6+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
