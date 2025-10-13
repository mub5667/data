import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Plus, Users } from "lucide-react";

export default function BonusPage() {
  const navigate = useNavigate();

  const bonusOptions = [
    {
      title: "Claimed Bonuses",
      description: "View and manage claimed bonus records",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      path: "/bonus/claimed"
    },
    {
      title: "Not Claimed Bonuses",
      description: "View and manage not claimed bonus records",
      icon: <XCircle className="h-8 w-8 text-amber-500" />,
      path: "/bonus/not-claimed"
    },
    {
      title: "Add Bonus",
      description: "Add new bonus records for students",
      icon: <Plus className="h-8 w-8 text-blue-500" />,
      path: "/bonus/add"
    },
    {
      title: "Agents",
      description: "Manage agent bonus records",
      icon: <Users className="h-8 w-8 text-purple-500" />,
      path: "/bonus/agents"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">BONUS 2024</h1>
        <p className="text-muted-foreground mt-2">Manage bonus records for students and agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bonusOptions.map((option, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(option.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">{option.title}</CardTitle>
              {option.icon}
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">{option.description}</CardDescription>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(option.path);
                }}
              >
                View {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
