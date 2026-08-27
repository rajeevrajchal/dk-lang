import { describe, expect, it } from "vitest";
import { moduleUsesTaskType, orderedTaskTypes, tasksForModule } from "./module-tasks";
import { speakingTasksForModule } from "./speaking-patterns";
import { TASK_TYPES_BY_CATEGORY } from "./constants";
import { selectNextTaskType, selectableTaskTypes } from "./registry";

// Module-shaped task selection: the thing that stops Class reading practice
// being a generic "read this and answer" drill.

describe("tasksForModule", () => {
  it("gives Modul 2 reading the four modultest opgaver in test order", () => {
    expect(tasksForModule(2, "READING")).toEqual([
      "reading_task_1_matching",
      "reading_task_2_wrong_sentence",
      "reading_task_3_missing_words",
      "reading_task_4_people_matching",
    ]);
  });

  it("gives Modul 2 and Modul 3 different writing compositions", () => {
    expect(tasksForModule(2, "WRITING")).not.toEqual(tasksForModule(3, "WRITING"));
  });

  it("delegates speaking to the existing speaking patterns, not a second copy", () => {
    for (const moduleId of [1, 2, 3, 4, 5]) {
      expect(tasksForModule(moduleId, "SPEAKING")).toEqual(speakingTasksForModule(moduleId));
    }
  });

  it("falls back to the category-wide list for a module with no composition", () => {
    // Modul 4 has no declared reading composition, so it must behave exactly
    // as every module did before compositions existed.
    expect(tasksForModule(4, "READING")).toBeNull();
    expect(orderedTaskTypes(4, "READING")).toEqual(TASK_TYPES_BY_CATEGORY.READING);
  });

  it("rejects a task type the module does not examine", () => {
    expect(moduleUsesTaskType(2, "SPEAKING", "speaking_prepared_topic")).toBe(false);
    expect(moduleUsesTaskType(3, "SPEAKING", "speaking_prepared_topic")).toBe(true);
  });
});

describe("selectNextTaskType", () => {
  it("rotates through Modul 2 reading rather than repeating one opgave", () => {
    const history: { variantId: string; taskType: string; completedAt: Date | null }[] = [];
    const served: string[] = [];

    for (let i = 0; i < 4; i++) {
      const next = selectNextTaskType(2, "READING", history)!;
      served.push(next);
      history.push({
        variantId: `v${i}`,
        taskType: next,
        completedAt: new Date(2026, 0, i + 1),
      });
    }

    expect(new Set(served).size).toBe(4);
  });

  it("never serves a listening task, which has no content", () => {
    expect(selectNextTaskType(2, "LISTENING", [])).toBeNull();
  });
});

describe("selectableTaskTypes", () => {
  it("offers Modul 2 reading tasks from the authored pool without generation", () => {
    expect(selectableTaskTypes(2, "READING", false).length).toBe(4);
  });

  it("offers nothing for a module with neither variants nor generation", () => {
    expect(selectableTaskTypes(4, "READING", false)).toEqual([]);
  });

  it("offers the module's composition once generation is available", () => {
    expect(selectableTaskTypes(3, "SPEAKING", true)).toEqual([
      "speaking_prepared_topic",
      "speaking_picture_preference",
    ]);
  });
});
