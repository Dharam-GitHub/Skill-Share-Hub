import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  onClick?: () => void;
}

export function CategoryCard({ icon, title, count, onClick }: CategoryCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Card 
      className={`text-center transition-all duration-200 cursor-pointer ${
        isHovering ? "translate-y-[-4px] shadow-lg" : ""
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`rounded-full p-4 mx-auto mb-4 h-16 w-16 flex items-center justify-center ${
          title === "Programming" ? "bg-blue-100" : 
          title === "Design" ? "bg-purple-100" : 
          title === "Data Science" ? "bg-green-100" : 
          title === "DevOps" ? "bg-yellow-100" : "bg-gray-100"
        }`}>
          {icon}
        </div>
        <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{count} sessions</p>
      </CardContent>
    </Card>
  );
}
