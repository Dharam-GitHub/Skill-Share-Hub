import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreateSessionModal } from "@/components/ui/create-session-modal";
import { Edit, Trash, Pencil } from "lucide-react";

interface SessionTableProps {
  sessions: Session[];
  teacherMode?: boolean;
  onEdit?: (session: Session) => void;
}

export function SessionTable({ sessions, teacherMode = false, onEdit }: SessionTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("DELETE", `/api/sessions/${sessionId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "Session deleted",
        description: "The session has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSession) {
      deleteSessionMutation.mutate(selectedSession.id);
    }
  };

  const handleEdit = (session: Session) => {
    if (onEdit) {
      onEdit(session);
    }
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

  const getStatusBadge = (session: Session) => {
    if (session.enrolledCount >= session.capacity) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Full
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          Active
        </Badge>
      );
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {teacherMode ? "Your Sessions" : "Upcoming Sessions"}
          </h3>
          {teacherMode && (
            <Button 
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {teacherMode ? "Session Name" : "Session"}
                </TableHead>
                <TableHead>
                  {teacherMode ? "Skill" : "Teacher"}
                </TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>
                  {teacherMode ? "Enrolled / Capacity" : "Duration"}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {teacherMode ? (
                        <div className="font-medium text-gray-900">{session.title}</div>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{session.title}</div>
                            <div className="text-sm text-gray-500">{session.skillCategory}</div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {teacherMode ? (
                        <div className="text-sm text-gray-500">{session.skillCategory}</div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-900">{session.teacherName}</div>
                          <div className="text-sm text-gray-500">{session.teacherTitle}</div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(session.date)}</div>
                    </TableCell>
                    <TableCell>
                      {teacherMode ? (
                        <div className="text-sm text-gray-500">
                          {session.enrolledCount} / {session.capacity}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {session.duration} {session.duration === 1 ? 'hour' : 'hours'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session)}
                    </TableCell>
                    <TableCell className="text-right">
                      {teacherMode ? (
                        <div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(session)}
                            className="mr-1"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(session)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Button variant="link" className="text-primary hover:text-primary-dark mr-2">
                            View Details
                          </Button>
                          <Button variant="link" className="text-red-600 hover:text-red-800">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="text-muted-foreground">
                      {teacherMode 
                        ? "You haven't created any sessions yet" 
                        : "No upcoming sessions"
                      }
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{Math.min(sessions.length, 10)}</span> of{" "}
            <span className="font-medium">{sessions.length}</span> sessions
          </div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Button variant="outline" size="sm" className="rounded-l-md">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-r-md">
              Next
            </Button>
          </nav>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session{" "}
              <span className="font-semibold">{selectedSession?.title}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateSessionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}
