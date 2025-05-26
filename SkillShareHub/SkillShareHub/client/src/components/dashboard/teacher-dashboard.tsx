import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { SessionTable } from "@/components/session-table";
import { CreateSessionModal } from "@/components/ui/create-session-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar } from "lucide-react";
import { Session } from "@shared/schema";

export function TeacherDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const { 
    data: sessions, 
    isLoading,
    error 
  } = useQuery<Session[]>({
    queryKey: ["/api/sessions/teaching"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        <p>Error loading sessions: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher Dashboard</h2>
            <p className="text-gray-600 mb-4">Manage your skill sessions and track learner enrollments.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              View Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Sessions Stat */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{sessions?.length || 0}</p>
            <p className="text-sm text-green-500 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>23% from last month</span>
            </p>
          </div>
        </div>
        
        {/* Students Stat */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Total Students</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {sessions?.reduce((acc, session) => acc + session.enrolledCount, 0) || 0}
            </p>
            <p className="text-sm text-green-500 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>12% from last month</span>
            </p>
          </div>
        </div>
        
        {/* Hours Stat */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Hours Taught</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {sessions?.reduce((acc, session) => acc + session.duration, 0) || 0}
            </p>
            <p className="text-sm text-green-500 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>18% from last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Teacher's Session List */}
      <SessionTable 
        sessions={sessions || []} 
        teacherMode={true}
        onEdit={(session) => {
          setSelectedSession(session);
          setIsCreateModalOpen(true);
        }}
      />

      <CreateSessionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedSession(null);
        }} 
      />
    </div>
  );
}
