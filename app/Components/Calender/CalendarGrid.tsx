import React, { useMemo, useCallback, useRef } from "react";
import { View, FlatList, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateObject, Subscription } from "./types";
import { getDatesForMonth } from "./utils";
import { DateCell, CellMeasurement } from "./DateCell";
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

  const cellSize = (width - insets.left - insets.right - 32) / 7;

  const handleHaptic = (type: "select" | "press") => {
    const style =
      type === "select"
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium;
    Haptics.impactAsync(style);
  };

  const handleDatePress = useCallback(
    (date: DateObject) => {
      handleHaptic("select");
      onDatePress(date);
    },
    [onDatePress]
  );

  const handleDateLongPress = useCallback(
    (date: DateObject, subs: Subscription[], measurement: CellMeasurement) => {
      handleHaptic("press");
      onDateLongPress?.(date, subs, measurement);
    },
    [onDateLongPress]
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
          layout={Layout.duration(300)}
          entering={FadeIn.duration(200)}
        >
          <DateCell
            dateObj={item}
            subscriptions={subscriptions}
            cellSize={cellSize}
            onDatePress={handleDatePress}
            onSubscriptionPress={onSubscriptionPress}
            onDateLongPress={handleDateLongPress}
            isSelected={selectedDate?.dateString === item.dateString}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
          />
        </Animated.View>
      );
    },
    [subscriptions, cellSize, selectedDate, today, currentMonthYear]
  );

  return (
    <View className="flex-1 mb-4">
      <MonthNavigator
        currentDate={currentDate}
        onNavigateMonth={(dir) => {
          handleHaptic("select");
          onNavigateMonth(dir);
        }}
      />

      <View className="bg-white/10 rounded-2xl overflow-hidden mb-4 p-2">
        <DayHeaders />
        <View className="h-2" />

        <AnimatedFlatList
          ref={gridRef}
          data={dates}
          renderItem={renderDateCell}
          keyExtractor={(item) => item.dateString}
          numColumns={7}
          scrollEnabled={false}
          accessibilityLabel="Calendar grid"
          accessibilityRole="grid"
          initialNumToRender={42}
          maxToRenderPerBatch={42}
          windowSize={42}
          removeClippedSubviews
          ListFooterComponent={<View className="h-2" />}
          contentContainerStyle={{ paddingHorizontal: insets.left }}
        />
      </View>
    </View>
  );
};

export default CalendarGrid;
