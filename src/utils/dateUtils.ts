const normalizeIsoLikeValue = (value: string): string => {
  return value
    .replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, "$1T$2")
    .replace(/([+-]\d{2})$/, "$1:00");
};

const parseHourWithMeridiem = (hourText: string, meridiem?: string): number => {
  let hours = Number(hourText);
  if (!meridiem) {
    return hours;
  }

  const isPm = meridiem.toLowerCase() === "pm";
  if (isPm && hours < 12) {
    hours += 12;
  } else if (!isPm && hours === 12) {
    hours = 0;
  }

  return hours;
};

const parseTimePart = (
  rawTimePart?: string,
): { hours: number; minutes: number; seconds: number } => {
  if (!rawTimePart) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const timeMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(
    rawTimePart.trim(),
  );
  if (!timeMatch) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const [, hourText, minuteText, secondText, meridiem] = timeMatch;
  return {
    hours: parseHourWithMeridiem(hourText, meridiem),
    minutes: Number(minuteText ?? "0"),
    seconds: Number(secondText ?? "0"),
  };
};

const parseLatinDateTime = (value: string): Date | null => {
  const latinSplitMatch = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](.+))?$/i.exec(value);
  if (!latinSplitMatch) {
    return null;
  }

  const [, dayText, monthText, yearText, rawTimePart] = latinSplitMatch;
  const { hours, minutes, seconds } = parseTimePart(rawTimePart);

  return new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    hours,
    minutes,
    seconds,
    0,
  );
};

const parseIsoDateOnly = (value: string): Date | null => {
  const isoDateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!isoDateOnlyMatch) {
    return null;
  }

  const [, yearText, monthText, dayText] = isoDateOnlyMatch;
  return new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    0,
    0,
    0,
    0,
  );
};

const parseIsoLikeDate = (value: string): Date | null => {
  const directDate = new Date(normalizeIsoLikeValue(value));
  if (Number.isNaN(directDate.getTime())) {
    return null;
  }

  return directDate;
};

export const parseDateTimeFlexible = (value: string): Date | null => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();

  return (
    parseLatinDateTime(trimmed) ||
    parseIsoDateOnly(trimmed) ||
    parseIsoLikeDate(trimmed)
  );
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

export const formatDateTime = (value: string): string => {
  const parsed = parseDateTimeFlexible(value);
  if (!parsed) {
    return value;
  }

  const day = pad2(parsed.getDate());
  const month = pad2(parsed.getMonth() + 1);
  const year = parsed.getFullYear();
  const minutes = pad2(parsed.getMinutes());

  const hours24 = parsed.getHours();
  const period = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${day}/${month}/${year} ${pad2(hours12)}:${minutes} ${period}`;
};
