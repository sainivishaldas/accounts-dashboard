import { useState } from "react";
import { X, FileText, MapPin, Phone, Mail, Calendar, Download, Building2, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddTransactionDialog } from "./AddTransactionDialog";
import type { ResidentWithRelations } from "@/types/database";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateResident } from "@/lib/permissions";

interface ResidentDetailsPanelProps {
  resident: ResidentWithRelations;
  onClose: () => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ResidentDetailsPanel({ resident, onClose }: ResidentDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("disbursements");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const { userRole } = useAuth();

  const totalCollected = resident.repayments
    .filter((r) => r.status === "paid" || r.status === "advance")
    .reduce((sum, r) => sum + Number(r.amount_paid), 0);

  const outstanding = Number(resident.total_advance_disbursed) - totalCollected;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card shadow-elevated animate-slide-in-right overflow-hidden flex flex-col border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-6 py-5 bg-card">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{resident.name}</h2>
              <StatusBadge status={resident.repayment_status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {resident.resident_id} • {resident.property?.name || 'N/A'}
            </p>
          </div>
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-4xl shrink-0">
            {resident.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-muted/30">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Package Amount</p>
            <p className="text-lg font-semibold amount">{formatCurrency(Number(resident.monthly_rent))}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Disbursed</p>
            <p className="text-lg font-semibold amount amount-positive">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Disbursement Pending</p>
            <p className={`text-lg font-semibold amount ${outstanding > 0 ? "amount-negative" : "amount-positive"}`}>
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6 h-12">
            <TabsTrigger value="disbursements" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Disbursements
            </TabsTrigger>
            <TabsTrigger value="repayments" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Repayments
            </TabsTrigger>
            <TabsTrigger value="property" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Property Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Disbursements Tab */}
          <TabsContent value="disbursements" className="p-6 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Disbursement Schedule</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={resident.disbursement_status} />
                {canCreateResident(userRole) && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddTransaction(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>UTR Number</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {resident.disbursements.map((d) => (
                    <tr key={d.id}>
                      <td>{format(new Date(d.date), "MMM d, yyyy")}</td>
                      <td className="amount font-medium">{formatCurrency(Number(d.amount))}</td>
                      <td className="font-mono text-xs text-muted-foreground">{d.utr_number}</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted">
                          {d.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td>Total</td>
                    <td className="amount">{formatCurrency(Number(resident.total_advance_disbursed))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          {/* Repayments Tab */}
          <TabsContent value="repayments" className="p-6 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Monthly Repayment Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Monthly Rent: <span className="font-medium amount">{formatCurrency(Number(resident.monthly_rent))}</span>
              </p>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {resident.repayments.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.month}</td>
                      <td>{format(new Date(r.due_date), "MMM d, yyyy")}</td>
                      <td className="amount">{formatCurrency(Number(r.rent_amount))}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-muted-foreground">
                        {r.actual_payment_date ? format(new Date(r.actual_payment_date), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Property Details Tab */}
          <TabsContent value="property" className="p-6 space-y-6 mt-0">
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Property Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Property Name</p>
                  <p className="font-medium">{resident.property?.name || 'N/A'}</p>
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Room / Unit</p>
                  <p className="font-medium">{resident.room_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{resident.property?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Lease Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{resident.lease_start_date ? format(new Date(resident.lease_start_date), "MMM d, yyyy") : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{resident.lease_end_date ? format(new Date(resident.lease_end_date), "MMM d, yyyy") : 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Lock-in Period</p>
                  <p className="font-medium">{resident.lock_in_period} months</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Relationship Manager</p>
                  <p className="font-medium">{resident.relationship_manager || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {resident.rm_contact || 'N/A'}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Property Manager</p>
                  <p className="font-medium">{resident.property_manager || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {resident.pm_contact || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Resident Contact</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {resident.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {resident.phone}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6 space-y-4 mt-0">
            <h3 className="font-medium">Documents & Agreements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">Rent Agreement</p>
                  <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        residentId={resident.id}
      />
    </div>
  );
}
