import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

/**
 * Reusable animation components — dùng React Native Animated API built-in
 * Không cần Reanimated, chạy 100% trên Expo Go, zero native dependency
 */

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/** Component cho hiệu ứng Fade-in từng phần tử đơn lẻ */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 500,
  style,
  direction = 'up',
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dist = 24;
    let xVal = 0;
    let yVal = 0;
    switch (direction) {
      case 'up': yVal = dist; break;
      case 'down': yVal = -dist; break;
      case 'left': xVal = dist; break;
      case 'right': xVal = -dist; break;
    }
    translateX.setValue(xVal);
    translateY.setValue(yVal);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        { opacity, transform: [{ translateX }, { translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  staggerDelay?: number;
  itemDuration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/** Container cho hiệu ứng Stagger (các phần tử con xuất hiện lần lượt) */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  style,
  staggerDelay = 80,
  itemDuration = 400,
  direction = 'up',
}) => {
  return (
    <View style={style}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <FadeInView
            key={child.key || index}
            delay={index * staggerDelay}
            duration={itemDuration}
            direction={direction}
          >
            {child}
          </FadeInView>
        );
      })}
    </View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Wrapper cho hiệu ứng scale nhẹ khi xuất hiện (dùng cho card items) */
export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  style,
}) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ scale }] }]}
    >
      {children}
    </Animated.View>
  );
};

/** Hiệu ứng Shimmer loading pulse */
export { ShimmerLoading } from './ShimmerLoading';
