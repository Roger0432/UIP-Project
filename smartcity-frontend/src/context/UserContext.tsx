// UserContext.tsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
    isWorker: boolean;
    setIsWorker: (v: boolean) => void;
};

const UserContext = createContext<UserContextType>({
    isWorker: false,
    setIsWorker: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [isWorker, setIsWorkerState] = useState(false);

    useEffect(() => {
        const load = async () => {
            const v = await AsyncStorage.getItem('user_is_worker');
            if (v !== null) setIsWorkerState(v === 'true');
        };
        load();
    }, []);

    const setIsWorker = (v: boolean) => {
        setIsWorkerState(v);
        AsyncStorage.setItem('user_is_worker', v.toString());
    };

    return (
        <UserContext.Provider value={{ isWorker, setIsWorker }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
