import React, { useMemo, useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateObject, Subscription } from "./types";
import { getDatesForMonth, getSubscriptionsForDate } from "./utils";
import DateCell, { CellMeasurement } from "./DateCell";
import { DayHeaders } from "./DayHeaders";
import "nativewind";
import { Ionicons } from "@expo/vector-icons";

interface CalendarGridProps {
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
  subscriptions: Subscription[];
  selectedDate: DateObject | null;
  onDatePress: (date: DateObject) => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  onDateLongPress?: (
    date: DateObject,
    dateSubscriptions: Subscription[],
    cellMeasurement: CellMeasurement
  ) => void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<DateObject>);

const CalendarGrid = ({
  currentDate,
  onNavigateMonth,
  subscriptions,
  selectedDate,
  onDatePress,
  onSubscriptionPress,
  onDateLongPress,
}: CalendarGridProps) => {
  const [showAgenda, setShowAgenda] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gridRef = useRef<FlatList>(null);

  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  }, []);

  const currentMonthYear = useMemo(
    () => ({
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
    }),
    [currentDate]
  );

  const dates = useMemo(
    () => getDatesForMonth(currentMonthYear.year, currentMonthYear.month),
    [currentMonthYear]
  );

  // Calculate cell size based on available width, accounting for padding and insets
  const cellSize = useMemo(() => {
    const availableWidth = width - insets.left - insets.right - 32; // 32 for horizontal padding
    return Math.floor(availableWidth / 7);
  }, [width, insets]);

  const handleHaptic = useCallback((type: "select" | "press") => {
    const style =
      type === "select"
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium;
    Haptics.impactAsync(style);
  }, []);

  const handleNavigateMonth = useCallback(
    (direction: "prev" | "next") => {
      handleHaptic("select");
      onNavigateMonth(direction);
    },
    [handleHaptic, onNavigateMonth]
  );

  const renderDateCell = useCallback(
    ({ item }: { item: DateObject }) => {
      const isToday =
        item.day === today.day &&
        item.month === today.month &&
        item.year === today.year;

      const isCurrentMonth = item.month === currentMonthYear.month;

      return (
        <Animated.View
          layout={Layout.duration(300).withCallback((finished) => {
            if (finished) {
              // Ensure proper layout after animation
              gridRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          })}
          entering={FadeIn.duration(200)}
          style={{
            width: cellSize,
            height: cellSize,
            padding: 2,
          }}
        >
          <DateCell
            dateObj={item}
            subscriptions={subscriptions}
            cellSize={cellSize - 4} // Account for padding
            onDatePress={onDatePress}
            onSubscriptionPress={onSubscriptionPress}
            onDateLongPress={onDateLongPress}
            isSelected={selectedDate?.dateString === item.dateString}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
          />
        </Animated.View>
      );
    },
    [
      subscriptions,
      cellSize,
      selectedDate,
      today,
      currentMonthYear,
      onDatePress,
      onSubscriptionPress,
      onDateLongPress,
    ]
  );

  const keyExtractor = useCallback((item: DateObject) => item.dateString, []);

  return (
    <View className="flex-1 gap-2 bg-light-background dark:bg-primary">
      <DayHeaders />
      <AnimatedFlatList
        ref={gridRef}
        data={dates}
        renderItem={renderDateCell}
        keyExtractor={keyExtractor}
        numColumns={7}
        scrollEnabled={false}
        contentContainerStyle={{
          padding: 4,
          gap: 4,
        }}
        columnWrapperStyle={{
          gap: 0,
        }}
      />
    </View>
  );
};

const AgendaView = ({
  dates,
  subscriptions,
  onSubscriptionPress,
}: {
  dates: DateObject[];
  subscriptions: Subscription[];
  onSubscriptionPress: (subscription: Subscription) => void;
}) => {
  const groupedSubscriptions = useMemo(() => {
    const groups: { [key: string]: Subscription[] } = {};
    dates.forEach((date) => {
      const dateSubscriptions = getSubscriptionsForDate(
        subscriptions,
        date.dateString
      );
      if (dateSubscriptions.length > 0) {
        groups[date.dateString] = dateSubscriptions;
      }
    });
    return groups;
  }, [dates, subscriptions]);

  const renderSubscriptionItem = (
    subscription: Subscription,
    index: number,
    total: number
  ) => {
    if (index >= 2) return null;
    if (index === 1 && total > 2) {
      return (
        <View
          key="more"
          className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-gray-200 dark:bg-white/10"
        >
          <Text className="text-gray-800 dark:text-white text-xs font-bold">
            1+
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        key={subscription.id}
        onPress={() => onSubscriptionPress(subscription)}
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: subscription.color }}
      >
        <Ionicons name={subscription.icon as any} size={20} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView className="flex-1 bg-light-background dark:bg-primary">
      {Object.entries(groupedSubscriptions).map(
        ([dateString, dateSubscriptions]) => {
          const date = new Date(dateString);
          return (
            <View
              key={dateString}
              className="border-b border-gray-300 dark:border-white/10 p-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold text-light-text dark:text-textLight">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <View className="flex-row">
                  {dateSubscriptions.map((subscription, index) =>
                    renderSubscriptionItem(
                      subscription,
                      index,
                      dateSubscriptions.length
                    )
                  )}
                </View>
              </View>
              <View className="space-y-2">
                {dateSubscriptions.map((subscription) => (
                  <TouchableOpacity
                    key={subscription.id}
                    onPress={() => onSubscriptionPress(subscription)}
                    className="flex-row items-center bg-gray-100 dark:bg-white/5 p-3 rounded-lg"
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: subscription.color }}
                    >
                      <Ionicons
                        name={subscription.icon as any}
                        size={20}
                        color="white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-light-text dark:text-textLight font-medium">
                        {subscription.name}
                      </Text>
                      <Text className="text-gray-600 dark:text-white/60 text-sm">
                        ${subscription.price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }
      )}
    </ScrollView>
  );
};

export default CalendarGrid;
