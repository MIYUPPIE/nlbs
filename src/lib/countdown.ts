/**
 * Countdown math. Pure functions, no Date.now() inside, so they are testable
 * and identical on server and client.
 *
 * The summit start time is not confirmed, so the countdown targets the start
 * of the event day (00:00) in the event's timezone.
 */

const DAY_MS = 86_400_000;

/** Offset in ms between `timeZone` local time and UTC at instant `utcMs`. */
export function timeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));

  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** UTC epoch ms for a local wall-clock time (HH:MM) on `isoDate` in `timeZone`. */
export function zonedTimeToUtc(isoDate: string, time: string, timeZone: string): number {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!d) throw new Error(`Invalid ISO date: ${isoDate}`);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!t) throw new Error(`Invalid time: ${time}`);
  const [, y, m, day] = d.map(Number);
  const [, hh, mm] = t.map(Number);
  const naive = Date.UTC(y, m - 1, day, hh, mm);
  // Two passes handle zones whose offset differs across the naive guess.
  const first = naive - timeZoneOffsetMs(naive, timeZone);
  return naive - timeZoneOffsetMs(first, timeZone);
}

/** UTC epoch ms for 00:00 on `isoDate` (YYYY-MM-DD) in `timeZone`. */
export function startOfDayInZone(isoDate: string, timeZone: string): number {
  return zonedTimeToUtc(isoDate, "00:00", timeZone);
}

export type CountdownStatus = "upcoming" | "live" | "past";

export type Countdown = {
  status: CountdownStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Breaks the time from `nowMs` to `targetMs` into units.
 * "live" runs from the target until `endMs` (default: 24h later); "past" after.
 */
export function getCountdown(nowMs: number, targetMs: number, endMs: number = targetMs + DAY_MS): Countdown {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return {
      status: nowMs < endMs ? "live" : "past",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    status: "upcoming",
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

export const pad2 = (n: number): string => String(n).padStart(2, "0");
