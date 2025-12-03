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
import { useUser } from '../context/UserContext';
import { authAPI } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
    const theme = useTheme();
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
            setNameError('El nom és obligatori');
            isValid = false;
        } else if (name.trim().length < 2) {
            setNameError('El nom ha de tenir almenys 2 caràcters');
            isValid = false;
        }

        // Email vàlid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('El correu és obligatori');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Introdueix un correu electrònic vàlid');
            isValid = false;
        }

        // Password mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        if (!password) {
            setPasswordError('La contrasenya és obligatòria');
            isValid = false;
        } else if (password.length < 8) {
            setPasswordError('La contrasenya ha de tenir almenys 8 caràcters');
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            setPasswordError('Mínim 1 majúscula, 1 minúscula i 1 número');
            isValid = false;
        }

        // Confirmació de password
        if (!confirmPassword) {
            setConfirmPasswordError('Has de confirmar la contrasenya');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Les contrasenyes no coincideixen');
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
                setFormError(response.message || 'Error en el registre');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            if (error.response?.status === 409 || error.response?.status === 400) {
                // Email ja existeix o error de validació
                setFormError('Aquest correu ja està registrat');
            } else if (error.response?.status === 422) {
                setFormError('Dades invàlides');
            } else {
                setFormError(
                    error.response?.data?.message ||
                    'No s’ha pogut crear el compte. Torna-ho a provar.'
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
                        SmartCity
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
                        Create your account
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        label="Full Name"
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
                        label="Email"
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
                        label="Password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                            if (confirmPassword && text !== confirmPassword) {
                                setConfirmPasswordError('Les contrasenyes no coincideixen');
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
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (confirmPasswordError) setConfirmPasswordError('');
                            if (password && text !== password) {
                                setConfirmPasswordError('Les contrasenyes no coincideixen');
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
                        {loading ? 'Creating account...' : 'Register'}
                    </Button>
                </View>

                <View style={styles.loginContainer}>
                    <Text
                        style={[
                            styles.loginText,
                            { color: theme.colors.secondary },
                        ]}
                    >
                        Already have an account?{' '}
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
                            Login here
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
