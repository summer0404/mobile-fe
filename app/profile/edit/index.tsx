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
    Switch, // Import Switch
    Platform,
    Alert,
    ActivityIndicator, // Added ActivityIndicator import
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { getMe, UserProfile as ApiUserProfile } from '@/services/authService'; // Import getMe and UserProfile

// Assuming FormInput component exists and is correctly pathed
import FormInput from '@/components/addTransaction/FormInput'; // Re-use FormInput or create a dedicated ProfileFormInput
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import InitialsAvatar from '@/components/profile/InitialsAvatar';

interface UserProfileData extends Omit<ApiUserProfile, 'id' | 'createdAt' | 'target'> {
    id: string;
    password?: string;
    profilePictureUrl?: string | null;
    pushNotificationsEnabled: boolean;
    // darkThemeEnabled: boolean; // This was in a previous version, ensure it's in initialFormState if kept
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
    pushNotificationsEnabled: true,
    // darkThemeEnabled: false, // Ensure consistency with UserProfileData
    target: '',
    createdAt: '',
};


const EditProfileScreen = () => {
    const router = useRouter();
    const [profileData, setProfileData] = useState<UserProfileData>(initialFormState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [selectedImage, setSelectedImage] = useState<string | null>(null); // For local image selection


    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            setError(null);
            console.log("Calling getMe()...");
            const response = await getMe(); // response is GetMeResponse
            console.log("getMe() response:", JSON.stringify(response, null, 2));

            if (response.success && response.data && typeof response.data === 'object') {
                // Ensure response.data has the necessary fields before trying to access them
                const apiData = response.data as ApiUserProfile; // Cast after verifying it's an object

                if (typeof apiData.id === 'undefined') {
                    console.error("API response.data is missing 'id' field:", apiData);
                    setError('Received incomplete profile data from server (missing ID).');
                    Alert.alert("Error", "Profile data from server is incomplete. Please try again.");
                    setIsLoading(false);
                    return;
                }

                setProfileData({
                    ...initialFormState,
                    id: String(apiData.id),
                    firstName: apiData.firstName || '', // Fallback to empty string if undefined
                    lastName: apiData.lastName || '',   // Fallback to empty string
                    email: apiData.email || '',       // Fallback to empty string
                    target: apiData.target,         // Already optional
                    createdAt: apiData.createdAt,     // Already optional
                    // Ensure other fields from initialFormState are preserved or updated if API provides them
                    pushNotificationsEnabled: initialFormState.pushNotificationsEnabled, // Or from apiData if available
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
                Alert.alert("Error", errorMessage + " Please try again.");
            }
            setIsLoading(false);
        };

        fetchUserProfile();
    }, []);



    const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    // ... (handleChoosePhoto, handleUpdateProfile placeholders)

    if (isLoading) {
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
            <GoBackToHomeHeader title="Edit Profile" />

            <View className='items-center justify-center pt-3 z-10'>
                <InitialsAvatar firstName={profileData.firstName} lastName={profileData.lastName} size={80} fontSize={30}/>
            </View>
            {/* Main Content Area with Form */}
            <View className="flex-1 bg-primary-200 rounded-t-[70] pt-2 -mt-10">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 150 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text className="text-lg font-psemibold text-textDark mb-4">Account Settings</Text>

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
                    {/* Toggle Switches */}
                    <View className="flex-row justify-between items-center py-3.5 px-1 mb-3">
                        <Text className="text-base text-textDark">Push Notifications</Text>
                        <Switch
                            trackColor={{ false: "#E0E0E0", true: "#C9A0DC" }}
                            thumbColor={profileData.pushNotificationsEnabled ? "#8A2BE2" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                            onValueChange={(val) => handleInputChange('pushNotificationsEnabled', val)}
                            value={profileData.pushNotificationsEnabled}
                        />
                    </View>
                    <TouchableOpacity
                        // onPress={handleUpdateProfile} // Add this back when implemented
                        className="bg-primary py-4 rounded-full items-center justify-center shadow-md"
                    >
                        <Text className="text-white font-psemibold text-base">Update Profile</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

        </SafeAreaView>
    );
};

export default EditProfileScreen;