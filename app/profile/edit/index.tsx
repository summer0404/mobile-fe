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
    // Switch, // Import Switch - REMOVED
    Platform,
    Alert,
    ActivityIndicator,
    TextInput, // Added ActivityIndicator import
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { getMe, UserProfile as ApiUserProfile, UpdateUserProfileData, updateUser } from '@/services/authService'; // Import updateUser and UpdateUserProfileData
import FormInput from '@/components/addTransaction/FormInput'; // Re-use FormInput or create a dedicated ProfileFormInput
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import InitialsAvatar from '@/components/profile/InitialsAvatar';

interface UserProfileData extends Omit<ApiUserProfile, 'id' | 'createdAt' | 'target'> {
    id: string;
    password?: string;
    profilePictureUrl?: string | null;
    // pushNotificationsEnabled: boolean; // REMOVED
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
    // pushNotificationsEnabled: true, // REMOVED
    target: '',
    createdAt: '',
};


const EditProfileScreen = () => {
    const router = useRouter();
    const [profileData, setProfileData] = useState<UserProfileData>(initialFormState);
    const [isLoading, setIsLoading] = useState(true); // For initial data fetch
    const [isSubmitting, setIsSubmitting] = useState(false); // For update submission
    const [error, setError] = useState<string | null>(null);


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
                    Alert.alert("Error", "Profile data from server is incomplete. Please try again.");
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
                    // pushNotificationsEnabled: initialFormState.pushNotificationsEnabled, // Or from apiData if available - REMOVED
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

    const handleUpdateProfile = async () => {
        if (!profileData.id) {
            Alert.alert("Error", "User ID is missing. Cannot update profile.");
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
            // Only include password if it's been changed and is not empty
            ...(profileData.password && profileData.password.trim() !== '' && { password: profileData.password }),
        };

        // Optional: Remove undefined fields if your backend prefers that for PATCH
        // Object.keys(dataToUpdate).forEach(key =>
        //   (dataToUpdate as any)[key] === undefined && delete (dataToUpdate as any)[key]
        // );

        console.log("Attempting to update profile with:", dataToUpdate);
        const response = await updateUser(profileData.id, dataToUpdate);
        console.log("UpdateUser response:", JSON.stringify(response, null, 2));

        setIsSubmitting(false);

        if (response.success) {
            Alert.alert("Success", response.message || "Profile updated successfully!");
            // Optionally, update local state with response.data if it contains the full updated profile
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
            // router.back(); // Optionally navigate back
        } else {
            const errorMessage = response.message || response.error || "Could not update profile. Please try again.";
            setError(errorMessage);
            Alert.alert("Update Failed", errorMessage);
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
                     {/* {profileData.createdAt && (
                        <TextInput
                            label="Member Since"
                            value={new Date(profileData.createdAt).toLocaleDateString()} // Format date
                            className="bg-gray-200/70"
                            containerStyle="mb-4"
                        />
                    )} */}


                    {/* Toggle Switches - REMOVED PUSH NOTIFICATION TOGGLE */}
                    {/* 
                    <View className="flex-row justify-between items-center py-3.5 px-1 mb-3">
                        <Text className="text-base text-black">Push Notifications</Text>
                        <Switch
                            trackColor={{ false: "#E0E0E0", true: "#C9A0DC" }}
                            thumbColor={profileData.pushNotificationsEnabled ? "#8A2BE2" : "#f4f3f4"}
                            ios_backgroundColor="#E0E0E0"
                            onValueChange={(val) => handleInputChange('pushNotificationsEnabled', val)}
                            value={profileData.pushNotificationsEnabled}
                        />
                    </View> 
                    */}
                    <TouchableOpacity
                        onPress={handleUpdateProfile}
                        disabled={isSubmitting || isLoading} // Disable button while submitting or initial loading
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

        </SafeAreaView>
    );
};

export default EditProfileScreen;