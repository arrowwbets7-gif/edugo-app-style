import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import EduGoAIChat from "@/components/EduGoAIChat";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role === "teacher" || role === "admin") {
    return <TeacherDashboard />;
  }

  return (
    <>
      <StudentDashboard />
      <EduGoAIChat />
    </>
  );
};

export default Dashboard;
