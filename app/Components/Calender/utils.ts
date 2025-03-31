import { DateObject, Subscription } from './types';
import { MONTHS } from './constants';

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
      dateString
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
      dateString
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
      dateString
    });
  }
  
  return dateArray;
};

/**
 * Format date to YYYY-MM-DD for comparison
 */
export const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Get subscriptions for a specific date
 */
export const getSubscriptionsForDate = (subscriptions: Subscription[], date: string): Subscription[] => {
  return subscriptions.filter(sub => sub.renewalDate === date);
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