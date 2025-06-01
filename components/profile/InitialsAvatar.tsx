import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

interface InitialsAvatarProps {
  firstName?: string;
  lastName?: string;
  size?: number;
  fontSize?: number;
  textColor?: string;
}

// Define a palette of contrasting background colors
const colorPalette = [
  '#FF6B6B', // Light Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Pale Cyan
  '#F7B7A3', // Light Apricot
  '#A0E7E5', // Light Cyan
  '#B4F8C8', // Light Green
];

// Function to get a consistent color from the palette based on a string (e.g., initials)
const getColorFromPalette = (str: string) => {
  if (!str || str.length === 0) {
    return colorPalette[0]; // Default color if string is empty
  }
  // Simple hash function to get an index
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  firstName,
  lastName,
  size = 48, // Corresponds to w-12 h-12 (12 * 4 = 48)
  fontSize = 18, // Adjust as needed
  textColor = '#FFFFFF', // Default to white text
}) => {
  const initials = useMemo(() => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }, [firstName, lastName]);

  const backgroundColor = useMemo(() => {
    // Use the initials (or a combination of names) to pick a color
    // This ensures the color is consistent for the same user
    return getColorFromPalette(initials || `${firstName}${lastName}`);
  }, [initials, firstName, lastName]);

  if (!initials) {
    // Fallback for when no initials can be generated
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#CCCCCC', // Default grey
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: textColor, fontSize: fontSize, fontWeight: 'bold' }}>?</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: textColor, fontSize: fontSize, fontWeight: 'bold' }}>
        {initials}
      </Text>
    </View>
  );
};

export default InitialsAvatar;