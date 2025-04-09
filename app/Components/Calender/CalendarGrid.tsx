import React, { useMemo, useCallback, useRef } from "react";
import { View, FlatList, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateObject, Subscription } from "./types";
import { getDatesForMonth } from "./utils";
import DateCell, { CellMeasurement } from "./DateCell";
import { MonthNavigator } from "./MonthNavigator";
import { DayHeaders } from "./DayHeaders";
import "nativewind";

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
    const availableWidth = width - insets.left - insets.right - 32; // 32 for padding
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
    <View className="flex-1">
      <MonthNavigator
        currentDate={currentDate}
        onNavigateMonth={handleNavigateMonth}
      />

      <View className="bg-white/10 rounded-2xl overflow-hidden p-4">
        <DayHeaders />

        <AnimatedFlatList
          ref={gridRef}
          data={dates}
          renderItem={renderDateCell}
          keyExtractor={keyExtractor}
          numColumns={7}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={42}
          maxToRenderPerBatch={42}
          windowSize={42}
          removeClippedSubviews
          contentContainerStyle={{
            paddingHorizontal: insets.left,
            gap: 4,
          }}
          columnWrapperStyle={{
            gap: 4,
          }}
        />
      </View>
    </View>
  );
};

export default CalendarGrid;
