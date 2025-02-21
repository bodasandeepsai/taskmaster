import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardContent from "@/components/DashboardContent";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
