import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNavBar from './components/BottomNavBar'; // Adjust the path if needed
import Home from './home';
// Placeholder screen components for each tab
const HomeScreen: React.FC = () => <Home></Home>;
const AnalyticsScreen: React.FC = () => <></>;
const RefreshScreen: React.FC = () => <></>;
const LayersScreen: React.FC = () => <></>;
const ProfileScreen: React.FC = () => <></>;

const Tab = createBottomTabNavigator();

const AppLayout: React.FC = () => {
  return (
      <Tab.Navigator
        tabBar={(props) => (
          <BottomNavBar
            onPressHome={() => props.navigation.navigate('Home')}
            onPressAnalytics={() => props.navigation.navigate('Analytics')}
            onPressRefresh={() => props.navigation.navigate('Refresh')}
            onPressLayers={() => props.navigation.navigate('Layers')}
            onPressProfile={() => props.navigation.navigate('Profile')}
          />
        )}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#7C3AED',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarStyle: { backgroundColor: '#7C3AED' },
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarStyle: { backgroundColor: '#7C3AED' },
          }}
        />
        <Tab.Screen
          name="Refresh"
          component={RefreshScreen}
          options={{
            tabBarStyle: { backgroundColor: '#7C3AED' },
          }}
        />
        <Tab.Screen
          name="Layers"
          component={LayersScreen}
          options={{
            tabBarStyle: { backgroundColor: '#7C3AED' },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarStyle: { backgroundColor: '#7C3AED' },
          }}
        />
      </Tab.Navigator>
  );
};

export default AppLayout;