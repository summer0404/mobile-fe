// controller/AuthController.ts
import { ToastAndroid } from 'react-native';
import { apiRequest } from '@/utils/commonUtil';
import { URL_BACKEND } from '../constants';
import { getValueFromAsyncStorage } from '@/utils/asyncStorage';

export interface SignUpFormData {
    email: string,
    firstName: string,
    lastName: string,
    password: string,  
}

// Updated interface to include email
export interface ChangePasswordFormData {
    email: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
}

/**
 * Gửi yêu cầu đăng ký một tài khoản mới
 */
export const handleSignUp = async (
    form: SignUpFormData,
    onSuccess: () => void,
    onError?: (err: any) => void
) => {
    try {
        const response = await apiRequest(`${URL_BACKEND}/auth/register`, 'POST', form);

        console.log('Add response:', response);
        // ToastAndroid.show('Debt added successfully!', ToastAndroid.SHORT);
        onSuccess();
    } catch (err) {
        console.error('Error signing up:', err);
        // ToastAndroid.show('Failed to add debt', ToastAndroid.SHORT);
        onError?.(err);
    }
};

/**
 * Gửi yêu cầu thay đổi mật khẩu
 * Now accepts email directly in the form data instead of from AsyncStorage
 */
export const handleChangePassword = async (
    form: ChangePasswordFormData,
    onSuccess: () => void,
    onError?: (err: any) => void
) => {
    try {
        const response = await apiRequest(`${URL_BACKEND}/auth/change-password`, 'POST', form);
        console.log('Change password response:', response);
         console.log('Change password response:', form);
        onSuccess();
    } catch (err) {
        console.error('Error changing password:', err);
        onError?.(err);
    }
};

