import React, { useMemo, useRef, useEffect } from "react";
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

export const DateCell = React.memo(
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

    // Reset scale animation when selected state changes
    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }).start();
    }, [isSelected, scaleAnim]);

    // Run pulsing animation for hint indicator when cell has multiple subscriptions
    useEffect(() => {
      if (hasMultipleSubscriptions) {
        // Create pulsing animation sequence
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

        // Loop the animation
        Animated.loop(pulseAnimation).start();

        // Clean up animation when component unmounts
        return () => {
          hintOpacity.stopAnimation();
        };
      }
    }, [hasMultipleSubscriptions, hintOpacity]);

    // Handle press in - start scale animation if has multiple subscriptions
    const handlePressIn = () => {
      if (hasMultipleSubscriptions) {
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 5,
          tension: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    // Handle press out - revert scale animation
    const handlePressOut = () => {
      if (hasMultipleSubscriptions) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    // Handle regular press (select date)
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDatePress(dateObj);
    };

    // Handle long press to show subscriptions in popover
    const handleLongPress = () => {
      if (hasSubscriptions && onDateLongPress && cellRef.current) {
        // Measure the cell position to position the popover
        cellRef.current.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number
          ) => {
            // Trigger haptic feedback for long press
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Call the long press handler with cell measurement
            onDateLongPress(dateObj, dateSubscriptions, {
              x,
              y,
              width,
              height,
              pageX,
              pageY,
            });

            // Animate back to normal scale
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 5,
              tension: 300,
              useNativeDriver: true,
            }).start();
          }
        );
      }
    };
    // Calculate adjusted cell height based on cellSize to maintain aspect ratio
    const cellHeight = cellSize * 1.4; // Slightly taller than width for better spacing

    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            width: cellSize,
            height: cellSize * 1.4,
          },
        ]}
      >
        <TouchableOpacity
          ref={cellRef}
          activeOpacity={hasMultipleSubscriptions ? 0.9 : 0.7}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          delayLongPress={500}
          className={`
          border border-transparent
          ${!isCurrentMonth ? "bg-[rgba(255,255,255,0.04)]" : ""}
          ${
            isSelected
              ? "border-primary bg-[rgba(255,255,255,0.12)] border-2"
              : ""
          }
          ${
            hasSubscriptions
              ? "border-b-2 border-b-[rgba(255,255,255,0.2)]"
              : ""
          }
          ${hasMultipleSubscriptions ? "border-b-primary" : ""}
          w-full h-full py-1.5 px-1
        `}
          accessibilityLabel={dateLabel}
          accessibilityHint={hasSubscriptions 
            ? `${subscriptionsLabel}. Double tap to select this date. Long press to view all subscriptions.` 
            : `${subscriptionsLabel}. Double tap to select this date.`}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <View className="flex-1 w-full flex-col justify-between items-center">
            <View className="w-full items-center pt-0.5">
              <Text
                className={`
              text-base text-center font-medium
              ${!isCurrentMonth ? "text-[rgba(255,255,255,0.3)]" : "text-white"}
              ${isToday ? "text-primary font-bold" : ""}
            `}
              >
                {dateObj.day}
              </Text>
            </View>

            <View className="flex-1 justify-end items-center mt-auto pb-0.5">
              {hasSubscriptions ? (
                <SubscriptionIcons
                  subscriptions={dateSubscriptions}
                  onSubscriptionPress={onSubscriptionPress}
                />
              ) : (
                <EmptyDateState />
              )}
            </View>
          </View>

          {hasMultipleSubscriptions && (
            <Animated.View
              className="absolute bottom-0.5 self-center w-5 h-0.5 bg-primary rounded-full"
              style={{ opacity: hintOpacity }}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);
