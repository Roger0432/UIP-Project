# SmartCity App - Getting Started Guide

## 📋 Prerequisites

Before running the app, ensure you have:
- Node.js (v16 or higher)
- npm (v8 or higher)
- Expo CLI installed globally: `npm install -g expo-cli`
- Your device or emulator ready

---

## 🚀 Installation & Setup

### Step 1: Navigate to Frontend Directory
```powershell
cd c:\Users\roger\Documents\GitHub\UIP-Project\smartcity-frontend
```

### Step 2: Install Dependencies
First, install all required npm packages including i18next:
```powershell
npm install
```

This will install:
- React Native essentials
- `i18next` - Internationalization framework
- `react-i18next` - React bindings for i18next
- react-native-paper - UI component library
- React Navigation - Navigation library
- And all other project dependencies

### Step 3: Verify Installation
Check that dependencies were installed correctly:
```powershell
npm list i18next react-i18next
```

You should see:
```
smartcity-frontend@1.0.0
├── i18next@...
└── react-i18next@...
```

---

## 🎬 Running the App

### Option 1: Expo Web (Recommended for Testing)
```powershell
npm start
```

Then:
1. Press `w` to open in web browser
2. The app will load in your default browser at `http://localhost:19006`
3. Open browser DevTools (F12) if you want to see console logs

### Option 2: Expo Go (Mobile Device)
```powershell
npm start
```

Then:
1. Press `i` for iOS simulator (macOS only) or `a` for Android emulator
2. Alternatively, scan the QR code with Expo Go app on your phone

### Option 3: Development Server Only
```powershell
npm start -- --web
```

---

## 🌍 Testing the Multilingual Features

### 1. **Access Profile Screen**
   - Click on the "Profile" tab (bottom right)

### 2. **Open Language Selector**
   - Scroll to "Language" option
   - Tap on the language option or the chevron icon

### 3. **Switch Languages**
   - A dialog will appear showing all 8 languages with flag emojis:
     - 🇬🇧 English
     - 🇪🇸 Español
     - 🇨🇿 Čeština
     - 🇪🇸 Català
     - 🇫🇷 Français
     - 🇩🇪 Deutsch
     - 🇮🇹 Italiano
     - 🇵🇹 Português
   - Select any language with the RadioButton
   - The app content updates immediately!

### 4. **Verify Translations Across Screens**
   - Go to Reports screen - all labels in selected language
   - Go to Create Report - form labels in selected language
   - Go to Profile - all settings in selected language

---

## 🛠️ Troubleshooting

### Issue: `npm start` fails with "i18next not found"
**Solution:** Run `npm install i18next react-i18next`

### Issue: Port 19006 already in use
**Solution:** Kill the process or use a different port:
```powershell
npm start -- --port 19007
```

### Issue: Translations show as keys like "auth.login"
**Solution:** This means i18next isn't initialized properly. Check:
1. `src/i18n.ts` imports all 8 language files
2. `App.tsx` imports i18n before rendering
3. Your component uses `const { t } = useTranslation()`

### Issue: Language selector shows old language list
**Solution:** Clear browser cache and restart:
```powershell
npm start -- --reset-cache
```

---

## 📁 Project Structure

```
smartcity-frontend/
├── src/
│   ├── i18n.ts                    ← i18n configuration
│   ├── locales/                   ← Translation files
│   │   ├── en.json               ← English
│   │   ├── es.json               ← Spanish
│   │   ├── cs.json               ← Czech
│   │   ├── ca.json               ← Catalan
│   │   ├── fr.json               ← French
│   │   ├── de.json               ← German
│   │   ├── it.json               ← Italian
│   │   └── pt.json               ← Portuguese
│   ├── screens/
│   │   ├── LoginScreen.tsx        ← Uses translations
│   │   ├── RegisterScreen.tsx     ← Uses translations
│   │   ├── ReportsScreen.tsx      ← Uses translations
│   │   ├── ReportDetailScreen.tsx ← Uses translations
│   │   ├── CreateReportScreen.tsx ← Uses translations
│   │   └── ProfileScreen.tsx      ← Language selector here
│   ├── components/
│   │   └── ReportCard.tsx         ← Uses translations
│   └── navigation/
│       └── AppNavigator.tsx       ← Uses translations
├── App.tsx                        ← i18n initialization
├── package.json                   ← Dependencies
└── tsconfig.json                  ← TypeScript config
```

---

## 🔧 Development Workflow

### Adding a New Translation Key

1. **Add to all locale files:**
   - Open `src/locales/en.json`
   - Add your new key under the appropriate namespace
   - Copy the same structure to es.json, cs.json, ca.json, fr.json, de.json, it.json, pt.json

2. **Use in component:**
   ```typescript
   import { useTranslation } from 'react-i18next';
   
   export function MyComponent() {
     const { t } = useTranslation();
     return <Text>{t('namespace.key')}</Text>;
   }
   ```

### Adding a New Language

1. **Create new locale file:** `src/locales/{lang-code}.json`
2. **Copy structure from:** `src/locales/en.json`
3. **Update `src/i18n.ts`:**
   ```typescript
   import {lang} from './locales/{lang-code}.json';
   
   resources: {
     // ...
     {lang-code}: { translation: {lang} },
   }
   ```
4. **Update language list in `ProfileScreen.tsx`:**
   ```typescript
   const languages = [
     // ... existing languages
     { code: '{lang-code}', label: 'Language Name', flag: '🏁' },
   ];
   ```

---

## 🧪 Testing Checklist

- [ ] All 8 languages load without errors
- [ ] Language switching works instantly
- [ ] All screens display correct translations
- [ ] Login form validates with correct error messages
- [ ] Registration form shows translated validation errors
- [ ] Reports screen search placeholder is translated
- [ ] Profile screen settings are all translated
- [ ] Create report form all fields are translated
- [ ] Navigation tabs are labeled correctly
- [ ] Language preference persists (if implemented with AsyncStorage)

---

## 📚 Additional Resources

- **i18next Documentation:** https://www.i18next.com/
- **react-i18next Hooks:** https://react.i18next.com/latest/using-with-hooks
- **React Native Paper Components:** https://callstack.github.io/react-native-paper/
- **Expo Documentation:** https://docs.expo.dev/

---

## 💡 Tips & Best Practices

✅ Always use translation keys instead of hardcoding strings
✅ Keep translation files organized with clear namespaces
✅ Test all languages before deployment
✅ Use meaningful key names (e.g., `auth.login` not `btn1`)
✅ Keep translations consistent across languages
✅ Use `i18n.changeLanguage()` to switch languages at runtime
✅ Component with `useTranslation()` hook auto-update when language changes

---

## 🚢 Deployment

When ready to deploy:

1. **Build for web:**
   ```powershell
   npm run build
   ```

2. **Build for mobile:**
   ```powershell
   eas build --platform all
   eas submit
   ```

3. **Publish to Expo:**
   ```powershell
   eas publish
   ```

All translations will be included automatically!

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console logs (browser DevTools → Console tab)
2. Verify all dependencies are installed: `npm list`
3. Restart the development server: `npm start -- --reset-cache`
4. Check that `i18n.ts` has all 8 languages imported
5. Ensure `App.tsx` imports i18n at the top

---

**Version:** 1.0.0 - Multilingual Implementation Complete
**Last Updated:** 2024
**Status:** Ready for Development & Testing ✅
