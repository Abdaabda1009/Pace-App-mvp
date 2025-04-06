import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Subscription } from "../../constants/Subscription";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  logoImages: Record<string, any>;
  refreshing: boolean;
  onRefresh: () => void;
  onAddPress: () => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  listBottomPadding?: number;
}

const SubscriptionListItem = React.memo(
  ({
    item,
    logoImages,
    onPress,
  }: {
    item: Subscription;
    logoImages: Record<string, any>;
    onPress: () => void;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const daysUntilRenewal = (renewalDate: string): number => {
      const today = new Date();
      const renewal = new Date(renewalDate);
      return Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );
    };

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      >
        <TouchableOpacity
          className="flex-row bg-white/5 rounded-2xl p-4 mb-4 items-center border border-white/10 ios:shadow-lg android:shadow-none"
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View className="w-12 h-12 rounded-xl justify-center items-center bg-white/10">
            {logoImages[item.icon] && (
              <Image
                source={logoImages[item.icon]}
                className="w-8 h-8"
                resizeMode="contain"
                accessibilityLabel={`${item.name} logo`}
              />
            )}
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-white text-lg font-semibold mb-1">
              {item.name}
            </Text>
            <Text className="text-white/50 text-sm">{item.category}</Text>
          </View>

          <View className="items-end">
            <Text className="text-brandBlue text-lg font-bold">
              ${item.price.toFixed(2)}
            </Text>
            <Text className="text-white/50 text-sm">
              {daysUntilRenewal(item.renewalDate) <= 0
                ? "Due today"
                : `${daysUntilRenewal(item.renewalDate)} days`}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  logoImages,
  refreshing,
  onRefresh,
  onAddPress,
  onSubscriptionPress,
  listBottomPadding = 100,
}) => {
  const insets = useSafeAreaInsets();

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View className="flex-1 px-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-xl font-bold">Subscriptions</Text>
        <TouchableOpacity
          className="flex-row items-center bg-brandBlue/10 px-4 py-2 rounded-full"
          onPress={() => handlePress(onAddPress)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#2F80ED" />
          <Text className="text-brandBlue ml-2 font-semibold">Add Service</Text>
        </TouchableOpacity>
      </View>

      {subscriptions.length > 0 ? (
        <FlatList
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionListItem
              item={item}
              logoImages={logoImages}
              onPress={() => handlePress(() => onSubscriptionPress(item))}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: listBottomPadding + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2F80ED"
              colors={["#2F80ED"]}
              progressBackgroundColor="rgba(255,255,255,0.1)"
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <View className="bg-white/10 p-6 rounded-full mb-4">
            <Ionicons name="wallet-outline" size={40} color="#2F80ED" />
          </View>
          <Text className="text-white/80 text-lg font-semibold mb-2">
            No Subscriptions Found
          </Text>
          <Text className="text-white/50 text-sm text-center px-8 mb-6">
            Start by adding your first subscription to manage your recurring
            expenses
          </Text>
          <TouchableOpacity
            className="bg-brandBlue px-8 py-3 rounded-full flex-row items-center"
            onPress={() => handlePress(onAddPress)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              Add Subscription
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default React.memo(SubscriptionList);
