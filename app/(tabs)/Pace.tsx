import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { FadeInDown, FadeInUp, SlideInLeft } from "react-native-reanimated";

const Pace = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const featureAnim = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Staggered animation for features
    Animated.stagger(
      100,
      Array(5)
        .fill()
        .map(() =>
          Animated.timing(featureAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        )
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-light-background dark:bg-primary">
      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text
            className="text-lg mb-6 leading-6"
            style={{
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontFamily: "Inter_400Regular",
            }}
          >
            Pace is a modern subscription management app designed to help you
            keep track of all your subscriptions in one place. Our mission is to
            make subscription management simple, efficient, and stress-free.
          </Text>

          <Text
            className="text-xl font-bold mb-4"
            style={{
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontFamily: "Inter_700Bold",
            }}
          >
            Features:
          </Text>

          <View className="mb-6">
            {[
              "Track all your subscriptions in one place",
              "Get notified before subscription renewals",
              "View detailed subscription analytics",
              "Manage multiple payment methods",
              "Export subscription data",
            ].map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.duration(500).delay(index * 100)}
                className="mb-3 p-4 rounded-xl bg-light-secondary/10 dark:bg-secondary/10"
                style={{
                  transform: [{ scale: featureAnim }],
                  opacity: featureAnim,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={isDarkMode ? "#4ADE80" : "#22C55E"}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    className="text-base flex-1"
                    style={{
                      color: isDarkMode ? "#FFFFFF" : "#000000",
                      fontFamily: "Inter_500Medium",
                    }}
                  >
                    {feature}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(600)}
            className="mt-8 py-4 border-t border-light-secondary/30 dark:border-secondary/30"
          >
            <Text
              className="text-sm text-center mb-2"
              style={{
                color: isDarkMode ? "#FFFFFF" : "#000000",
                fontFamily: "Inter_400Regular",
              }}
            >
              Version: 1.0.0
            </Text>
            <Text
              className="text-sm text-center"
              style={{
                color: isDarkMode ? "#FFFFFF" : "#000000",
                fontFamily: "Inter_400Regular",
              }}
            >
              © 2024 Pace. All rights reserved.
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Pace;
