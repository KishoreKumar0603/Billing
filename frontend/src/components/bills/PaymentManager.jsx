import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { billsService } from "@/services/bills.service";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// ================= PAYMENT FORM DIALOG =================

function PaymentFormDialog({
  billId,
  onPaymentAdded,
  isEdit = false,
  payment = null,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    reference: "",
    notes: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isEdit && payment) {
      setFormData({
        amount: payment.amount.toString(),
        paymentDate: new Date(payment.paymentDate).toISOString().split("T")[0],
        paymentMethod: payment.paymentMethod || "cash",
        reference: payment.reference || "",
        notes: payment.notes || "",
      });
    }
  }, [isEdit, payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.amount || formData.amount <= 0) {
        toast({
          title: "Error",
          description: "Payment amount must be greater than 0",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isEdit && payment) {
        await billsService.updatePayment(billId, payment._id, formData);
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        await billsService.addPayment(billId, formData);
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
      }

      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        reference: "",
        notes: "",
      });
      setOpen(false);
      onPaymentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isEdit ? "outline" : "default"}>
          {isEdit ? (
            <Edit2 className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isEdit ? "Edit" : "Add Payment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Payment" : "Record New Payment"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update payment details"
              : "Record a new payment received from customer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="pl-8"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
                className="pl-8"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Reference (Cheque/UTR No.)</Label>
            <Input
              id="reference"
              placeholder="e.g., CHQ12345 or UTR reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              maxLength={200}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Update Payment" : "Add Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ================= PAYMENT MANAGER COMPONENT =================

export function PaymentManager({ billId, onPaymentChange }) {
  const [payments, setPayments] = useState([]);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load payments
  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await billsService.getPayments(billId);
      setPayments(data.payments || []);
      setBillData({
        totalAmount: data.totalAmount,
        totalReceived: data.totalReceived,
        balanceAmount: data.balanceAmount,
        paymentStatus: data.paymentStatus,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [billId]);

  const handlePaymentAdded = () => {
    loadPayments();
    onPaymentChange?.();
  };

  const handleRemovePayment = async (paymentId) => {
    try {
      await billsService.removePayment(billId, paymentId);
      toast({
        title: "Success",
        description: "Payment removed successfully",
      });
      loadPayments();
      onPaymentChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove payment",
        variant: "destructive",
      });
    }
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: "💰",
      check: "📝",
      bank_transfer: "🏦",
      upi: "📱",
      card: "💳",
      other: "📌",
    };
    return icons[method] || "📌";
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "partially":
        return "bg-yellow-100 text-yellow-800";
      case "not_received":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bill Summary */}
      {billData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payment Summary</CardTitle>
              <Badge
                className={`px-3 py-1 font-semibold ${getPaymentStatusColor(billData.paymentStatus)}`}
              >
                {billData.paymentStatus === "received"
                  ? "Fully Paid"
                  : billData.paymentStatus === "partially"
                    ? "Partially Paid"
                    : "Not Paid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(billData.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(billData.totalReceived)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p
                  className={`text-lg font-bold ${billData.balanceAmount > 0 ? "text-orange-600" : "text-green-600"}`}
                >
                  {formatCurrency(billData.balanceAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Payment Button */}
      <div className="flex justify-end">
        <PaymentFormDialog
          billId={billId}
          onPaymentAdded={handlePaymentAdded}
        />
      </div>

      {/* Payments List */}
      {payments.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Payment History
          </h3>
          <AnimatePresence>
            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                      {payment.reference && ` • ${payment.reference}`}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <PaymentFormDialog
                    billId={billId}
                    onPaymentAdded={handlePaymentAdded}
                    isEdit={true}
                    payment={payment}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePayment(payment._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <DollarSign className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No payments recorded yet</p>
        </div>
      )}
    </div>
  );
}
