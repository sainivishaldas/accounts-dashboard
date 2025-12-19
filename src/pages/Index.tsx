import { useState, useMemo } from "react";
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ResidentsTable } from "@/components/dashboard/ResidentsTable";
import { residents, getSummaryStats } from "@/data/mockData";
import { toast } from "sonner";

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

  const stats = getSummaryStats();

  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          resident.name.toLowerCase().includes(query) ||
          resident.id.toLowerCase().includes(query) ||
          resident.propertyName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // City filter
      if (cityFilter && resident.city !== cityFilter) return false;

      // Property filter
      if (propertyFilter && resident.propertyName !== propertyFilter) return false;

      // Status filter
      if (statusFilter && resident.repaymentStatus !== statusFilter) return false;

      return true;
    });
  }, [searchQuery, cityFilter, propertyFilter, statusFilter]);

  const handleExport = (format: "csv" | "excel") => {
    toast.success(`Exporting data as ${format.toUpperCase()}...`, {
      description: "Your download will start shortly.",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Accounting Dashboard" 
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Disbursed"
            value={formatCurrency(stats.totalDisbursed)}
            subtitle="Advance rent to Truliv"
            icon={Wallet}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Pending Disbursement"
            value={formatCurrency(stats.totalCollected)}
            subtitle="Onboarding pending for disbursement"
            icon={TrendingUp}
            variant="success"
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Active Residents"
            value={stats.activeCount}
            subtitle={`${stats.onTimeCount} Ontime • ${stats.overdueCount} Overdue`}
            icon={Clock}
          />
          <StatCard
            title="Total Residents"
            value={stats.totalResidents}
            subtitle={`${stats.activeCount} active • ${stats.inactiveCount} inactive`}
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
              <p className="text-2xl font-bold">{stats.onTimeCount}</p>
              <p className="text-sm text-muted-foreground">On-time payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.advanceCount}</p>
              <p className="text-sm text-muted-foreground">Advance payments</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.overdueCount}</p>
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
        />

        {/* Master Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Disbursed Cases</h2>
            <p className="text-sm text-muted-foreground">
              {filteredResidents.length} of {residents.length} residents
            </p>
          </div>
          <ResidentsTable residents={filteredResidents} />
        </div>
      </div>
    </div>
  );
};

export default Index;
