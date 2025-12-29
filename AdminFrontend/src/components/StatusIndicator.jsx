import { cn } from "@/lib/utils";

const statusConfig = {
  completed: {
    color: "bg-stat-green",
    dotColor: "bg-stat-green",
    label: "Completed"
  },
  paid: {
    color: "bg-stat-green",
    dotColor: "bg-stat-green",
    label: "Paid"
  },
  cancelled: {
    color: "bg-stat-red",
    dotColor: "bg-stat-red",
    label: "Cancelled"
  },
  pending: {
    color: "bg-stat-orange",
    dotColor: "bg-stat-orange",
    label: "Pending"
  },
  refunded: {
    color: "bg-stat-pink",
    dotColor: "bg-stat-pink",
    label: "Refunded"
  }
};

export const StatusIndicator = ({ status, label, showDot = true }) => {
  const config = statusConfig[status.toLowerCase()];
  const displayLabel = label || config.label;

  return (
    <div className="inline-flex items-center gap-2">
      {showDot && (
        <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      )}
      <span className="text-sm font-medium">{displayLabel}</span>
    </div>
  );
};
