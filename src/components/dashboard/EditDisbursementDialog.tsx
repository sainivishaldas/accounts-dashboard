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
import { useUpdateDisbursement } from "@/hooks/useSupabase";
import type { Disbursement, DisbursementType } from "@/types/database";

interface EditDisbursementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disbursement: Disbursement;
}

const disbursementTypes: DisbursementType[] = ['FexPrime', 'Cashfree', 'CirclePe', 'Fintree'];

export function EditDisbursementDialog({
  open,
  onOpenChange,
  disbursement,
}: EditDisbursementDialogProps) {
  const [date, setDate] = useState(disbursement.date);
  const [amount, setAmount] = useState(disbursement.amount.toString());
  const [utrNumber, setUtrNumber] = useState(disbursement.utr_number || "");
  const [type, setType] = useState<DisbursementType>(disbursement.type);

  const updateDisbursement = useUpdateDisbursement();

  useEffect(() => {
    setDate(disbursement.date);
    setAmount(disbursement.amount.toString());
    setUtrNumber(disbursement.utr_number || "");
    setType(disbursement.type);
  }, [disbursement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !amount || !type) {
      return;
    }

    await updateDisbursement.mutateAsync({
      id: disbursement.id,
      updates: {
        date,
        amount: parseFloat(amount),
        utr_number: utrNumber || null,
        type,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="utr">UTR Number</Label>
            <Input
              id="utr"
              type="text"
              placeholder="Enter UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as DisbursementType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {disbursementTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateDisbursement.isPending}>
              {updateDisbursement.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}