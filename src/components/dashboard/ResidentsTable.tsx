import { useState, useEffect } from "react";
import { ChevronRight, ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResidentDetailsPanel } from "./ResidentDetailsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { canEditResident } from "@/lib/permissions";
import type { ResidentWithRelations } from "@/types/database";
import { format } from "date-fns";

interface ResidentsTableProps {
  residents: ResidentWithRelations[];
  onEditResident?: (resident: ResidentWithRelations) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortField = "name" | "monthly_rent" | "lease_start_date" | "lease_end_date" | "repayment_status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, 500];

export function ResidentsTable({ residents, onEditResident }: ResidentsTableProps) {
  const [selectedResident, setSelectedResident] = useState<ResidentWithRelations | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);

  const { userRole } = useAuth();

  // Update selectedResident when residents data changes (e.g., after adding a transaction)
  useEffect(() => {
    if (selectedResident) {
      const updatedResident = residents.find(r => r.id === selectedResident.id);
      if (updatedResident) {
        setSelectedResident(updatedResident);
      }
    }
  }, [residents, selectedResident?.id]);

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
      case "monthly_rent":
        comparison = Number(a.monthly_rent) - Number(b.monthly_rent);
        break;
      case "lease_start_date":
        comparison = new Date(a.lease_start_date || 0).getTime() - new Date(b.lease_start_date || 0).getTime();
        break;
      case "lease_end_date":
        comparison = new Date(a.lease_end_date || 0).getTime() - new Date(b.lease_end_date || 0).getTime();
        break;
      case "repayment_status":
        comparison = a.repayment_status.localeCompare(b.repayment_status);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedResidents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResidents = sortedResidents.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

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
                  <SortHeader field="lease_start_date">Lease Start</SortHeader>
                </th>
                <th>
                  <SortHeader field="lease_end_date">Lease End</SortHeader>
                </th>
                <th>
                  <SortHeader field="monthly_rent">Package Amount</SortHeader>
                </th>
                <th>Disbursement</th>
                <th>Current Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedResidents.map((resident) => (
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
                      <p className="text-xs text-muted-foreground">{resident.resident_id}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium">{resident.property?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{resident.room_number}</p>
                    </div>
                  </td>
                  <td>{resident.property?.city || 'N/A'}</td>
                  <td>
                    <p className="text-sm">{resident.lease_start_date ? format(new Date(resident.lease_start_date), "MMM d, yyyy") : 'N/A'}</p>
                  </td>
                  <td>
                    <p className="text-sm">{resident.lease_end_date ? format(new Date(resident.lease_end_date), "MMM d, yyyy") : 'N/A'}</p>
                  </td>
                  <td className="amount font-medium">{formatCurrency(Number(resident.monthly_rent))}</td>
                  <td>
                    <StatusBadge status={resident.disbursement_status} />
                  </td>
                  <td>
                    <StatusBadge status={resident.current_status} />
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditResident && canEditResident(userRole) && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onEditResident(resident);
                          }}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Case
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setSelectedResident(resident)}>
                          View Details
                        </DropdownMenuItem>
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
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{startIndex + 1}-{Math.min(startIndex + pageSize, sortedResidents.length)}</span> of <span className="font-medium">{sortedResidents.length}</span> residents
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
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
