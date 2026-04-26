import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { BillForm } from "@/components/bills/BillForm";

import { billsService } from "@/services/bills.service";

import { toast } from "sonner";

import { Shimmer } from "@/components/common/Skeleton";

export default function EditBill() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [bill, setBill] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      billsService.get(id).then(setBill);
    }
  }, [id]);

  if (!bill) {
    return (
      <div className="space-y-4">
        <Shimmer className="h-16" />

        <Shimmer className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/app/bills/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">
          Edit Bill {bill.billNumber}
        </h1>
      </div>

      <BillForm
        submitting={submitting}
        defaultValues={{
          customer: bill.customer._id || bill.customer,

          lotNumber: bill.lotNumber?.replace("LOT-", "") || "",

          vehicleNumber: bill.vehicleNumber,

          fromName: bill.fromName,

          address: bill.address,

          rows: bill.rows,

          receivedAmount: bill.receivedAmount,

          status: bill.status,

          notes: bill.notes,
        }}
        onSubmit={async (v) => {
          setSubmitting(true);

          try {
            await billsService.update(id, v);

            toast.success("Bill updated");

            navigate(`/app/bills/${id}`);
          } catch {
            toast.error("Failed to update");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
