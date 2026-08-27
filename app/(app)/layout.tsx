import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

const AppLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await auth();

  return (
    <div className="flex flex-1 h-screen">
      <Sidebar userEmail={session?.user?.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
