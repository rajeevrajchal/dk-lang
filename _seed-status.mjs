import { createClient } from "@supabase/supabase-js";

const MODULE_ID = 2;
const CATEGORY = "READING";
const TASK_TYPES = [
  "reading_task_1_matching",
  "reading_task_2_wrong_sentence",
  "reading_task_3_missing_words",
  "reading_task_4_people_matching",
];
const TASK_NUMBERS = [1, 4, 7, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40, 42, 44, 46, 48, 49, 50];
const TOTAL = TASK_TYPES.length * TASK_NUMBERS.length;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from("Task")
  .select("taskType, taskNumber, source")
  .eq("moduleId", MODULE_ID)
  .eq("category", CATEGORY)
  .in("taskType", TASK_TYPES)
  .in("taskNumber", TASK_NUMBERS);

if (error) {
  console.error("query failed:", error.message);
  process.exit(1);
}

const byType = Object.fromEntries(TASK_TYPES.map((t) => [t, new Set()]));
for (const row of data) {
  byType[row.taskType]?.add(row.taskNumber);
}

let done = 0;
for (const t of TASK_TYPES) {
  const have = byType[t].size;
  done += have;
  console.log(`${t}: ${have}/${TASK_NUMBERS.length}`);
}
console.log(`TOTAL: ${done}/${TOTAL}`);
