import { useState, useRef } from "react";
import { X, FileText, MapPin, Phone, Mail, Calendar, Download, Building2, User, Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { EditDisbursementDialog } from "./EditDisbursementDialog";
import { AddRepaymentDialog } from "./AddRepaymentDialog";
import type { ResidentWithRelations, Disbursement, Repayment } from "@/types/database";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateResident } from "@/lib/permissions";
import { useUploadDocument, useDeleteDisbursement, useUpdateDisbursement, useCreateRepayment, useUpdateRepayment, useDeleteRepayment } from "@/hooks/useSupabase";
import { toast } from "sonner";

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
  const [showEditDisbursement, setShowEditDisbursement] = useState(false);
  const [editingDisbursement, setEditingDisbursement] = useState<Disbursement | null>(null);
  const [showAddRepayment, setShowAddRepayment] = useState(false);
  const [showEditRepayment, setShowEditRepayment] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState<Repayment | null>(null);
  const { userRole } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const uploadDocument = useUploadDocument();
  const deleteDisbursement = useDeleteDisbursement();
  const updateDisbursement = useUpdateDisbursement();
  const createRepayment = useCreateRepayment();
  const updateRepayment = useUpdateRepayment();
  const deleteRepayment = useDeleteRepayment();

  // Calculate total disbursed from actual disbursements
  const totalDisbursed = resident.disbursements
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const packageAmount = Number(resident.monthly_rent);
  const disbursementPending = packageAmount - totalDisbursed;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file,
        residentId: resident.id
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          <div className="relative group">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-3xl shrink-0">
              {resident.name.split(' ').map(n => n[0]).join('')}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  toast.info("Photo upload feature coming soon", {
                    description: `Selected: ${file.name}`
                  });
                }
                if (photoInputRef.current) {
                  photoInputRef.current.value = '';
                }
              }}
              className="hidden"
            />
            <button
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="h-6 w-6 text-white" />
            </button>
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
            <p className="text-lg font-semibold amount">{formatCurrency(packageAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Disbursed</p>
            <p className="text-lg font-semibold amount amount-positive">{formatCurrency(totalDisbursed)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Disbursement Pending</p>
            <p className={`text-lg font-semibold amount ${disbursementPending > 0 ? "amount-negative" : "amount-positive"}`}>
              {formatCurrency(disbursementPending)}
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
                    {canCreateResident(userRole) && <th className="w-20">Actions</th>}
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
                      {canCreateResident(userRole) && (
                        <td>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingDisbursement(d);
                                setShowEditDisbursement(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this transaction?')) {
                                  deleteDisbursement.mutate(d.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td>Total</td>
                    <td className="amount">{formatCurrency(totalDisbursed)}</td>
                    <td colSpan={canCreateResident(userRole) ? 3 : 2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>

          {/* Repayments Tab */}
          <TabsContent value="repayments" className="p-6 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Monthly Repayment Schedule</h3>
              {canCreateResident(userRole) && (
                <Button
                  size="sm"
                  onClick={() => setShowAddRepayment(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Repayment
                </Button>
              )}
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
                    {canCreateResident(userRole) && <th className="w-20">Actions</th>}
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
                      {canCreateResident(userRole) && (
                        <td>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingRepayment(r);
                                setShowEditRepayment(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this repayment?')) {
                                  deleteRepayment.mutate(r.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      )}
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
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Documents & Agreements</h3>
              {canCreateResident(userRole) && (
                <>
                  <Button
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadDocument.isPending}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {resident.documents && resident.documents.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {resident.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Upload Document" to add files</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        residentId={resident.id}
      />

      {/* Edit Disbursement Dialog */}
      {editingDisbursement && (
        <EditDisbursementDialog
          open={showEditDisbursement}
          onOpenChange={(open) => {
            setShowEditDisbursement(open);
            if (!open) setEditingDisbursement(null);
          }}
          disbursement={editingDisbursement}
        />
      )}

      {/* Add Repayment Dialog */}
      <AddRepaymentDialog
        open={showAddRepayment}
        onOpenChange={setShowAddRepayment}
        residentId={resident.id}
        mode="add"
      />

      {/* Edit Repayment Dialog */}
      {editingRepayment && (
        <AddRepaymentDialog
          open={showEditRepayment}
          onOpenChange={(open) => {
            setShowEditRepayment(open);
            if (!open) setEditingRepayment(null);
          }}
          residentId={resident.id}
          repayment={editingRepayment}
          mode="edit"
        />
      )}
    </div>
  );
}
