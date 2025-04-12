import { View, Text } from "react-native";
import { DAYS_OF_WEEK } from "./constants";

export const DayHeaders = () => {
  return (
    <View className="flex-row border-b border-light-text/10 dark:border-white/10 bg-light-primary dark:bg-white/12 py-3">
      {DAYS_OF_WEEK.map((day, index) => (
        <View
          key={`day-${index}`}
          className="flex-1 items-center justify-center"
          accessibilityLabel={day}
          accessibilityRole="header"
        >
          <Text className="text-sm font-semibold text-light-text/80 dark:text-textLight/80">
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default DayHeaders;
