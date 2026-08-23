import { describe, expect, it } from "vitest";
import { behaviourFor, modeForAttempt, revealsFeedbackOnSubmit } from "./mode";

// Learning mode is derived from what is already stored, never a second copy of
// it. These tests pin that down, because a stored copy is exactly the bug this
// design exists to avoid.

describe("modeForAttempt", () => {
  it("calls an attempt inside an exam session a mock", () => {
    expect(modeForAttempt({ examSessionId: "exam-1" })).toBe("mock");
  });

  it("calls a standalone attempt class practice", () => {
    expect(modeForAttempt({ examSessionId: null })).toBe("class");
  });
});

describe("mode behaviour", () => {
  it("withholds feedback until the end in mock mode only", () => {
    expect(revealsFeedbackOnSubmit("mock")).toBe(false);
    expect(revealsFeedbackOnSubmit("class")).toBe(true);
    expect(revealsFeedbackOnSubmit("lesson")).toBe(true);
  });

  it("teaches in lessons, supports in class, says little in mock", () => {
    expect(behaviourFor("lesson").guidance).toBe("taught");
    expect(behaviourFor("class").guidance).toBe("supported");
    expect(behaviourFor("mock").guidance).toBe("minimal");
  });

  it("only lets a mock count towards module readiness", () => {
    expect(behaviourFor("mock").countsTowardsReadiness).toBe(true);
    expect(behaviourFor("class").countsTowardsReadiness).toBe(false);
    expect(behaviourFor("lesson").countsTowardsReadiness).toBe(false);
  });
});
