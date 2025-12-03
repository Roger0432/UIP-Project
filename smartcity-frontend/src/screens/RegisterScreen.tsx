import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
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

    const validateInputs = () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name');
            return false;
        }

        if (!email.includes('@')) {
            Alert.alert('Validation Error', 'Please enter a valid email');
            return false;
        }

        if (password.length < 6) {
            Alert.alert(
                'Validation Error',
                'Password must be at least 6 characters'
            );
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
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

                Alert.alert('Success', 'Account created successfully!');
            } else {
                Alert.alert('Error', response.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message ||
                    error.message ||
                    'Unable to register. Please try again.'
            );
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
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                    />

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
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
                    />

                    <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        mode="outlined"
                        style={styles.input}
                        disabled={loading}
                        editable={!loading}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                onPress={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            />
                        }
                    />

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
        marginBottom: 16,
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
});
