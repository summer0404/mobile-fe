import { Tabs } from "expo-router";
import React from "react";
import { TabBar } from "@/components/TabBar";
import { View } from "react-native";

const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        // This ensures content renders under the tab bar
        headerShown: false,

      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: "Home",
        }} 
      />
      <Tabs.Screen name="analysis" options={{title: "Analysis"}} />
      <Tabs.Screen name="debt" options={{title: "Debt"}} />
      <Tabs.Screen name="add_transaction" options={{title: "Transaction"}} />
      <Tabs.Screen name="profile" options={{title: "Profile"}} />
    </Tabs>
  )
}

export default TabsLayout;

