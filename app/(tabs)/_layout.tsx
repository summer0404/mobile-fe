import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { TabBar } from "@/components/TabBar";

const TabsLayout = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Tabs 
      tabBar={(props: React.ComponentProps<typeof TabBar>) => {
      if (keyboardVisible) {
        return null;
      }
      return <TabBar {...props} />;
      }}
      screenOptions={{
      headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="analysis" options={{ title: "Analysis" }} />
      
      <Tabs.Screen 
      name="add_transaction" 
      options={{ 
        title: "Transaction",
      }} 
      />
      <Tabs.Screen name="debt" options={{ title: "Debt" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

export default TabsLayout;

