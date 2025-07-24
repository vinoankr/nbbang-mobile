import React, { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Spinner({ 
  size = 22, 
  color = "#71737C", 
  strokeWidth = 2.5 
}: SpinnerProps) {
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <LoaderCircle size={size} color={color} strokeWidth={strokeWidth} />
    </Animated.View>
  );
} 