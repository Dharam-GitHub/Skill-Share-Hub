import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, Clock, Users } from "lucide-react";

interface SessionCardProps {
  session: Session;
  booked?: boolean;
}

export function SessionCard({ session, booked = false }: SessionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const bookSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      setIsLoading(true);
      const response = await apiRequest("POST", `/api/sessions/${sessionId}/book`, {});
      return response.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Session booked",
        description: "You have successfully booked this session.",
      });
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSkillCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      "Programming": "bg-blue-100 text-blue-800",
      "Design": "bg-purple-100 text-purple-800",
      "Data Science": "bg-green-100 text-green-800",
      "DevOps": "bg-yellow-100 text-yellow-800",
      "Soft Skills": "bg-red-100 text-red-800",
    };
    
    return categories[category] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleBookSession = () => {
    bookSessionMutation.mutate(session.id);
  };

  const getButtonState = () => {
    if (booked) {
      return (
        <Button className="w-full" variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Already Booked
        </Button>
      );
    } else if (session.enrolledCount >= session.capacity) {
      return (
        <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
          <Clock className="mr-2 h-4 w-4" />
          Join Waitlist
        </Button>
      );
    } else {
      return (
        <Button 
          className="w-full" 
          onClick={handleBookSession}
          disabled={isLoading}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Book Session
        </Button>
      );
    }
  };

  const getTeacherInitials = () => {
    const names = session.teacherName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`;
    }
    return names[0].charAt(0);
  };

  return (
    <Card className="overflow-hidden h-full transition-transform hover:translate-y-[-4px] hover:shadow-lg">
      <div className="relative">
        <img 
          className="h-48 w-full object-cover" 
          src={`https://source.unsplash.com/random/300x200/?${session.skillCategory.toLowerCase()}`} 
          alt={session.title} 
        />
        <div className="absolute top-0 right-0 mt-3 mr-3 bg-white bg-opacity-90 rounded-full p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-2">
          <Badge className={getSkillCategoryColor(session.skillCategory)}>
            {session.skillCategory}
          </Badge>
          <span className="text-sm text-gray-500">{formatDate(session.date)}</span>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 mb-1">{session.title}</h4>
        <p className="text-gray-600 text-sm mb-4">{session.description}</p>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 bg-primary text-white mr-2">
            <AvatarFallback>{getTeacherInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{session.teacherName}</p>
            <p className="text-xs text-gray-500">{session.teacherTitle}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <Users className="inline-block mr-1 h-4 w-4" />
            <span>{session.enrolledCount} / {session.capacity} enrolled</span>
          </div>
          <div className="text-sm text-gray-500">
            <Clock className="inline-block mr-1 h-4 w-4" />
            <span>{session.duration} {session.duration === 1 ? 'hour' : 'hours'}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0">
        {getButtonState()}
      </CardFooter>
    </Card>
  );
}
