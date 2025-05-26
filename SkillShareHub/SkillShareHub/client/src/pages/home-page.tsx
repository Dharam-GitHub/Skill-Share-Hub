import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { LearnerDashboard } from "@/components/dashboard/learner-dashboard";

export default function HomePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search functionality
  };

  const isTeacher = user?.role === "teacher";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isTeacher ? <TeacherDashboard /> : <LearnerDashboard />}
      </main>
    </div>
  );
}
