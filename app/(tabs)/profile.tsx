import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { theme } from '@/utils/theme';

const Profile = () => {
  return (
    <View>
      <Text>Profile</Text>
      <TouchableOpacity
        onPress={() => {
          router.push('/profile/change-password');
        }}
        style={{ padding: 10, backgroundColor: theme.colors.violet600, borderRadius: 5 }}>
        <Text style={{ color: '#fff' }}>Change Password</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile
