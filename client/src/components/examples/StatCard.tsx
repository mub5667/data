import { StatCard } from "../StatCard";
import { Users } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="w-80">
      <StatCard
        title="Total Users"
        value="1,234"
        icon={Users}
        description="Active users this month"
      />
    </div>
  );
}
