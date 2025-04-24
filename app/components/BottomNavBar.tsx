import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface BottomNavBarProps {
  onPressHome?: () => void;
  onPressAnalytics?: () => void;
  onPressRefresh?: () => void;
  onPressLayers?: () => void;
  onPressProfile?: () => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onPressHome,
  onPressAnalytics,
  onPressRefresh,
  onPressLayers,
  onPressProfile,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={onPressHome}>
        <Icon name="home" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={onPressAnalytics}>
        <Icon name="bar-chart-2" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={onPressRefresh}>
        <Icon name="refresh-cw" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={onPressLayers}>
        <Icon name="layers" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={onPressProfile}>
        <Icon name="user" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#C4B5FD',
    paddingVertical: 10,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    height: 80,
  },
  iconContainer: {
    padding: 10,
  },
});

export default BottomNavBar;