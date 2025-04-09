import { Subscription } from "../../Components/Calender/types";
// Day headers
export const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// List of month names for formatting
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Logo image imports for subscription services
export const logoImages = {
  Netflix: require("@/assets/images/Netflix.png"),
  Spotify: require("@/assets/images/Spotify.png"),
  "Disney+": require("@/assets/images/DisneyPlus.png"),
  YouTube: require("@/assets/images/Youtube.png"),
  Amazon: require("@/assets/images/Amazon.png"),
  Google: require("@/assets/images/Google.png"),
  Apple: require("@/assets/images/Google.png"), // Temporarily using Google icon until Apple.png is added
};

// Demo data - replace with actual data in production
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    icon: "Netflix",
    price: 15.99,
    renewalDate: "2024-10-15", // Keep this date for testing
    category: "Entertainment",
    color: "#E50914",
  },
  {
    id: "2",
    name: "Spotify",
    icon: "Spotify",
    price: 9.99,
    renewalDate: "2024-10-15", // Changed to match Netflix for testing
    category: "Music",
    color: "#1DB954",
  },
  {
    id: "3",
    name: "YouTube Premium",
    icon: "YouTube",
    price: 11.99,
    renewalDate: "2024-10-15", // Changed to match Netflix for testing
    category: "Entertainment",
    color: "#FF0000",
  },
  {
    id: "4",
    name: "Disney+",
    icon: "Disney+",
    price: 7.99,
    renewalDate: "2024-10-03",
    category: "Entertainment",
    color: "#0063e5",
  },
  {
    id: "5",
    name: "Apple TV+",
    icon: "Apple",
    price: 6.99,
    renewalDate: "2024-10-20",
    category: "Entertainment",
    color: "#000000",
  },
  {
    id: "6",
    name: "Amazon Prime",
    icon: "Amazon",
    price: 14.99,
    renewalDate: "2024-10-16",
    category: "Shopping",
    color: "#00A8E1",
  },
  {
    id: "7",
    name: "Google One",
    icon: "Google",
    price: 1.99,
    renewalDate: "2024-10-28",
    category: "Productivity",
    color: "#4285F4",
  },
];

export default {
  DAYS_OF_WEEK,
  MONTHS,
  MOCK_SUBSCRIPTIONS,
};
