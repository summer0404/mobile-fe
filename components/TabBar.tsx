import { View, Platform, LayoutChangeEvent } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import TabBarButton from "./TabBarButton";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  const [dimension, setDimensions] = useState({ height: 20, width: 100 });


  const numberOfTabs = state.routes.length;
  const buttonWidth = (dimension.width - 2 * 16) / numberOfTabs; // Actual tab width
  const highlightWidth = buttonWidth - 10; 

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const focusedTab = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const top = interpolate(
      focusedTab.value === state.index ? 1 : 0,
      [0, 1],
      [0, 9]
    );

    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
      top,
    };
  });

  return (
    <View
      className="flex-row justify-between items-center bg-primary-100 rounded-t-full p-4"
      onLayout={onTabbarLayout}
    >
      <Animated.View 
      style={[animatedStyle, {
        position: "absolute",
        backgroundColor: '#7C3AED',
        borderRadius: 30,
        height: dimension.height - 15,
        width: highlightWidth,
        zIndex: 0,
        left: 0,
      }]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {

          focusedTab.value = index;

          const offset = 16 + index * buttonWidth + (buttonWidth - highlightWidth) / 2;
          tabPositionX.value = withSpring(offset, {
            duration: 1500,
          });

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? "#fff" : "#000"}
            label={typeof label === "function" ? route.name : label}
          />
          // <PlatformPressable

          //   key={route.name}
          //   href={buildHref(route.name, route.params)}
          //   accessibilityState={isFocused ? { selected: true } : {}}
          //   accessibilityLabel={options.tabBarAccessibilityLabel}
          //   testID={options.tabBarButtonTestID}
          //   onPress={onPress}
          //   onLongPress={onLongPress}
          //   style={{ flex: 1 }}
          // >
          //   <View
          //   className='justify-between items-center gap 5'
          //   >
          //     {icon[route.name as keyof typeof icon]({
          //       color: isFocused ? '#fff' : '#000'
          //     })}
          //     {/* <Text style={{ color: isFocused ? colors.primary : colors.text }}>
          //       {typeof label === 'function'
          //         ? label({
          //           focused: isFocused,
          //           color: isFocused ? colors.primary : colors.text,
          //           position: 'below-icon',
          //           children: route.name,
          //         })
          //         : label}
          //     </Text> */}
          //   </View>
          // </PlatformPressable>
        );
      })}
    </View>
  );
}
