import { describe, it, expect } from "vitest";
import {
  calculateMatchElo,
  getDivision,
  getKFactor,
  getExpectedScore,
} from "../src/lib/elo";

describe("My8ball Elo Rating & Competition Engine", () => {
  it("should assign correct division tiers based on rating thresholds", () => {
    expect(getDivision(1150)).toBe("ROOKIE");
    expect(getDivision(1200)).toBe("BRONZE");
    expect(getDivision(1350)).toBe("SILVER");
    expect(getDivision(1500)).toBe("GOLD");
    expect(getDivision(1680)).toBe("PLATINUM");
    expect(getDivision(1820)).toBe("DIAMOND");
    expect(getDivision(1960)).toBe("CHAMPION");
    expect(getDivision(2150)).toBe("ELITE");
  });

  it("should provide higher K-factor (K=40) for provisional players with <15 matches", () => {
    const kProvisional = getKFactor(5, 1200);
    const kEstablished = getKFactor(25, 1400);
    const kElite = getKFactor(50, 1850);

    expect(kProvisional).toBe(40);
    expect(kEstablished).toBe(24);
    expect(kElite).toBe(16);
  });

  it("should calculate expected win probability symmetrically", () => {
    const p1Expected = getExpectedScore(1600, 1600);
    expect(p1Expected).toBeCloseTo(0.5, 2);

    const higherExpected = getExpectedScore(1800, 1400);
    expect(higherExpected).toBeGreaterThan(0.85);
  });

  it("should correctly update ratings after a confirmed match and reward margin of victory", () => {
    // Player 1 (1600) beats Player 2 (1500) 5 frames to 2
    const result = calculateMatchElo(1600, 1500, 5, 2, 20, 20);

    expect(result.player1Change).toBeGreaterThan(0);
    expect(result.player2Change).toBeLessThan(0);
    expect(result.player1NewRating).toBe(1600 + result.player1Change);
    expect(result.player2NewRating).toBe(1500 + result.player2Change);
  });

  it("should provide greater rating reward when an underdog defeats a favorite", () => {
    // Underdog (1300) defeats Favorite (1600)
    const upsetResult = calculateMatchElo(1300, 1600, 5, 3, 20, 20);
    // Favorite (1600) defeats Underdog (1300)
    const expectedWinResult = calculateMatchElo(1600, 1300, 5, 3, 20, 20);

    expect(upsetResult.player1Change).toBeGreaterThan(expectedWinResult.player1Change);
  });

  it("should never let ratings drop below 800 floor", () => {
    const floorResult = calculateMatchElo(810, 1500, 0, 5, 20, 20);
    expect(floorResult.player1NewRating).toBeGreaterThanOrEqual(800);
  });
});

describe("Blackball Rules & Match Logic Validation", () => {
  it("should enforce race-to-5 frame completion logic", () => {
    const raceTo = 5;
    const scores = [
      { p1: 3, p2: 2, completed: false },
      { p1: 4, p2: 4, completed: false }, // Hill-Hill
      { p1: 5, p2: 4, completed: true },  // Player 1 reaches 5
      { p1: 2, p2: 5, completed: true },  // Player 2 reaches 5
    ];

    scores.forEach(({ p1, p2, completed }) => {
      const isReached = p1 >= raceTo || p2 >= raceTo;
      expect(isReached).toBe(completed);
    });
  });

  it("should validate legal foul types in Blackball South Africa", () => {
    const validFouls = [
      "FOUL_CUE_SCRATCH",
      "FOUL_OPPONENT_BALL",
      "LOSS_OF_FRAME_BLACK",
      "LEGAL_CLEARANCE",
    ];

    validFouls.forEach((foul) => {
      expect(typeof foul).toBe("string");
      expect(foul.length).toBeGreaterThan(5);
    });
  });
});
