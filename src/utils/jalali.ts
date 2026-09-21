/**
 * Iranian Jalali (Shamsi) Calendar conversion and formatting utility
 */

export interface JalaliDate {
  jy: number; // Jalali Year e.g. 1405
  jm: number; // Jalali Month 1-12
  jd: number; // Jalali Day 1-31
}

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

export const PERSIAN_WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  return n
    .toString()
    .replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * Converts Gregorian date to Jalali date
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Converts Jalali date to Gregorian date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && days > gd_m[gm]) {
    days -= gd_m[gm];
    gm++;
  }
  const gd = days;
  return { gy, gm, gd };
}

export function isJalaliLeapYear(jy: number): boolean {
  const r = (jy - (jy > 0 ? 474 : 473)) % 2820 + 474 + 38;
  return ((r * 682) % 2816) < 682;
}

export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

export function getCurrentJalaliDate(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatJalaliDate(jDate: JalaliDate, format: 'full' | 'short' | 'standard' = 'full'): string {
  const { jy, jm, jd } = jDate;
  const monthName = PERSIAN_MONTH_NAMES[jm - 1];

  if (format === 'short') {
    return `${toPersianDigits(jd)} ${monthName}`;
  }
  if (format === 'standard') {
    const padM = jm < 10 ? `0${jm}` : `${jm}`;
    const padD = jd < 10 ? `0${jd}` : `${jd}`;
    return `${toPersianDigits(jy)}/${toPersianDigits(padM)}/${toPersianDigits(padD)}`;
  }

  // Full format with weekday
  const g = jalaliToGregorian(jy, jm, jd);
  const dateObj = new Date(g.gy, g.gm - 1, g.gd);
  const dayOfWeekIndex = (dateObj.getDay() + 1) % 7; // Saturday = 0
  const dayName = PERSIAN_WEEK_DAYS[dayOfWeekIndex];

  return `${dayName}، ${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

/**
 * Returns weekday index of first day of the Jalali month (0 = شنبه Saturday, 6 = جمعه Friday)
 */
export function getFirstDayOfJalaliMonth(jy: number, jm: number): number {
  const g = jalaliToGregorian(jy, jm, 1);
  const dateObj = new Date(g.gy, g.gm - 1, g.gd);
  return (dateObj.getDay() + 1) % 7;
}

export function parseJalaliString(str: string): JalaliDate | null {
  if (!str) return null;
  // standard or persian digits
  const clean = str
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .trim();
  const parts = clean.split(/[\/\-]/);
  if (parts.length === 3) {
    const jy = parseInt(parts[0], 10);
    const jm = parseInt(parts[1], 10);
    const jd = parseInt(parts[2], 10);
    if (!isNaN(jy) && !isNaN(jm) && !isNaN(jd)) {
      return { jy, jm, jd };
    }
  }
  return null;
}
