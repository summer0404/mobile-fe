import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#00000',
          tabBarActiveBackgroundColor: '#7C3AED',
          tabBarStyle: {
            backgroundColor: '#c4B5FD',
            borderTopLeftRadius: 70,
            borderTopRightRadius: 70,
            height: 84,
          }

        }}
      >

      </Tabs>
    </>
  )
}

export default TabsLayout;

