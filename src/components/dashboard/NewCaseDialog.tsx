import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProperties, useCreateResident, useUpdateResident } from "@/hooks/useSupabase";
import type { ResidentInsert, ResidentWithRelations } from "@/types/database";

interface NewCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: ResidentWithRelations | null;
}

interface CaseFormData {
  resident_id: string;
  name: string;
  email: string;
  phone: string;
  property_id: string;
  room_number: string;
  relationship_manager: string;
  rm_contact: string;
  lease_start_date: Date | null;
  lease_end_date: Date | null;
  lock_in_period: number;
  monthly_rent: number;
  security_deposit: number;
  total_advance_disbursed: number;
  disbursement_status: "fully_disbursed" | "partial";
  repayment_status: "on_time" | "overdue" | "advance_paid";
  current_status: "active" | "move_out" | "early_move_out" | "extended";
}

export function NewCaseDialog({ open, onOpenChange, resident }: NewCaseDialogProps) {
  const { data: properties = [] } = useProperties();
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();

  const isEditing = !!resident;

  const [leaseStartDate, setLeaseStartDate] = useState<Date | undefined>();
  const [leaseEndDate, setLeaseEndDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CaseFormData>({
    defaultValues: {
      disbursement_status: "partial",
      repayment_status: "on_time",
      current_status: "active",
      lock_in_period: 0,
      monthly_rent: 0,
      security_deposit: 0,
      total_advance_disbursed: 0,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (resident && open) {
      setValue("resident_id", resident.resident_id);
      setValue("name", resident.name);
      setValue("email", resident.email || "");
      setValue("phone", resident.phone || "");
      setValue("property_id", resident.property_id || "");
      setValue("room_number", resident.room_number || "");
      setValue("relationship_manager", resident.relationship_manager || "");
      setValue("rm_contact", resident.rm_contact || "");
      setValue("lock_in_period", resident.lock_in_period || 0);
      setValue("monthly_rent", resident.monthly_rent || 0);
      setValue("security_deposit", resident.security_deposit || 0);
      setValue("total_advance_disbursed", resident.total_advance_disbursed || 0);
      setValue("disbursement_status", resident.disbursement_status);
      setValue("repayment_status", resident.repayment_status);
      setValue("current_status", resident.current_status);

      if (resident.lease_start_date) {
        setLeaseStartDate(new Date(resident.lease_start_date));
      }
      if (resident.lease_end_date) {
        setLeaseEndDate(new Date(resident.lease_end_date));
      }
    } else if (!open) {
      reset();
      setLeaseStartDate(undefined);
      setLeaseEndDate(undefined);
    }
  }, [resident, open, setValue, reset]);

  const onSubmit = async (data: CaseFormData) => {
    try {
      const residentData: ResidentInsert = {
        resident_id: data.resident_id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        property_id: data.property_id || null,
        room_number: data.room_number || null,
        relationship_manager: data.relationship_manager || null,
        rm_contact: data.rm_contact || null,
        lease_start_date: leaseStartDate ? format(leaseStartDate, "yyyy-MM-dd") : null,
        lease_end_date: leaseEndDate ? format(leaseEndDate, "yyyy-MM-dd") : null,
        lock_in_period: Number(data.lock_in_period) || 0,
        monthly_rent: Number(data.monthly_rent) || 0,
        security_deposit: Number(data.security_deposit) || 0,
        total_advance_disbursed: Number(data.total_advance_disbursed) || 0,
        disbursement_status: data.disbursement_status,
        repayment_status: data.repayment_status,
        current_status: data.current_status,
      };

      if (isEditing && resident) {
        await updateResident.mutateAsync({ id: resident.id, updates: residentData });
      } else {
        await createResident.mutateAsync(residentData);
      }

      reset();
      setLeaseStartDate(undefined);
      setLeaseEndDate(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} case:`, error);
    }
  };

  const handleClose = () => {
    reset();
    setLeaseStartDate(undefined);
    setLeaseEndDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Case' : 'Add New Case'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the resident case details and lease information.'
              : 'Create a new resident case with their details and lease information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resident_id">Resident ID *</Label>
                <Input
                  id="resident_id"
                  {...register("resident_id", { required: "Resident ID is required" })}
                  placeholder="e.g., RES001"
                />
                {errors.resident_id && (
                  <p className="text-sm text-destructive">{errors.resident_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Property Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_id">Property</Label>
                <Select
                  onValueChange={(value) => setValue("property_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} - {property.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  {...register("room_number")}
                  placeholder="e.g., 101"
                />
              </div>
            </div>
          </div>

          {/* Relationship Manager */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Relationship Manager</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_manager">Manager Name</Label>
                <Input
                  id="relationship_manager"
                  {...register("relationship_manager")}
                  placeholder="Manager name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rm_contact">Manager Contact</Label>
                <Input
                  id="rm_contact"
                  {...register("rm_contact")}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Lease Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaseStartDate ? format(leaseStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={leaseStartDate}
                      onSelect={setLeaseStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Lease End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {leaseEndDate ? format(leaseEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={leaseEndDate}
                      onSelect={setLeaseEndDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lock_in_period">Lock-in Period (months)</Label>
                <Input
                  id="lock_in_period"
                  type="number"
                  {...register("lock_in_period")}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_status">Current Status</Label>
                <Select
                  defaultValue="active"
                  onValueChange={(value: any) => setValue("current_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="move_out">Move Out</SelectItem>
                    <SelectItem value="early_move_out">Early Move Out</SelectItem>
                    <SelectItem value="extended">Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Monthly Rent (₹)</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  {...register("monthly_rent")}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                <Input
                  id="security_deposit"
                  type="number"
                  {...register("security_deposit")}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_advance_disbursed">Total Advance Disbursed (₹)</Label>
                <Input
                  id="total_advance_disbursed"
                  type="number"
                  {...register("total_advance_disbursed")}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disbursement_status">Disbursement Status</Label>
                <Select
                  defaultValue="partial"
                  onValueChange={(value: any) => setValue("disbursement_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="fully_disbursed">Fully Disbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repayment_status">Repayment Status</Label>
                <Select
                  defaultValue="on_time"
                  onValueChange={(value: any) => setValue("repayment_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_time">On Time</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="advance_paid">Advance Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createResident.isPending || updateResident.isPending}>
              {(createResident.isPending || updateResident.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Case' : 'Create Case'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
