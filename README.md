# Nail Polish Picker

A React application to help you randomly pick nail polish colors from your collection.

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
