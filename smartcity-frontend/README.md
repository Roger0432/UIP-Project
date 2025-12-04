# SmartCity Frontend

## Description
This is the mobile client for the SmartCity application. It is built using React Native and Expo. It allows citizens to report urban incidents, view them on a map, and manage their profile.

## Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Expo Go app on your physical device (Android/iOS) OR Android Studio/Xcode emulator.

## External Libraries
- [expo](https://expo.dev/): Framework for React Native
- [react & react-native](https://reactnative.dev/): Core libraries for building the UI
- [axios](https://axios-http.com/): Promise based HTTP client for the browser and node.js
- [@react-navigation/native & @react-navigation/bottom-tabs](https://reactnavigation.org/): Routing and navigation
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/): Geolocation access
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/): Access to camera and photo library
- [react-native-maps](https://github.com/react-native-maps/react-native-maps): Map components for iOS and Android
- [react-native-paper](https://callstack.github.io/react-native-paper/): Material Design for React Native
- [react-hook-form](https://react-hook-form.com/): Form validation

## Installation & Setup
1. Navigate to the frontend directory:
   ```bash
   cd smartcity-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API Connection:
   Open `src/services/api.ts` and ensure the `API_URL` points to your running backend.
   
   Example:
   ```typescript
   export const API_URL = "http://<YOUR_LOCAL_IP>:5000/api";
   ```
   *(Note: If testing on a physical device, use your computer's local network IP address, not localhost)*

## Running the Application
1. Start the Expo development server:
   ```bash
   npx expo start
   ```

2. Launch on a device:
   - **Physical Device:** Scan the QR code displayed in the terminal using the Expo Go app (Android) or Camera app (iOS).
   - **Emulator:** Press `a` for Android emulator or `i` for iOS simulator in the terminal window.

## Troubleshooting
- If you cannot connect to the backend, ensure both devices are on the same Wi-Fi network and that your firewall allows connections to port 5000.
