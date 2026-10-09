import { describe, expect, it } from "vitest";
import { event } from "@/data/event";
import { getCountdown, pad2, startOfDayInZone, timeZoneOffsetMs, zonedTimeToUtc } from "@/lib/countdown";

const LAGOS = "Africa/Lagos";

describe("startOfDayInZone", () => {
  it("resolves 27 Nov 2026 00:00 WAT to 26 Nov 23:00 UTC", () => {
    expect(new Date(startOfDayInZone("2026-11-27", LAGOS)).toISOString()).toBe("2026-11-26T23:00:00.000Z");
  });

  it("uses the event's configured date and timezone", () => {
    expect(event.date.iso).toBe("2026-11-23");
    expect(event.date.timeZone).toBe(LAGOS);
  });

  it("handles zones with DST and negative offsets", () => {
    // New York is UTC-5 in late November.
    expect(new Date(startOfDayInZone("2026-11-27", "America/New_York")).toISOString()).toBe(
      "2026-11-27T05:00:00.000Z",
    );
    // London is on BST (UTC+1) in July.
    expect(new Date(startOfDayInZone("2026-07-01", "Europe/London")).toISOString()).toBe(
      "2026-06-30T23:00:00.000Z",
    );
  });

  it("rejects malformed dates", () => {
    expect(() => startOfDayInZone("27/11/2026", LAGOS)).toThrow(/Invalid ISO date/);
  });

  it("reports Lagos as UTC+1 year-round", () => {
    expect(timeZoneOffsetMs(Date.UTC(2026, 0, 15), LAGOS)).toBe(3_600_000);
    expect(timeZoneOffsetMs(Date.UTC(2026, 6, 15), LAGOS)).toBe(3_600_000);
  });
});

describe("getCountdown", () => {
  const target = startOfDayInZone("2026-11-27", LAGOS);

  it("breaks the remaining time into units", () => {
    const now = target - (2 * 86_400_000 + 3 * 3_600_000 + 4 * 60_000 + 5_000);
    expect(getCountdown(now, target)).toEqual({
      status: "upcoming",
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it("floors partial seconds instead of rounding up", () => {
    expect(getCountdown(target - 1_999, target).seconds).toBe(1);
  });

  it("is live during the event day and past afterwards", () => {
    expect(getCountdown(target, target).status).toBe("live");
    expect(getCountdown(target + 23 * 3_600_000, target).status).toBe("live");
    expect(getCountdown(target + 86_400_000, target).status).toBe("past");
  });

  it("never returns negative units", () => {
    const c = getCountdown(target + 5_000_000, target);
    expect([c.days, c.hours, c.minutes, c.seconds].every((n) => n === 0)).toBe(true);
  });

  it("matches a known wall-clock reference", () => {
    // 28 Sep 2026 12:00 WAT → 59 days 12 hours before 27 Nov 00:00 WAT.
    const now = Date.parse("2026-09-28T11:00:00Z");
    expect(getCountdown(now, target)).toMatchObject({ days: 59, hours: 12, minutes: 0, seconds: 0 });
  });
});

describe("pad2", () => {
  it("pads to two digits", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(7)).toBe("07");
    expect(pad2(59)).toBe("59");
    expect(pad2(120)).toBe("120");
  });
});

describe("zonedTimeToUtc", () => {
  it("resolves the 9:00 AM WAT start to 08:00 UTC", () => {
    expect(new Date(zonedTimeToUtc(event.date.iso, event.date.startTime, LAGOS)).toISOString()).toBe(
      "2026-11-23T08:00:00.000Z",
    );
  });

  it("rejects malformed times", () => {
    expect(() => zonedTimeToUtc("2026-11-27", "9am", LAGOS)).toThrow(/Invalid time/);
  });

  it("stays live until the custom end, then past", () => {
    const start = zonedTimeToUtc("2026-11-27", "09:00", LAGOS);
    const end = startOfDayInZone("2026-11-28", LAGOS);
    expect(getCountdown(end - 1, start, end).status).toBe("live");
    expect(getCountdown(end, start, end).status).toBe("past");
  });
});
