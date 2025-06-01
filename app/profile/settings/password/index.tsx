import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import FormInput from '@/components/addTransaction/FormInput';
import { changePassword, ChangePasswordData, getMe, UserProfile as ApiUserProfile } from '@/services/authService';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null); // State for user's email
  const [isLoadingEmail, setIsLoadingEmail] = useState(true); // State for loading email
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      setIsLoadingEmail(true);
      const response = await getMe();
      if (response.success && response.data?.email) {
        setUserEmail(response.data.email);
      } else {
        setError("Could not retrieve user email. Please try again.");
        Alert.alert("Error", "Could not retrieve your email to proceed with password change.");
        // Optionally, navigate back or disable the form
      }
      setIsLoadingEmail(false);
    };
    fetchUserEmail();
  }, []);


  const validatePasswords = () => {
    if (!currentPassword.trim()) {
      return "Current password is required.";
    }
    if (!newPassword.trim()) {
      return "New password is required.";
    }
    if (newPassword.length < 6) { // Example: minimum password length
      return "New password must be at least 6 characters long.";
    }
    if (!confirmNewPassword.trim()) {
      return "Please confirm your new password.";
    }
    if (newPassword !== confirmNewPassword) {
      return "New passwords do not match.";
    }
    return null; // No validation errors
  };

  const handleChangePassword = async () => {
    setError(null);
    const validationError = validatePasswords();
    if (validationError) {
      setError(validationError);
      Alert.alert("Validation Error", validationError);
      return;
    }

    if (!userEmail) {
      setError("User email is not available. Cannot change password.");
      Alert.alert("Error", "User email is not available. Please try again later.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const passwordPayload: ChangePasswordData = {
      email: userEmail,
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmNewPassword, // Backend expects this
    };

    try {
      console.log("Attempting to change password with payload:", passwordPayload);
      const response = await changePassword(passwordPayload);
      setIsSubmitting(false);

      if (response.success) {
        Alert.alert("Success", response.message || "Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        router.back(); // Go back to settings or profile
      } else {
        const errorMessage = response.message || response.error || "Failed to change password.";
        setError(errorMessage);
        Alert.alert("Error", errorMessage + " Please try again.");
      }
    } catch (apiError) {
      setIsSubmitting(false);
      console.error("Change password API error:", apiError);
      const message = (apiError instanceof Error) ? apiError.message : "An unexpected error occurred.";
      setError(message);
      Alert.alert("Error", message);
    }
  };

  if (isLoadingEmail) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content': 'light-content'} backgroundColor="#1A1A2E" />
      <GoBackToHomeHeader title='Change Password' />

      <View className="flex-1 bg-primary-200 rounded-t-[70] pt-16">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-lg font-psemibold text-textDark mb-6 text-center">
            Update Your Password
          </Text>

          {error && (
            <View className="bg-red-100 p-3 rounded-lg mb-4">
              <Text className="text-red-700 text-center">{error}</Text>
            </View>
          )}

          <FormInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter your current password"
            secureTextEntry={!showCurrentPassword}
            inputWrapperStyle="bg-white/70"
            containerStyle="mb-4"
            rightIcon={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <FormInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter your new password"
            secureTextEntry={!showNewPassword}
            inputWrapperStyle="bg-white/70"
            containerStyle="mb-4"
            rightIcon={showNewPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
          />

          <FormInput
            label="Confirm New Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Confirm your new password"
            secureTextEntry={!showConfirmNewPassword}
            inputWrapperStyle="bg-white/70"
            containerStyle="mb-6"
            rightIcon={showConfirmNewPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
          />

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={isSubmitting || isLoadingEmail} // Disable if email is still loading
            className={`py-4 rounded-full items-center justify-center shadow-md ${isSubmitting || isLoadingEmail ? 'bg-gray-400' : 'bg-primary'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-psemibold text-base">Change Password</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;