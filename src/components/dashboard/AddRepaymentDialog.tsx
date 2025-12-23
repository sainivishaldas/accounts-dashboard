import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { useCreateRepayment, useUpdateRepayment } from "@/hooks/useSupabase";
import type { Repayment, PaymentStatus, PaymentMode } from "@/types/database";

interface AddRepaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: string;
  repayment?: Repayment;
  mode: 'add' | 'edit';
}

const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'advance'];
const paymentModes: PaymentMode[] = ['Manual', 'NACH'];

export function AddRepaymentDialog({
  open,
  onOpenChange,
  residentId,
  repayment,
  mode,
}: AddRepaymentDialogProps) {
  const [month, setMonth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Manual");
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [actualPaymentDate, setActualPaymentDate] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const createRepayment = useCreateRepayment();
  const updateRepayment = useUpdateRepayment();

  useEffect(() => {
    if (mode === 'edit' && repayment) {
      setMonth(repayment.month);
      setDueDate(repayment.due_date);
      setRentAmount(repayment.rent_amount.toString());
      setPaymentMode(repayment.payment_mode);
      setStatus(repayment.status);
      setActualPaymentDate(repayment.actual_payment_date || "");
      setAmountPaid(repayment.amount_paid?.toString() || "");
    } else {
      resetForm();
    }
  }, [mode, repayment, open]);

  const resetForm = () => {
    setMonth("");
    setDueDate("");
    setRentAmount("");
    setPaymentMode("Manual");
    setStatus("pending");
    setActualPaymentDate("");
    setAmountPaid("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!month || !dueDate || !rentAmount) {
      return;
    }

    const repaymentData = {
      month,
      due_date: dueDate,
      rent_amount: parseFloat(rentAmount),
      payment_mode: paymentMode,
      status,
      actual_payment_date: actualPaymentDate || null,
      amount_paid: amountPaid ? parseFloat(amountPaid) : 0,
    };

    if (mode === 'edit' && repayment) {
      await updateRepayment.mutateAsync({
        id: repayment.id,
        updates: repaymentData,
      });
    } else {
      const repaymentId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createRepayment.mutateAsync({
        ...repaymentData,
        repayment_id: repaymentId,
        resident_id: residentId,
      });
    }

    onOpenChange(false);
    resetForm();
  };

  const isPending = mode === 'edit' ? updateRepayment.isPending : createRepayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Repayment' : 'Add Repayment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="text"
                placeholder="e.g., January 2024"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Rent Amount (₹)</Label>
              <Input
                id="rentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={(value) => setPaymentMode(value as PaymentMode)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid (₹)</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualPaymentDate">Actual Payment Date</Label>
            <Input
              id="actualPaymentDate"
              type="date"
              value={actualPaymentDate}
              onChange={(e) => setActualPaymentDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : (mode === 'edit' ? "Save Changes" : "Add Repayment")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}