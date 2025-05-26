import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Search, 
  User, 
  Settings, 
  LogOut,
  LayoutDashboard,
  BookOpen,
  Calendar
} from "lucide-react";

export function Navbar({ onSearch }: { onSearch?: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary">SkillShare Hub</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/sessions">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/sessions" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Sessions
                </a>
              </Link>
              <Link href="/bookings">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/bookings" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  My Bookings
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="pl-10 w-full"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 bg-primary text-white">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>SkillShare Hub</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-1">
                    <Link href="/">
                      <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location === "/" 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}>
                        <LayoutDashboard className="inline-block mr-2 h-5 w-5" />
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/sessions">
                      <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location === "/sessions" 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}>
                        <BookOpen className="inline-block mr-2 h-5 w-5" />
                        Sessions
                      </a>
                    </Link>
                    <Link href="/bookings">
                      <a className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location === "/bookings" 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}>
                        <Calendar className="inline-block mr-2 h-5 w-5" />
                        My Bookings
                      </a>
                    </Link>
                  </div>
                  
                  <div className="pt-4 pb-3 border-t border-gray-200 mt-4">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10 bg-primary text-white">
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user ? `${user.firstName} ${user.lastName}` : "User"}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {user?.email || "user@example.com"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                        Your Profile
                      </a>
                      <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                        Settings
                      </a>
                      <a 
                        href="#" 
                        onClick={handleLogout}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Sign out
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        className="pl-10 w-full"
                        placeholder="Search sessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
