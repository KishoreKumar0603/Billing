import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BillForm } from "@/components/bills/BillForm";
import { billsService } from "@/services/bills.service";
import { toast } from "sonner";

export default function CreateBill() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="space-y-6">
      <Link
        to="/app/bills"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Bills
      </Link>
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">
          Create Bill
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a new delivery challan for a customer.
        </p>
      </div>
      <BillForm
        submitting={submitting}
        onSubmit={async (v) => {
          setSubmitting(true);
          try {
            const b = await billsService.create(v);
            toast.success("Bill created");
            navigate(`/app/bills/${b.bill._id}`);
          } catch {
            toast.error("Failed to save");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
