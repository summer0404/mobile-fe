import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { TabBar } from "@/components/TabBar";

const TabsLayout = () => {
  return (
    <>
    <Tabs
    tabBar={props =>  <TabBar {...props} /> }>
      <Tabs.Screen name="home" options={{title: "Home"}} />
      <Tabs.Screen name="analysis" options={{title: "Analysis"}} />
      <Tabs.Screen name="debt" options={{title: "Debt"}} />
      <Tabs.Screen name="add_transaction" options={{title: "Transaction"}} />
      <Tabs.Screen name="profile" options={{title: "Profile"}} />

    </Tabs>
    </>
  )
}

export default TabsLayout;

