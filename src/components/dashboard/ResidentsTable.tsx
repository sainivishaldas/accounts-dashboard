import { useState } from "react";
import { ChevronRight, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResidentDetailsPanel } from "./ResidentDetailsPanel";
import type { Resident } from "@/data/mockData";
import { format } from "date-fns";

interface ResidentsTableProps {
  residents: Resident[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortField = "name" | "monthlyRent" | "totalAdvanceDisbursed" | "leaseStartDate" | "repaymentStatus";
type SortDirection = "asc" | "desc";

export function ResidentsTable({ residents }: ResidentsTableProps) {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedResidents = [...residents].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "monthlyRent":
        comparison = a.monthlyRent - b.monthlyRent;
        break;
      case "totalAdvanceDisbursed":
        comparison = a.totalAdvanceDisbursed - b.totalAdvanceDisbursed;
        break;
      case "leaseStartDate":
        comparison = new Date(a.leaseStartDate).getTime() - new Date(b.leaseStartDate).getTime();
        break;
      case "repaymentStatus":
        comparison = a.repaymentStatus.localeCompare(b.repaymentStatus);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === field ? "text-primary" : "text-muted-foreground/50"}`} />
    </button>
  );

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="finance-table">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th>
                  <SortHeader field="name">Resident</SortHeader>
                </th>
                <th>Property</th>
                <th>City</th>
                <th>
                  <SortHeader field="leaseStartDate">Lease Period</SortHeader>
                </th>
                <th>
                  <SortHeader field="monthlyRent">Monthly Rent</SortHeader>
                </th>
                <th>
                  <SortHeader field="totalAdvanceDisbursed">Disbursed</SortHeader>
                </th>
                <th>Disbursement</th>
                <th>
                  <SortHeader field="repaymentStatus">Repayment</SortHeader>
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sortedResidents.map((resident) => (
                <tr
                  key={resident.id}
                  onClick={() => setSelectedResident(resident)}
                  className="cursor-pointer group"
                >
                  <td>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </td>
                  <td>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{resident.name}</p>
                      <p className="text-xs text-muted-foreground">{resident.id}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium">{resident.propertyName}</p>
                      <p className="text-xs text-muted-foreground">{resident.roomNumber}</p>
                    </div>
                  </td>
                  <td>{resident.city}</td>
                  <td>
                    <div className="text-sm">
                      <p>{format(new Date(resident.leaseStartDate), "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">to {format(new Date(resident.leaseEndDate), "MMM d, yyyy")}</p>
                    </div>
                  </td>
                  <td className="amount font-medium">{formatCurrency(resident.monthlyRent)}</td>
                  <td className="amount font-medium">{formatCurrency(resident.totalAdvanceDisbursed)}</td>
                  <td>
                    <StatusBadge status={resident.disbursementStatus} />
                  </td>
                  <td>
                    <StatusBadge status={resident.repaymentStatus} />
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedResident(resident)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Download SOA</DropdownMenuItem>
                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{sortedResidents.length}</span> residents
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Panel Overlay */}
      {selectedResident && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedResident(null)}
          />
          <ResidentDetailsPanel
            resident={selectedResident}
            onClose={() => setSelectedResident(null)}
          />
        </>
      )}
    </>
  );
}
