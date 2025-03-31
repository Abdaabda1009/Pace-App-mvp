import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, Text, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Subscription } from "./types";
import { logoImages } from "./constants";
import "nativewind";


interface SubscriptionIconsProps {
  subscriptions: Subscription[];
  onSubscriptionPress: (subscription: Subscription) => void;
}

export const SubscriptionIcons = ({
  subscriptions,
  onSubscriptionPress,
}: SubscriptionIconsProps) => {
  const mainSubscription = subscriptions[0];
  const hasMultiple = subscriptions.length > 1;
  const additionalCount = subscriptions.length - 1;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasMultiple) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  }, [hasMultiple]);

  const handleIconPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubscriptionPress(mainSubscription);
  };

  return (
    <View
      className="flex-row items-center justify-center h-7 mb-0 pt-0"
      accessibilityLabel={
        hasMultiple
          ? `${subscriptions.length} subscriptions, showing ${mainSubscription.name} and ${additionalCount} more`
          : `${mainSubscription.name} subscription`
      }
    >
      <View className="flex-row items-center justify-center">
        <TouchableOpacity
          className="relative w-[22px] h-[22px] justify-center items-center"
          onPress={handleIconPress}
          accessibilityLabel={`${
            mainSubscription.name
          } subscription for $${mainSubscription.price.toFixed(2)}`}
          accessibilityHint={
            hasMultiple
              ? `Double tap to view ${mainSubscription.name} subscription details. There are ${additionalCount} more subscriptions on this date.`
              : `Double tap to view ${mainSubscription.name} subscription details.`
          }
          accessibilityRole="button"
        >
          <Image
            source={
              logoImages[mainSubscription.icon as keyof typeof logoImages] ||
              logoImages["Google"]
            }
            className="w-5 h-5 rounded-sm"
          />

          {hasMultiple && (
            <Animated.View
              className="absolute -bottom-1 -right-2 min-w-[16px] h-4 px-1 bg-primary rounded-full justify-center items-center border border-white/30 shadow-md"
              style={{
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-[8px] text-text-light font-bold text-center">
                +{additionalCount}
              </Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
