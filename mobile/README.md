# Crypto Mining Platform - Mobile App

React Native mobile application scaffold for the Crypto Mining Platform.

## Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

## Installation

```bash
cd mobile
npm install
```

## Running the App

### Start Expo Dev Server

```bash
npm start
```

### Run on iOS Simulator

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run in Web Browser

```bash
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/        # Screen components
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services
│   ├── store/          # State management
│   └── utils/          # Utility functions
├── assets/             # Images, fonts, etc.
├── App.tsx             # Main app component
├── app.json            # Expo configuration
└── package.json
```

## Features (Planned)

- [ ] User authentication with biometrics
- [ ] Dashboard with mining stats
- [ ] Wallet management
- [ ] Transaction history
- [ ] Withdrawal requests
- [ ] KYC document upload with camera
- [ ] Push notifications
- [ ] QR code scanner for wallet addresses
- [ ] Dark mode support
- [ ] Offline mode with local caching

## Development

This is a basic scaffold. To fully implement the mobile app:

1. Set up state management (Redux or Zustand)
2. Implement API service layer
3. Create screen components
4. Add navigation structure
5. Implement authentication flow
6. Add push notifications
7. Integrate with backend API

## API Configuration

Create a `.env` file:

```env
API_URL=https://api.yourdomain.com/api/v1
```

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

## License

MIT
