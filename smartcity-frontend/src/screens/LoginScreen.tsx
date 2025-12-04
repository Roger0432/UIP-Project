import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {
    TextInput,
    Button,
    useTheme,
    Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }: any) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { setUser, setToken, setIsAuthenticated } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formError, setFormError] = useState('');

    const handleLogin = async () => {
        setEmailError('');
        setPasswordError('');
        setFormError('');

        if (!email || !password) {
            if (!email) setEmailError(t('auth.errors.emailRequired'));
            if (!password) setPasswordError(t('auth.errors.passwordRequired'));
            return;
        }

        if (!email.includes('@')) {
            setEmailError(t('auth.errors.invalidEmail'));
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login(email, password);
            // Se asume que response = { token, user: { ... , role?: 'worker' | 'citizen' } }

            if (response.token && response.user) {
                setToken(response.token);
                setUser(response.user);      // aquí se deriva isWorker según user.role
                setIsAuthenticated(true);

                setEmail('');
                setPassword('');
                // Navegas a donde toque (por ejemplo, raíz de la app) si aún no lo haces fuera
            } else {
                setFormError(response.message || t('auth.errors.invalidCredentials'));
            }
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response?.status === 401) {
                setFormError(t('auth.errors.invalidCredentials'));
            } else {
                setFormError(
                    error.response?.data?.message ||
                    t('auth.errors.invalidCredentials')
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    <Text style={[styles.title, { color: theme.colors.primary }]}>
                        {t('app.name')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
                        {t('auth.loginSubtitle')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        label={t('auth.email')}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                        error={!!emailError}
                    />
                    {emailError ? (
                        <Text style={{ color: 'red', marginBottom: 8 }}>{emailError}</Text>
                    ) : null}

                    <TextInput
                        label={t('auth.password')}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        secureTextEntry={!showPassword}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        error={!!passwordError}
                    />
                    {passwordError ? (
                        <Text style={{ color: 'red', marginBottom: 8 }}>{passwordError}</Text>
                    ) : null}

                    {formError ? (
                        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>
                            {formError}
                        </Text>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.loginButton}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? t('auth.loggingIn') : t('auth.login')}
                    </Button>

                    <View style={styles.dividerContainer}>
                        <View
                            style={[
                                styles.divider,
                                { backgroundColor: theme.colors.outline },
                            ]}
                        />
                        <Text
                            style={[
                                styles.dividerText,
                                { color: theme.colors.secondary },
                            ]}
                        >
                            {t('auth.or')}
                        </Text>
                        <View
                            style={[
                                styles.divider,
                                { backgroundColor: theme.colors.outline },
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.registerContainer}>
                    <Text
                        style={[
                            styles.registerText,
                            { color: theme.colors.secondary },
                        ]}
                    >
                            {t('auth.noAccount')}{' '}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.registerLink,
                                {
                                    color: theme.colors.primary,
                                },
                            ]}
                        >
                            {t('auth.registerHere')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    headerContainer: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16 },
    formContainer: {},
    input: { marginBottom: 16 },
    loginButton: { marginTop: 8, paddingVertical: 6 },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 10, fontSize: 14 },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: { fontSize: 14 },
    registerLink: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
