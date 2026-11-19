import { describe, expect, it } from "vitest";
import { activeIndex, badge, mod, ringRotation, slotPosition, stepToward } from "@/lib/orbit";

const N = 8;

describe("orbit geometry", () => {
  it("mod is always positive", () => {
    expect(mod(-1, N)).toBe(7);
    expect(mod(-9, N)).toBe(7);
    expect(mod(8, N)).toBe(0);
  });

  it("the active speaker lands at the bottom for any step", () => {
    for (let step = -20; step <= 20; step++) {
      const i = activeIndex(step, N);
      const base = 90 + (i * 360) / N;
      // Rotated angle of the active slot, normalised: always 90deg (bottom).
      expect(mod(base + ringRotation(step, N), 360)).toBeCloseTo(90, 6);
    }
  });

  it("turns the short way, including across the wrap", () => {
    expect(stepToward(0, 1, N)).toBe(1);
    expect(stepToward(0, 7, N)).toBe(-1); // last speaker: one step back, not seven forward
    expect(stepToward(7, 0, N)).toBe(8); // wrap forward: 7 -> 0 is one step
    expect(stepToward(-1, 0, N)).toBe(0);
    expect(stepToward(13, 2, N)).toBe(10); // index 5 to 2: three back beats five forward
  });

  it("never turns more than half a ring", () => {
    for (let step = -10; step <= 10; step++) {
      for (let t = 0; t < N; t++) {
        const next = stepToward(step, t, N);
        expect(Math.abs(next - step)).toBeLessThanOrEqual(N / 2);
        expect(activeIndex(next, N)).toBe(t);
      }
    }
  });

  it("selecting the active speaker does not move the ring", () => {
    expect(stepToward(5, 5, N)).toBe(5);
    expect(stepToward(-3, 5, N)).toBe(-3);
  });

  it("places speaker 0 at the bottom and the rest evenly on the ring", () => {
    expect(slotPosition(0, N, 40)).toEqual({ left: 50, top: 90 });
    expect(slotPosition(2, N, 40)).toEqual({ left: 10, top: 50 });
    expect(slotPosition(4, N, 40)).toEqual({ left: 50, top: 10 });
    for (let i = 0; i < N; i++) {
      const { left, top } = slotPosition(i, N, 40);
      expect(Math.hypot(left - 50, top - 50)).toBeCloseTo(40, 2);
    }
  });

  it("badges are two digits", () => {
    expect(badge(0)).toBe("01");
    expect(badge(7)).toBe("08");
    expect(badge(11)).toBe("12");
  });
});
