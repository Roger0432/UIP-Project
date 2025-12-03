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
    ActivityIndicator,
} from 'react-native-paper';
import { useUser } from '../context/UserContext';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }: any) {
    const theme = useTheme();
    const { setUser, setToken, setIsAuthenticated } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Validation Error', 'Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Validation Error', 'Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login(email, password);
            
            if (response.token && response.user) {
                setToken(response.token);
                setUser(response.user);
                setIsAuthenticated(true);
                
                // Reset form
                setEmail('');
                setPassword('');
                
                Alert.alert('Success', 'Logged in successfully!');
            } else {
                Alert.alert('Error', response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert(
                'Login Failed',
                error.response?.data?.message || error.message || 'Unable to login. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGuestAccess = async () => {
        // Create anonymous user
        const anonymousUser = {
            id: `guest_${Date.now()}`,
            name: 'Guest',
            email: `guest_${Date.now()}@example.com`,
            role: 'citizen',
        };
        setUser(anonymousUser);
        setIsAuthenticated(false);
        setToken(null);
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
                        Login to your account
                    </Text>
                </View>

                <View style={styles.formContainer}>
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

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.loginButton}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
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
                            or
                        </Text>
                        <View
                            style={[
                                styles.divider,
                                { backgroundColor: theme.colors.outline },
                            ]}
                        />
                    </View>

                    <Button
                        mode="outlined"
                        onPress={handleGuestAccess}
                        style={styles.guestButton}
                        disabled={loading}
                    >
                        Continue as Guest
                    </Button>
                </View>

                <View style={styles.registerContainer}>
                    <Text
                        style={[
                            styles.registerText,
                            { color: theme.colors.secondary },
                        ]}
                    >
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('Register')
                        }
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
                            Register here
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
    loginButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    guestButton: {
        paddingVertical: 6,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
