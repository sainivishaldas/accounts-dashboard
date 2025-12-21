import { useState, useMemo } from "react";
import {
  Wallet,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ResidentsTable } from "@/components/dashboard/ResidentsTable";
import { NewCaseDialog } from "@/components/dashboard/NewCaseDialog";
import { useResidents, useDashboardStats } from "@/hooks/useSupabase";
import { toast } from "sonner";
import type { ResidentWithRelations } from "@/types/database";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentWithRelations | null>(null);

  const { data: residents = [], isLoading: residentsLoading } = useResidents();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = residentsLoading || statsLoading;

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          resident.name.toLowerCase().includes(query) ||
          resident.resident_id.toLowerCase().includes(query) ||
          (resident.property?.name || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // City filter
      if (cityFilter && resident.property?.city !== cityFilter) return false;

      // Property filter
      if (propertyFilter && resident.property?.name !== propertyFilter) return false;

      // Status filter
      if (statusFilter && resident.repayment_status !== statusFilter) return false;

      return true;
    });
  }, [residents, searchQuery, cityFilter, propertyFilter, statusFilter]);

  const handleExport = (format: "csv" | "excel") => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`, {
      description: "Your download will start shortly.",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DashboardHeader
        title="Accounting Dashboard"
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Disbursed"
            value={formatCurrency(stats?.total_disbursed || 0)}
            subtitle="Advance rent to Truliv"
            icon={Wallet}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Pending Disbursement"
            value={formatCurrency(stats?.total_collected || 0)}
            subtitle="Onboarding pending for disbursement"
            icon={TrendingUp}
            variant="success"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Active Residents"
            value={stats?.active_count || 0}
            subtitle={`${stats?.on_time_count || 0} Ontime • ${stats?.overdue_count || 0} Overdue`}
            icon={Clock}
          />
          <StatCard
            title="Total Residents"
            value={stats?.total_residents || 0}
            subtitle={`${stats?.active_count || 0} active • ${stats?.inactive_count || 0} inactive`}
            icon={Users}
          />
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.on_time_count || 0}</p>
              <p className="text-sm text-muted-foreground">On-time payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.advance_count || 0}</p>
              <p className="text-sm text-muted-foreground">Advance payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.overdue_count || 0}</p>
              <p className="text-sm text-muted-foreground">Overdue accounts</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          onSearch={setSearchQuery}
          onCityFilter={setCityFilter}
          onPropertyFilter={setPropertyFilter}
          onStatusFilter={setStatusFilter}
          onExport={handleExport}
          onNewCase={() => setIsNewCaseDialogOpen(true)}
        />

        {/* Master Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Disbursed Cases</h2>
            <p className="text-sm text-muted-foreground">
              {filteredResidents.length} of {residents.length} residents
            </p>
          </div>
          <ResidentsTable
            residents={filteredResidents}
            onEditResident={(resident) => {
              setEditingResident(resident);
              setIsNewCaseDialogOpen(true);
            }}
          />
        </div>
        </div>

        {/* New/Edit Case Dialog */}
        <NewCaseDialog
          open={isNewCaseDialogOpen}
          onOpenChange={(open) => {
            setIsNewCaseDialogOpen(open);
            if (!open) {
              setEditingResident(null);
            }
          }}
          resident={editingResident}
        />
      </div>
      )}
    </div>
  );
};

export default Index;
