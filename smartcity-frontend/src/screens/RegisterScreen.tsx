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

export default function RegisterScreen({ navigation }: any) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { setUser, setToken, setIsAuthenticated } = useUser();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Errors per camp
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [formError, setFormError] = useState('');

    const validateInputs = () => {
        let isValid = true;

        // Nom obligatori i mínim 2 caràcters
        if (!name.trim()) {
            setNameError(t('register.errors.nameRequired'));
            isValid = false;
        } else if (name.trim().length < 2) {
            setNameError(t('register.errors.nameMin'));
            isValid = false;
        }

        // Email vàlid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError(t('auth.errors.emailRequired'));
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError(t('auth.errors.invalidEmail'));
            isValid = false;
        }

        // Password mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        if (!password) {
            setPasswordError(t('auth.errors.passwordRequired'));
            isValid = false;
        } else if (password.length < 8) {
            setPasswordError(t('register.errors.passwordMin'));
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            setPasswordError(t('register.errors.passwordComplexity'));
            isValid = false;
        }

        // Confirmació de password
        if (!confirmPassword) {
            setConfirmPasswordError(t('register.errors.confirmRequired'));
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(t('register.errors.passwordsMismatch'));
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async () => {
        // Reset errors
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setFormError('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.register(email, password, name);

            if (response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                setIsAuthenticated(true);

                // Reset form
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setFormError(response.message || 'Registration error');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            if (error.response?.status === 409 || error.response?.status === 400) {
                // Email ja existeix o error de validació
                setFormError('This email is already registered');
            } else if (error.response?.status === 422) {
                setFormError('Invalid data');
            } else {
                setFormError(
                    error.response?.data?.message ||
                    'Could not create account. Try again.'
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
                        {t('register.title')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        label={t('register.fullName')}
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (nameError) setNameError('');
                        }}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                        error={!!nameError}
                    />
                    {nameError ? (
                        <Text style={styles.errorText}>{nameError}</Text>
                    ) : null}

                    <TextInput
                        label={t('register.email')}
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
                        <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}

                    <TextInput
                        label={t('register.password')}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                            if (confirmPassword && text !== confirmPassword) {
                                setConfirmPasswordError(t('register.errors.passwordsMismatch'));
                            } else if (confirmPasswordError) {
                                setConfirmPasswordError('');
                            }
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
                        <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}

                    <TextInput
                        label={t('register.confirmPassword')}
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (confirmPasswordError) setConfirmPasswordError('');
                            if (password && text !== password) {
                                setConfirmPasswordError(t('register.errors.passwordsMismatch'));
                            }
                        }}
                        secureTextEntry={!showConfirmPassword}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        }
                        error={!!confirmPasswordError}
                    />
                    {confirmPasswordError ? (
                        <Text style={styles.errorText}>{confirmPasswordError}</Text>
                    ) : null}

                    {formError ? (
                        <Text style={[styles.errorText, styles.formError]}>
                            {formError}
                        </Text>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        style={styles.registerButton}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? t('register.creating') : t('register.register')}
                    </Button>
                </View>

                <View style={styles.loginContainer}>
                        <Text
                            style={[
                                styles.loginText,
                                { color: theme.colors.secondary },
                            ]}
                        >
                            {t('register.alreadyHaveAccount')}{' '}
                        </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.loginLink,
                                {
                                    color: theme.colors.primary,
                                },
                            ]}
                        >
                            {t('auth.loginHere')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    formContainer: {
        marginBottom: 30,
    },
    input: {
        marginBottom: 8,
    },
    registerButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
    formError: {
        textAlign: 'center',
        marginBottom: 16,
    },
});
