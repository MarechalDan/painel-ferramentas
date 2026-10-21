import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { currentSession } from "@/lib/session";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar user={session.user} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
