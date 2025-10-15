

import moment from "moment-jalaali";
import "moment-timezone";

export type TimeRange = "today" | "yesterday" | "current_week" | "current_month" | "custom" | "all";
export type TimeGranularity = "minute" | "hour" | "day" | "week" | "month" | "year";

// تابع کمکی برای فرمت تاریخ به هجری شمسی
export const toJalaliDate = (isoDate: string, granularity: TimeGranularity): string => {
  if (!isoDate) return "";
  const date = moment(isoDate).tz("Asia/Kabul");
  return date.isValid()
    ? date.format(
        granularity === "year" ? "jYYYY" :
        granularity === "month" ? "jYYYY/jMM" :
        granularity === "week" ? "jYYYY/jMM/jDD" :
        granularity === "day" ? "jYYYY/jMM/jDD" :
        granularity === "hour" ? "jYYYY/jMM/jDD HH:00" :
        "jYYYY/jMM/jDD HH:mm"
      )
    : "";
};

// تابع کمکی برای فیلتر داده‌ها بر اساس بازه تاریخ
export const getFilteredData = (data: any[], key: string = "date", selectedRange: TimeRange, customStartDate: string, customEndDate: string) => {
  if (!data || !Array.isArray(data)) return [];
  const now = moment().tz("Asia/Kabul");
  if (selectedRange === "custom" && customStartDate && customEndDate) {
    const start = moment(customStartDate).tz("Asia/Kabul").startOf("day");
    const end = moment(customEndDate).tz("Asia/Kabul").endOf("day");
    return data.filter((item) => {
      const itemDate = moment(item[key]).tz("Asia/Kabul");
      return itemDate.isValid() && itemDate.isBetween(start, end, undefined, "[]");
    });
  } else if (selectedRange === "today") {
    const today = now.startOf("day");
    return data.filter((item) => {
      const itemDate = moment(item[key]).tz("Asia/Kabul");
      return itemDate.isValid() && itemDate.isSame(today, "day");
    });
  } else if (selectedRange === "yesterday") {
    const yesterday = now.clone().subtract(1, "days").startOf("day");
    return data.filter((item) => {
      const itemDate = moment(item[key]).tz("Asia/Kabul");
      return itemDate.isValid() && itemDate.isSame(yesterday, "day");
    });
  } else if (selectedRange === "current_week") {
    const startOfWeek = now.startOf("week");
    const endOfWeek = now.endOf("week");
    return data.filter((item) => {
      const itemDate = moment(item[key]).tz("Asia/Kabul");
      return itemDate.isValid() && itemDate.isBetween(startOfWeek, endOfWeek, undefined, "[]");
    });
  } else if (selectedRange === "current_month") {
    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");
    return data.filter((item) => {
      const itemDate = moment(item[key]).tz("Asia/Kabul");
      return itemDate.isValid() && itemDate.isBetween(startOfMonth, endOfMonth, undefined, "[]");
    });
  }
  return data; // برای "all"
};


export async function handleApiError(response: Response): Promise<Error> {
    try {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `خطای HTTP! کد وضعیت: ${response.status}`;
        return new Error(errorMessage);
    } catch {
        return new Error(`خطای HTTP! کد وضعیت: ${response.status}`);
    }
}
