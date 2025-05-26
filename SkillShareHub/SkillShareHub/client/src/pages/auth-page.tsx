import { useEffect } from "react";
import { useLocation } from "wouter";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Auth Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">SkillShare Hub</h1>
            <p className="mt-2 text-sm text-gray-600">
              Connect with teachers and learners from around the world
            </p>
          </div>
          
          <AuthForm />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-2xl text-center">
            <h2 className="text-4xl font-bold mb-4">
              Learn new skills from expert teachers
            </h2>
            <p className="text-lg opacity-90 mb-8">
              SkillShare Hub connects passionate teachers with eager learners through interactive online sessions. 
              Browse through hundreds of skills, book sessions with expert instructors, and level up your abilities today.
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12">
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm opacity-80">Active Sessions</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">200+</div>
                <div className="text-sm opacity-80">Expert Teachers</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm opacity-80">Skill Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
