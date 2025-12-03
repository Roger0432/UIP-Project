// UserContext.tsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

type UserContextType = {
    isWorker: boolean;
    setIsWorker: (v: boolean) => void;
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    isAuthenticated: boolean;
    setIsAuthenticated: (v: boolean) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    ensureAnonymousUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    isWorker: false,
    setIsWorker: () => {},
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    token: null,
    setToken: () => {},
    ensureAnonymousUser: async () => {},
    logout: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [isWorker, setIsWorkerState] = useState(false);
    const [user, setUserState] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticatedState] = useState(false);
    const [token, setTokenState] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const v = await AsyncStorage.getItem('user_is_worker');
            if (v !== null) setIsWorkerState(v === 'true');
            
            const storedToken = await AsyncStorage.getItem('auth_token');
            const storedUser = await AsyncStorage.getItem('user_data');
            
            if (storedToken) {
                setTokenState(storedToken);
                setIsAuthenticatedState(true);
            }
            
            if (storedUser) {
                try {
                    setUserState(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
        };
        load();
    }, []);

    const setIsWorker = (v: boolean) => {
        setIsWorkerState(v);
        AsyncStorage.setItem('user_is_worker', v.toString());
    };

    const setUser = (userData: UserProfile | null) => {
        setUserState(userData);
        if (userData) {
            AsyncStorage.setItem('user_data', JSON.stringify(userData));
        } else {
            AsyncStorage.removeItem('user_data');
        }
    };

    const setIsAuthenticated = (v: boolean) => {
        setIsAuthenticatedState(v);
    };

    const setToken = (authToken: string | null) => {
        setTokenState(authToken);
        if (authToken) {
            AsyncStorage.setItem('auth_token', authToken);
        } else {
            AsyncStorage.removeItem('auth_token');
        }
    };

    const ensureAnonymousUser = async () => {
        if (!user?.id) {
            const anonymousUser: UserProfile = {
                id: `anonymous_${Date.now()}`,
                name: 'Anonymous',
                email: `anonymous_${Date.now()}@example.com`,
                role: 'citizen',
            };
            setUser(anonymousUser);
        }
    };

    const logout = async () => {
        setUserState(null);
        setIsAuthenticatedState(false);
        setTokenState(null);
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
    };

    return (
        <UserContext.Provider
            value={{
                isWorker,
                setIsWorker,
                user,
                setUser,
                isAuthenticated,
                setIsAuthenticated,
                token,
                setToken,
                ensureAnonymousUser,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
