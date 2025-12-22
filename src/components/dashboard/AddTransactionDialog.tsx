import { useState } from "react";
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
import { useCreateDisbursement } from "@/hooks/useSupabase";
import type { DisbursementInsert, DisbursementType } from "@/types/database";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: string;
}

interface TransactionFormData {
  disbursement_id: string;
  date: Date | null;
  amount: number;
  utr_number: string;
  type: DisbursementType;
}

export function AddTransactionDialog({ open, onOpenChange, residentId }: AddTransactionDialogProps) {
  const createDisbursement = useCreateDisbursement();
  const [transactionDate, setTransactionDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    defaultValues: {
      disbursement_id: "",
      amount: 0,
      utr_number: "",
      type: "FexPrime",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (!transactionDate) {
        return;
      }

      const disbursementData: DisbursementInsert = {
        disbursement_id: data.disbursement_id,
        resident_id: residentId,
        date: format(transactionDate, "yyyy-MM-dd"),
        amount: Number(data.amount),
        utr_number: data.utr_number || null,
        type: data.type,
      };

      await createDisbursement.mutateAsync(disbursementData);

      reset();
      setTransactionDate(undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleClose = () => {
    reset();
    setTransactionDate(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new disbursement transaction for this resident.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disbursement_id">Transaction ID *</Label>
            <Input
              id="disbursement_id"
              {...register("disbursement_id", { required: "Transaction ID is required" })}
              placeholder="e.g., TXN001"
            />
            {errors.disbursement_id && (
              <p className="text-sm text-destructive">{errors.disbursement_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Transaction Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transactionDate ? format(transactionDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={setTransactionDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { required: "Amount is required", min: 0 })}
              placeholder="0"
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="utr_number">UTR Number</Label>
            <Input
              id="utr_number"
              {...register("utr_number")}
              placeholder="Enter UTR number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value: DisbursementType) => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FexPrime">FexPrime</SelectItem>
                <SelectItem value="Cashfree">Cashfree</SelectItem>
                <SelectItem value="CirclePe">CirclePe</SelectItem>
                <SelectItem value="Fintree">Fintree</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDisbursement.isPending}>
              {createDisbursement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Transaction'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
