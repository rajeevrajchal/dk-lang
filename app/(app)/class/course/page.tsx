import { redirect } from "next/navigation";

// The Danish course moved to its own area. This stub keeps every link and
// bookmark that pointed at /class/course working — the restructure changed
// where the course lives, not whether old URLs resolve.
const CourseRedirect = () => {
  redirect("/lessons");
};

export default CourseRedirect;
