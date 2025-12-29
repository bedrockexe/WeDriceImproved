import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass,
  iconColorClass,
  valueColorClass
}) => {
  return (
    <Card className={cn("p-6 relative overflow-hidden", colorClass)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <p className={cn("text-4xl font-bold mb-1", valueColorClass)}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconColorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
