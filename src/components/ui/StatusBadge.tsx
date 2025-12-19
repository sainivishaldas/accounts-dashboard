import { cn } from "@/lib/utils";
import type { PaymentStatus, DisbursementStatus, RepaymentStatus, CurrentStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: PaymentStatus | DisbursementStatus | RepaymentStatus | CurrentStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  // Payment Status
  paid: { label: "Paid", className: "status-paid", icon: "🟢" },
  pending: { label: "Pending", className: "status-pending", icon: "⏳" },
  failed: { label: "Failed", className: "status-overdue", icon: "🔴" },
  advance: { label: "Advance Paid", className: "status-advance", icon: "🟡" },
  
  // Disbursement Status
  fully_disbursed: { label: "Fully Disbursed", className: "status-paid", icon: "✓" },
  partial: { label: "Partial", className: "status-advance", icon: "◐" },
  
  // Repayment Status
  on_time: { label: "On Time", className: "status-paid", icon: "🟢" },
  overdue: { label: "Overdue", className: "status-overdue", icon: "🔴" },
  advance_paid: { label: "Advance Paid", className: "status-advance", icon: "🟡" },
  
  // Current Status
  active: { label: "Active", className: "status-paid", icon: "🟢" },
  move_out: { label: "Move-out", className: "status-pending", icon: "🔵" },
  early_move_out: { label: "Early Move-out", className: "status-overdue", icon: "🔴" },
  extended: { label: "Extended with Truliv", className: "status-advance", icon: "🟡" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "status-pending", icon: "•" };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      config.className,
      className
    )}>
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
