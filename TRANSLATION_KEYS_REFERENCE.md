# Translation Keys Reference

This guide shows all available translation keys organized by feature.

## How to Use Translations in Components

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('auth.login')}</Text>
  );
}
```

---

## Translation Keys Structure

### App
```
app.name - "SmartCity"
```

### Authentication (login.tsx)
```
auth.login - "Login" button text
auth.loggingIn - Loading state text
auth.email - Email field label
auth.password - Password field label
auth.loginSubtitle - Login form subtitle
auth.noAccount - "Don't have an account?" text
auth.registerHere - "Register here" link text
auth.loginHere - "Login here" link text
auth.or - "or" separator text

auth.errors.emailRequired - Email validation error
auth.errors.passwordRequired - Password validation error
auth.errors.invalidEmail - Invalid email format error
auth.errors.invalidCredentials - Wrong credentials error
```

### Registration (register.tsx)
```
register.title - Registration form title
register.fullName - Full name field label
register.email - Email field label
register.password - Password field label
register.confirmPassword - Confirm password field label
register.register - Register button text
register.creating - Registration loading state
register.alreadyHaveAccount - "Already have an account?" text

register.errors.nameRequired - Name validation error
register.errors.nameMin - Name minimum length error
register.errors.passwordMin - Password minimum length error
register.errors.passwordComplexity - Password complexity error
register.errors.confirmRequired - Confirm password required error
register.errors.passwordsMismatch - Passwords don't match error
```

### Reports List (reports.tsx)
```
reports.searchPlaceholder - Search input placeholder
reports.noReports - Empty state message
reports.tryAdjust - "Try adjusting filters" message
reports.noAvailable - No available reports message
reports.deleteTitle - Delete dialog title
reports.deleteConfirmMessage - Delete confirmation message
reports.deleteCancel - Cancel button in delete dialog
reports.deleteConfirm - Confirm delete button
reports.deleteError - Error message when deletion fails

reports.filters.all - "All" filter option
reports.filters.waiting - "Waiting" filter option
reports.filters.accepted - "Accepted" filter option
reports.filters.in_progress - "In Progress" filter option
reports.filters.finished - "Finished" filter option
reports.filters.denied - "Denied" filter option
reports.filters.hidden - "Hidden" filter option
```

### Report Card (report-card.tsx)
```
reportCard.waiting - "Waiting for acceptance" status
reportCard.in_progress - "In progress" status
reportCard.accepted - "Accepted" status
reportCard.denied - "Denied" status
reportCard.finished - "Finished" status
reportCard.hide - "Hide" button text
reportCard.unhide - "Show" / "Unhide" button text
reportCard.delete - "Delete" button text
```

### Report Detail (report-detail.tsx)
```
reportDetail.description - Description label
reportDetail.dateTime - Date and time label
reportDetail.location - Location label
reportDetail.reportedBy - "Reported by" label
reportDetail.accept - Accept button
reportDetail.deny - Deny button
reportDetail.markInProgress - Mark as in progress button
reportDetail.markFinished - Mark as finished button
```

### Create Report (create-report.tsx)
```
createReport.name - Name field label
createReport.phone - Phone number field label
createReport.mail - Email field label
createReport.title - Report title field label
createReport.description - Description field label
createReport.location - Location field label
createReport.selectLocation - "Select your location" button text
createReport.photos - Photos section label
createReport.createReport - Create report button
createReport.ok - OK button in dialogs
createReport.error - Error dialog title
createReport.successTitle - Success dialog title
createReport.successMessage - Success message after creation
createReport.fillRequired - "Fill all required fields" error
createReport.failedCreate - "Failed to create report" error

createReport.permissionTitle - Permission request dialog title
createReport.permissionPhotos - "Gallery permission is required!" message
createReport.permissionLocation - "Location permission is required!" message
```

### Profile (profile.tsx)
```
profile.phone - Phone number label
profile.mail - Email address label
profile.darkMode - Dark mode toggle label
profile.darkModeDesc - "Choose your theme" description
profile.workerMode - Worker mode toggle label
profile.workerModeDesc - "Enable if you're a city employee" description
profile.logout - Logout button text
profile.editProfile - Edit profile button
profile.cancel - Cancel button
profile.save - Save changes button
profile.language - Language selection label
profile.chooseLanguage - Language dialog title
profile.unnamed - "Unnamed user" fallback text
profile.logoutConfirmTitle - Logout confirmation dialog title
profile.logoutConfirmMessage - "Are you sure you want to logout?" message
```

### Navigation (app-navigator.tsx)
```
navigation.reports - Reports tab title
navigation.create - Create tab title
navigation.createReport - Create report tab subtitle
navigation.profile - Profile tab title
```

---

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| es | Spanish | Español |
| cs | Czech | Čeština |
| ca | Catalan | Català |
| fr | French | Français |
| de | German | Deutsch |
| it | Italian | Italiano |
| pt | Portuguese | Português |

---

## Adding a New Translation

1. **Create a new locale file** in `src/locales/{lang-code}.json`
2. **Copy the structure** from `en.json` and translate all values
3. **Import the file** in `src/i18n.ts`:
   ```typescript
   import {lang} from './locales/{lang-code}.json';
   ```
4. **Register the language** in the resources object:
   ```typescript
   resources: {
     // ... existing languages
     {lang-code}: { translation: {lang} },
   }
   ```

---

## Switching Languages at Runtime

```typescript
import i18n from '../i18n';

// Change to Spanish
await i18n.changeLanguage('es');

// Get current language
console.log(i18n.language); // e.g., "en"

// All components using useTranslation() will re-render automatically
```

---

## Best Practices

✅ **Always use keys** - Never hardcode strings that users see
✅ **Keep keys organized** - Use feature-based namespaces
✅ **Maintain consistency** - Same key structure across all languages
✅ **Test all languages** - Verify translations look good in UI
✅ **Use descriptive keys** - Make it clear what each translation is for
✅ **Handle missing translations** - i18n will show the key if translation is missing

---

## Example: Adding a New Feature's Translations

1. Add new namespace in `pt.json`:
```json
{
  "newFeature": {
    "title": "Nova Funcionalidade",
    "description": "Descrição aqui",
    "button": "Botão"
  }
}
```

2. Add to all other language files with same keys

3. In component:
```typescript
const { t } = useTranslation();
return <Text>{t('newFeature.title')}</Text>;
```

That's it! The translation will work across all 8 languages automatically.
