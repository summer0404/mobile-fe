import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToAsyncStorage = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`[AsyncStorage] Failed to save ${key}:`, error);
    }
};

export const getValueFromAsyncStorage = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`[AsyncStorage] Failed to read ${key}:`, error);
        return null;
    }
};
