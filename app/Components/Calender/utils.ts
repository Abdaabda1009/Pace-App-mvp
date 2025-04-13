import { DateObject, Subscription } from "./types";
import { MONTHS, DAYS_OF_WEEK } from "./constants";

/**
 * Function to get dates for a month grid
 * Returns a 6x7 grid of dates including overflow dates from previous/next months
 */
export const getDatesForMonth = (year: number, month: number): DateObject[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();

  const daysInMonth = lastDay.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const dateArray: DateObject[] = [];

  // Previous month's dates
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = daysInPrevMonth - firstDayOfWeek + i + 1;
    const prevMonth = month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const actualMonth = prevMonth < 0 ? 11 : prevMonth;
    const dateString = formatDate(prevYear, actualMonth, day);

    dateArray.push({
      day,
      month: actualMonth,
      year: prevYear,
      isCurrentMonth: false,
      dateString,
    });
  }

  // Current month's dates
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = formatDate(year, month, i);
    dateArray.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
      dateString,
    });
  }

  // Next month's dates (to fill a 6x7 grid)
  const remainingDays = 42 - dateArray.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonth = month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const actualMonth = nextMonth > 11 ? 0 : nextMonth;
    const dateString = formatDate(nextYear, actualMonth, i);

    dateArray.push({
      day: i,
      month: actualMonth,
      year: nextYear,
      isCurrentMonth: false,
      dateString,
    });
  }

  return dateArray;
};

/**
 * Format date to YYYY-MM-DD for comparison
 */
export const formatDate = (
  year: number,
  month: number,
  day: number
): string => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

/**
 * Get subscriptions for a specific date
 */
export const getSubscriptionsForDate = (
  subscriptions: Subscription[],
  date: string
): Subscription[] => {
  return subscriptions.filter((sub) => {
    // Convert both dates to YYYY-MM-DD format for comparison
    const subDate = new Date(sub.renewalDate);
    const targetDate = new Date(date);

    return (
      subDate.getFullYear() === targetDate.getFullYear() &&
      subDate.getMonth() === targetDate.getMonth() &&
      subDate.getDate() === targetDate.getDate()
    );
  });
};

/**
 * Format month and year
 */
export const formatMonthYear = (date: Date): string => {
  return `${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
};

/**
 * Get month name from month index
 */
export const getMonthName = (month: number): string => {
  return MONTHS[month];
};

export const getWeekdayName = (day: number): string => {
  return DAYS_OF_WEEK[day];
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
};

export const subtractMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  newDate.setDate(diff);
  return newDate;
};

export const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  return addDays(start, 6);
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const getStartOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

export const getEndOfYear = (date: Date): Date => {
  return new Date(date.getFullYear(), 11, 31);
};

export const isWithinRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

export const getDaysInRange = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }
  return days;
};

export const getMonthsInRange = (start: Date, end: Date): Date[] => {
  const months: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    months.push(new Date(current));
    current = addMonths(current, 1);
  }
  return months;
};

export const getYearsInRange = (start: Date, end: Date): Date[] => {
  const years: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    years.push(new Date(current));
    current = new Date(current.getFullYear() + 1, 0, 1);
  }
  return years;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const calculateMonthlyCost = (subscriptions: Subscription[]): number => {
  return subscriptions.reduce((total, sub) => total + sub.price, 0);
};

export const calculateYearlyCost = (subscriptions: Subscription[]): number => {
  return calculateMonthlyCost(subscriptions) * 12;
};

export const getSubscriptionIcon = (subscription: Subscription): string => {
  return subscription.icon;
};

export const getSubscriptionColor = (subscription: Subscription): string => {
  return subscription.color;
};

export default {
  formatDate,
  getDatesForMonth,
  getSubscriptionsForDate,
  formatMonthYear,
  getMonthName,
  getWeekdayName,
  isToday,
  isSameDay,
  isSameMonth,
  isSameYear,
  addMonths,
  subtractMonths,
  addDays,
  subtractDays,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  isWithinRange,
  getDaysInRange,
  getMonthsInRange,
  getYearsInRange,
  formatCurrency,
  calculateMonthlyCost,
  calculateYearlyCost,
  getSubscriptionIcon,
  getSubscriptionColor,
};
