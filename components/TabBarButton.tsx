import { View, Text, Pressable, GestureResponderEvent } from "react-native";
import React from "react";
import { icon } from "@/constants/icon";
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated'
import { useEffect } from "react";

interface TabBarButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  onLongPress: (event: GestureResponderEvent) => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
}

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
}: TabBarButtonProps) => {
    const scale = useSharedValue(0);
    useEffect(() => {
        scale.value = withSpring(typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused, 
        {duration: 350});
    },[scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0,1], [1,1.2]);

        const top = interpolate(scale.value, [0,1], [0,5]);

        return {
            transform: [{
                scale: scaleValue
            }],
            top
        }
    })

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={{ flex: 1 }}>
      <View className="justify-between items-center gap 5">
        <Animated.View style={animatedIconStyle}>
            {icon[routeName as keyof typeof icon]({
            color: isFocused ? "#fff" : "#000",
            })}
        </Animated.View>
        {/* <Text style={{ color: isFocused ? colors.primary : colors.text }}>
                    {typeof label === 'function'
                      ? label({
                        focused: isFocused,
                        color: isFocused ? colors.primary : colors.text,
                        position: 'below-icon',
                        children: route.name,
                      })
                      : label}
                  </Text> */}
      </View>
    </Pressable>
  );
};

export default TabBarButton;
