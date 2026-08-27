import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });
const [,, category, taskType, taskNumber] = process.argv;
const { data, error } = await supabase
  .from("Task")
  .select("taskNumber, title, source")
  .eq("moduleId", 2)
  .eq("category", category)
  .eq("taskType", taskType)
  .eq("taskNumber", Number(taskNumber))
  .maybeSingle();
if (error) { console.error(error.message); process.exit(1); }
console.log(`${category}/${taskType}#${taskNumber}: ${data ? `EXISTS (${data.source})` : "MISSING"}`);
