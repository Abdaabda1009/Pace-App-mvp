import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { DateObject, Subscription } from "./types";
import { getSubscriptionsForDate, getMonthName } from "./utils";
import { SubscriptionIcons } from "./SubscriptionIcons";
import { EmptyDateState } from "./EmptyDateState";
import "nativewind";

export interface CellMeasurement {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface DateCellProps {
  dateObj: DateObject;
  subscriptions: Subscription[];
  cellSize: number;
  onDatePress: (date: DateObject) => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  onDateLongPress?: (
    date: DateObject,
    dateSubscriptions: Subscription[],
    cellMeasurement: CellMeasurement
  ) => void;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

const DateCell = React.memo(
  ({
    dateObj,
    subscriptions,
    cellSize,
    onDatePress,
    onSubscriptionPress,
    onDateLongPress,
    isSelected,
    isToday,
    isCurrentMonth,
  }: DateCellProps) => {
    const { bottom } = useSafeAreaInsets();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const hintOpacity = useRef(new Animated.Value(0.7)).current;
    const cellRef = useRef<View>(null);

    const dateSubscriptions = useMemo(
      () => getSubscriptionsForDate(subscriptions, dateObj.dateString),
      [subscriptions, dateObj.dateString]
    );

    const hasSubscriptions = dateSubscriptions.length > 0;
    const hasMultipleSubscriptions = dateSubscriptions.length > 1;
    const dateLabel = `${dateObj.day} ${getMonthName(dateObj.month)} ${
      dateObj.year
    }`;
    const subscriptionsLabel = hasSubscriptions
      ? `${dateSubscriptions.length} subscription${
          dateSubscriptions.length > 1 ? "s" : ""
        }`
      : "No subscriptions";

    // Animation effects remain the same
    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }).start();
    }, [isSelected, scaleAnim]);

    useEffect(() => {
      if (hasMultipleSubscriptions) {
        const pulseAnimation = Animated.sequence([
          Animated.timing(hintOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(hintOpacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]);

        Animated.loop(pulseAnimation).start();

        return () => {
          hintOpacity.stopAnimation();
        };
      }
    }, [hasMultipleSubscriptions, hintOpacity]);

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDatePress(dateObj);
    }, [dateObj, onDatePress]);

    const handleLongPress = useCallback(() => {
      if (hasSubscriptions && onDateLongPress && cellRef.current) {
        cellRef.current.measure((x, y, width, height, pageX, pageY) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDateLongPress(dateObj, dateSubscriptions, {
            x,
            y,
            width,
            height,
            pageX,
            pageY,
          });
        });
      }
    }, [dateObj, dateSubscriptions, hasSubscriptions, onDateLongPress]);

    return (
      <Animated.View
        style={{
          width: cellSize,
          height: cellSize,
          minWidth: 40,
          minHeight: 55,
          transform: [{ scale: scaleAnim }],
        }}
        className="p-px"
      >
        <TouchableOpacity
          ref={cellRef}
          activeOpacity={0.7}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          className={`
            flex-1 items-center justify-center rounded-lg
            ${!isCurrentMonth ? "opacity-40" : ""}
            ${
              isSelected
                ? "dark:bg-white/20 bg-light-secondary"
                : "dark:bg-primary bg-light-primary"
            }
            ${isToday ? "border-2 dark:border-white/20 border-black/20" : ""}
          `}
          accessibilityLabel={dateLabel}
          accessibilityHint={subscriptionsLabel}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <View className="flex-1 w-full items-center">
            <Text
              className={`
                text-base font-medium pt-1
                ${
                  isToday
                    ? "dark:text-textLight text-primary font-bold"
                    : "dark:text-textLight text-textDark"
                }
              `}
            >
              {dateObj.day}
            </Text>

            <View className="absolute bottom-1 w-full items-center">
              {hasSubscriptions ? (
                <SubscriptionIcons
                  subscriptions={dateSubscriptions}
                  onSubscriptionPress={onSubscriptionPress}
                />
              ) : (
                <EmptyDateState />
              )}
            </View>

            {hasMultipleSubscriptions && (
              <Animated.View
                className="absolute bottom-0 w-2 h-1 dark:bg-primary bg-light-primary rounded-full"
                style={{ opacity: hintOpacity }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default DateCell;
