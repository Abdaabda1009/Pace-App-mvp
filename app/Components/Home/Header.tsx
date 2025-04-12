import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

interface HeaderProps {
  userName: string;
  totalMonthly: number;
  upcomingRenewal: {
    name: string;
    renewalDate: string;
    price: number;
  } | null;
  onProfilePress: () => void;
}

const { width } = Dimensions.get("window");

const Header: React.FC<HeaderProps> = ({
  userName,
  totalMonthly,
  upcomingRenewal,
  onProfilePress,
}) => {
  const router = useRouter();

  const handlePressWithHaptic = () => {
    Haptics.selectionAsync();
    onProfilePress();
  };

  return (
    <View className="w-full px-4 pt-16">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-base text-light-text/70 dark:text-white/70 font-normal">
            Welcome back,
          </Text>
          <Text className="text-2xl text-light-text dark:text-white font-bold mt-1">
            {userName}
          </Text>
        </View>
      </View>

      <View className="bg-light-secondary dark:bg-white/10 rounded-xl p-4 mb-4 border border-light-secondary/20 dark:border-white/10">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-light-text/70 dark:text-white/70 font-medium">
            Monthly Total
          </Text>
          <Text className="text-xl text-light-text dark:text-white font-bold">
            ${totalMonthly.toFixed(2)}
          </Text>
        </View>

        {upcomingRenewal && (
          <View className="border-t border-light-secondary/20 dark:border-white/10 pt-3">
            <Text className="text-sm text-light-text/70 dark:text-white/70 font-medium mb-2">
              Next Renewal
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-light-text dark:text-white font-semibold flex-1">
                {upcomingRenewal.name}
              </Text>
              <Text className="text-sm text-light-text/70 dark:text-white/70 mx-2">
                {new Date(upcomingRenewal.renewalDate).toLocaleDateString()}
              </Text>
              <Text className="text-base text-brandBlue dark:text-brandBlue font-semibold">
                ${upcomingRenewal.price.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Header;
