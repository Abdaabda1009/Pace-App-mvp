import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Easing,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import { Subscription } from "./types";
import { getMonthName } from "./utils";
import "nativewind";
import tw from "tailwind-react-native-classnames";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CellPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface SubscriptionPopoverProps {
  visible: boolean;
  subscriptions: Subscription[];
  date: string;
  cellPosition: CellPosition | null;
  onDismiss: () => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  onAddSubscriptionPress?: () => void;
}

export const SubscriptionPopover = ({
  visible,
  subscriptions,
  date,
  cellPosition,
  onDismiss,
  onSubscriptionPress,
  onAddSubscriptionPress,
}: SubscriptionPopoverProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const formattedDate = (() => {
    const [year, month, day] = date.split("-").map(Number);
    return `${getMonthName(month - 1)} ${day}, ${year}`;
  })();

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const handleAddSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddSubscriptionPress?.();
    handleDismiss();
  };

  if (!visible || !cellPosition) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={tw`flex-1 bg-black/50 justify-center items-center`}>
          <Animated.View
            style={[
              tw`bg-gray-900 rounded-xl shadow-lg border border-white/10`,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                width: screenWidth * 0.8,
                maxHeight: screenHeight * 0.5,
              },
            ]}
          >
            <View
              style={tw`flex-row justify-between items-center p-3 border-b border-white/10`}
            >
              <Text style={tw`text-base font-bold text-white`}>
                {formattedDate}
              </Text>
              <TouchableOpacity
                onPress={handleDismiss}
                style={tw`p-1 rounded-lg active:bg-white/10`}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {subscriptions.length > 0 ? (
              <FlatList
                data={subscriptions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      handleDismiss();
                      onSubscriptionPress(item);
                    }}
                    style={tw`flex-row items-center p-3 border-b border-white/10 active:bg-white/5`}
                  >
                    {item.logo ? (
                      <Image
                        source={{ uri: item.logo }}
                        style={tw`w-6 h-6 rounded-full`}
                      />
                    ) : (
                      <View
                        style={[
                          tw`w-6 h-6 rounded-full justify-center items-center`,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Text style={tw`text-white text-xs font-bold`}>
                          {item.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <View style={tw`ml-3 flex-1`}>
                      <Text style={tw`text-sm font-semibold text-white`}>
                        {item.name}
                      </Text>
                      <Text style={tw`text-xs text-white/80`}>
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="white" />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <View style={tw`items-center justify-center p-4`}>
                <Ionicons
                  name="calendar-outline"
                  size={32}
                  color="white"
                  style={tw`opacity-20 mb-3`}
                />
                <Text
                  style={tw`text-sm font-medium text-white mb-3 text-center`}
                >
                  No subscriptions due on this date
                </Text>
                <TouchableOpacity
                  onPress={handleAddSubscription}
                  style={tw`flex-row items-center bg-primary px-3 py-1.5 rounded-lg`}
                >
                  <Ionicons name="add-circle-outline" size={16} color="white" />
                  <Text style={tw`text-xs font-semibold text-white ml-1.5`}>
                    Add Subscription
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SubscriptionPopover;
