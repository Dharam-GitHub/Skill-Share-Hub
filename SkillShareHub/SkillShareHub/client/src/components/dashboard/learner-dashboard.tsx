import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { SessionCard } from "@/components/ui/session-card";
import { CategoryCard } from "@/components/ui/category-card";
import { SessionTable } from "@/components/session-table";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Calendar } from "lucide-react";
import { Booking, Session } from "@shared/schema";

export function LearnerDashboard() {
  const { 
    data: recommendedSessions, 
    isLoading: isLoadingRecommended,
    error: recommendedError
  } = useQuery<Session[]>({
    queryKey: ["/api/sessions/recommended"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { 
    data: upcomingBookings, 
    isLoading: isLoadingBookings,
    error: bookingsError
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const categories = [
    { 
      title: "Programming", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>,
      count: 58
    },
    { 
      title: "Design", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>,
      count: 36
    },
    { 
      title: "Data Science", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>,
      count: 42
    },
    { 
      title: "DevOps", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>,
      count: 29
    }
  ];

  if (isLoadingRecommended || isLoadingBookings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (recommendedError || bookingsError) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        <p>Error loading data: {(recommendedError || bookingsError)?.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Learner Dashboard</h2>
            <p className="text-gray-600 mb-4">Find and book skill sessions that match your interests.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              My Learning
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Enrolled Sessions */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Enrolled Sessions</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{upcomingBookings?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {upcomingBookings && upcomingBookings.length > 0 
                ? `${upcomingBookings.length} upcoming ${upcomingBookings.length === 1 ? 'session' : 'sessions'}`
                : 'No upcoming sessions'
              }
            </p>
          </div>
        </div>

        {/* Skills Learning */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Skills Learning</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {new Set(upcomingBookings?.map(b => b.session.skillCategory)).size || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {upcomingBookings && upcomingBookings.length > 0 
                ? new Set(upcomingBookings.map(b => b.session.skillCategory)).size > 0 
                  ? Array.from(new Set(upcomingBookings.map(b => b.session.skillCategory))).join(', ')
                  : 'No skills yet'
                : 'No skills yet'
              }
            </p>
          </div>
        </div>

        {/* Learning Hours */}
        <div className="bg-white shadow rounded-lg p-6 flex items-start">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase leading-4">Learning Hours</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {upcomingBookings?.reduce((total, booking) => total + booking.session.duration, 0) || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {upcomingBookings && upcomingBookings.length > 0 
                ? `${upcomingBookings.length} ${upcomingBookings.length === 1 ? 'session' : 'sessions'} scheduled`
                : 'No hours scheduled'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Sessions */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended For You</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {recommendedSessions && recommendedSessions.length > 0 ? (
          recommendedSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <div className="col-span-3 text-center py-10 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-500">No recommended sessions available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back later or browse all available sessions.</p>
            <Button className="mt-4">Browse All Sessions</Button>
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Upcoming Sessions</h3>
      <SessionTable 
        sessions={upcomingBookings?.map(booking => booking.session) || []}
        teacherMode={false}
      />

      {/* Popular Skills Categories */}
      <h3 className="text-xl font-semibold text-gray-800 my-6">Popular Skill Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {categories.map((category, index) => (
          <CategoryCard 
            key={index}
            icon={category.icon}
            title={category.title}
            count={category.count}
          />
        ))}
      </div>
    </div>
  );
}
