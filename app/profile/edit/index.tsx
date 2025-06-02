// app/profile/edit.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { getMe, UserProfile as ApiUserProfile, UpdateUserProfileData, updateUser } from '@/services/authService';
import FormInput from '@/components/addTransaction/FormInput';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import InitialsAvatar from '@/components/profile/InitialsAvatar';
import CustomAlert, { AlertButton } from '@/components/Alert';

interface UserProfileData extends Omit<ApiUserProfile, 'id' | 'createdAt' | 'target'> {
    id: string;
    password?: string;
    profilePictureUrl?: string | null;
    target?: string;
    createdAt?: string;
}

const initialFormState: UserProfileData = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profilePictureUrl: null,
    target: '',
    createdAt: '',
};

const EditProfileScreen = () => {
    const router = useRouter();
    const [profileData, setProfileData] = useState<UserProfileData>(initialFormState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // CustomAlert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

    const showCustomAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info',
        buttons: AlertButton[] = []
    ) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertButtons(buttons);
        setAlertVisible(true);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            setError(null);
            console.log("Calling getMe()...");
            const response = await getMe();
            console.log("getMe() response:", JSON.stringify(response, null, 2));

            if (response.success && response.data && typeof response.data === 'object') {
                const apiData = response.data as ApiUserProfile;

                if (typeof apiData.id === 'undefined') {
                    console.error("API response.data is missing 'id' field:", apiData);
                    setError('Received incomplete profile data from server (missing ID).');
                    showCustomAlert(
                        "Error",
                        "Profile data from server is incomplete. Please try again.",
                        'error',
                        [
                            {
                                text: 'OK',
                                onPress: () => setAlertVisible(false),
                                style: 'primary'
                            }
                        ]
                    );
                    setIsLoading(false);
                    return;
                }

                setProfileData({
                    ...initialFormState,
                    id: String(apiData.id),
                    firstName: apiData.firstName || '',
                    lastName: apiData.lastName || '',
                    email: apiData.email || '',
                    target: apiData.target,
                    createdAt: apiData.createdAt,
                });
            } else {
                let errorMessage = 'Failed to fetch profile data.';
                if (response.message) {
                    errorMessage = response.message;
                } else if (!response.data) {
                    errorMessage = 'No profile data received from server.';
                } else if (typeof response.data !== 'object') {
                    errorMessage = 'Received invalid profile data format from server.';
                }
                console.error("Error fetching profile or invalid data:", errorMessage, "Full response:", response);
                setError(errorMessage);
                showCustomAlert(
                    "Error",
                    errorMessage + " Please try again.",
                    'error',
                    [
                        {
                            text: 'OK',
                            onPress: () => setAlertVisible(false),
                            style: 'primary'
                        }
                    ]
                );
            }
            setIsLoading(false);
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateProfile = async () => {
        if (!profileData.id) {
            showCustomAlert(
                "Error",
                "User ID is missing. Cannot update profile.",
                'error',
                [
                    {
                        text: 'OK',
                        onPress: () => setAlertVisible(false),
                        style: 'primary'
                    }
                ]
            );
            return;
        }
        if (isSubmitting) return; // Prevent multiple submissions

        setIsSubmitting(true);
        setError(null); // Clear previous errors

        const dataToUpdate: UpdateUserProfileData = {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            target: profileData.target,
        };

        console.log("Attempting to update profile with:", dataToUpdate);
        const response = await updateUser(profileData.id, dataToUpdate);
        console.log("UpdateUser response:", JSON.stringify(response, null, 2));

        setIsSubmitting(false);

        if (response.success) {
            showCustomAlert(
                "Success",
                response.message || "Profile updated successfully!",
                'success',
                [
                    {
                        text: 'OK',
                        onPress: () => setAlertVisible(false),
                        style: 'primary'
                    }
                ]
            );
            
            // Update local state with response data
            if (response.data) {
                setProfileData(prev => ({
                    ...prev,
                    firstName: response.data?.firstName || prev.firstName,
                    lastName: response.data?.lastName || prev.lastName,
                    email: response.data?.email || prev.email,
                    target: response.data?.target || prev.target,
                    password: '', // Clear password field after successful update
                }));
            } else {
                // If no data in response, just clear password
                setProfileData(prev => ({ ...prev, password: '' }));
            }
        } else {
            const errorMessage = response.message || response.error || "Could not update profile. Please try again.";
            setError(errorMessage);
            showCustomAlert(
                "Update Failed",
                errorMessage,
                'error',
                [
                    {
                        text: 'OK',
                        onPress: () => setAlertVisible(false),
                        style: 'primary'
                    }
                ]
            );
        }
    };

    if (isLoading && !profileData.id) { // Show full screen loader only if no data is present yet
        return (
            <SafeAreaView className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-2">Loading Profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-primary">
            <StatusBar />
            <View className="p-6">
                <GoBackToHomeHeader title="Edit Profile" />
            </View>
            <View className='items-center justify-center pt-3 z-10'>
                <InitialsAvatar firstName={profileData.firstName} lastName={profileData.lastName} size={80} fontSize={30} />
            </View>
            {/* Main Content Area with Form */}
            <View className="flex-1 bg-primary-200 rounded-t-[70] pt-2 -mt-10">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 150 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text className="text-lg font-psemibold text-black mb-4">Account Settings</Text>

                    <FormInput
                        label="First Name"
                        value={profileData.firstName}
                        onChangeText={(val) => handleInputChange('firstName', val)}
                        placeholder="Enter your first name"
                        inputWrapperStyle="bg-white/70"
                        containerStyle="mb-4"
                    />
                    <FormInput
                        label="Last Name"
                        value={profileData.lastName}
                        onChangeText={(val) => handleInputChange('lastName', val)}
                        placeholder="Enter your last name"
                        inputWrapperStyle="bg-white/70"
                        containerStyle="mb-4"
                    />
                    <FormInput
                        label="Email Address"
                        value={profileData.email}
                        onChangeText={(val) => handleInputChange('email', val)}
                        placeholder="Enter your email address"
                        keyboardType="email-address"
                        inputWrapperStyle="bg-white/70"
                        containerStyle="mb-4"
                    />

                    {/* Display Target and CreatedAt if needed, likely non-editable */}
                    {profileData.target !== undefined && ( // Check for undefined to show even if empty string
                        <FormInput
                            label="Target"
                            value={profileData.target || ''} // Display empty string if null/undefined
                            onChangeText={(val) => handleInputChange('target', val)} // Allow editing target
                            placeholder="Enter your target amount"
                            keyboardType="numeric"
                            inputWrapperStyle="bg-white/70"
                            containerStyle="mb-4"
                        />
                    )}

                    <TouchableOpacity
                        onPress={handleUpdateProfile}
                        disabled={isSubmitting || isLoading}
                        className={`py-4 rounded-full items-center justify-center shadow-md ${isSubmitting || isLoading ? 'bg-gray-400' : 'bg-primary'}`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-psemibold text-base">Update Profile</Text>
                        )}
                    </TouchableOpacity>
                    {error && <Text className="text-red-500 text-center mt-4">{error}</Text>}
                </ScrollView>
            </View>

            {/* Custom Alert */}
            <CustomAlert
                isVisible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                buttons={alertButtons}
                onDismiss={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
};

export default EditProfileScreen;