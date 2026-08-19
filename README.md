# Portal Dev Mobile 📱

> **Complete mobile solution for managing schools and admin users on the Portal Dev platform**

[![React Native](https://img.shields.io/badge/React%20Native-0.86-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

---

## 📖 About

Portal Dev Mobile is the mobile companion app for the Portal Dev Dashboard. It provides complete platform management capabilities for iOS and Android devices, allowing developers to manage schools, admin users, and payment settings on the go.

### ✨ Key Features

- 🔐 **Secure Authentication** - UIN/Password with role-based access
- 🏫 **Schools Management** - Full CRUD operations with subscription management
- 👥 **Admin Users** - Create and manage admin users across all schools
- 💳 **Payment Settings** - Connect and manage Paystack accounts
- 🔄 **Real-time Sync** - Pull-to-refresh for latest data
- 📊 **Statistics** - Dashboard with key metrics
- 🔍 **Search & Filter** - Powerful search and filtering capabilities
- 📱 **Native Experience** - Optimized for mobile with native UI

---

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS**: Xcode (Mac only) or Expo Go app
- **Android**: Android Studio or Expo Go app

---

## 🛠️ Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd Portal-Dev-Mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm start
   ```

4. **Run on your device**
   - Install **Expo Go** from App Store or Google Play
   - Scan the QR code displayed in terminal

---

## 📱 Screens

### Authentication
- **Login Screen** - Secure login with UIN and password

### Schools Management
- **Schools List** - View all schools with search and filters
- **School Details** - View complete school information
- **Create School** - Register new school
- **Edit School** - Update school information
- **Edit Subscription** - Manage subscription details

### Admin Users Management
- **Users List** - View all admin users with search and filters
- **User Profile** - View complete user information
- **Create User** - Add new admin user
- **Edit User** - Update user information

### Payment Settings
- **Payment Settings** - View and manage Paystack accounts

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native 0.86 | Mobile framework |
| Expo 57 | Development platform |
| Expo Router | File-based routing |
| TypeScript | Type safety |
| Zustand | State management |
| Axios | HTTP client |
| AsyncStorage | Local storage |
| Lucide Icons | UI icons |

---

## 📂 Project Structure

```
src/
├── app/              # Screens (Expo Router)
├── config/           # Configuration (axios, media)
├── stores/           # Zustand state management
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

---

## 🔧 Configuration

### API Configuration

The API base URL is set in `src/config/axios.ts`:

```typescript
export const BASE_URL = "https://portal-api.idealsmartsolutions.com/api";
```

### Supported Platforms

- ✅ iOS 13+
- ✅ Android 6.0+
- ✅ Web (limited support)

---

## 🎯 Features

### ✅ Implemented

#### Authentication
- [x] Login with UIN/Password
- [x] Role validation (dev/developer only)
- [x] Session persistence
- [x] Auto-logout on unauthorized access

#### Schools
- [x] List with search and filter
- [x] View details
- [x] Create new school
- [x] Edit school
- [x] Manage subscription
- [x] Toggle subscription status

#### Admin Users
- [x] List with search and filter
- [x] View profile
- [x] Create new user
- [x] Edit user
- [x] Copy password

#### Payment
- [x] View linked accounts
- [x] Connect new account
- [x] Verify bank account

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Implementation details
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview

---

## 🧪 Testing

### Manual Testing

```bash
# Start app
npm start

# Test on iOS Simulator
npm run ios

# Test on Android Emulator
npm run android

# Test on physical device
# Use Expo Go app and scan QR code
```

### Test Credentials

Use your developer credentials:
- **UIN**: Your UIN
- **Password**: Your password
- **Note**: Only "dev" or "developer" roles are allowed

---

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
expo start -c
```

**Module not found:**
```bash
rm -rf node_modules
npm install
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
expo start
```

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for more troubleshooting tips.

---

## 📦 Build for Production

### iOS
```bash
eas build -p ios --profile production
```

### Android
```bash
eas build -p android --profile production
```

---

## 🔄 Updates

### Over-the-Air (OTA) Updates
```bash
eas update --branch production
```

---

## 👥 Team

**iDEAL Smart Solution Limited**

- Platform: iOS & Android
- Technology: React Native + Expo
- State Management: Zustand
- Version: 1.0.0

---

## 📄 License

Proprietary - © 2026 iDEAL Smart Solution Limited. All rights reserved.

---

## 🤝 Support

For support, please contact the development team at iDEAL Smart Solution Limited.

---

## 🎉 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)

---

## 📈 Status

✅ **Production Ready**

All features from the web dashboard have been successfully implemented on mobile. The app is ready for internal testing and production deployment.

---

**Made with ❤️ by iDEAL Smart Solution Limited**
