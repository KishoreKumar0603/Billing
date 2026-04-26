import { useEffect, useMemo, useState } from "react";

import { useFieldArray, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { Plus, Trash2, Loader2 } from "lucide-react";

import { customersService } from "@/services/customers.service";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { formatCurrency } from "@/lib/format";

import { motion, AnimatePresence } from "framer-motion";

// ================= SCHEMA =================

const schema = z.object({
  customer: z.string().min(1, "Select a customer"),

  lotNumber: z.string().trim().min(1, "Required").max(50),

  vehicleNumber: z.string().trim().min(1, "Required").max(50),

  fromName: z.string().trim().min(1).max(100),

  address: z.string().trim().min(1).max(200),

  rows: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Label required").max(30),

        quantity: z.coerce.number().min(0, "Invalid"),

        rate: z.coerce.number().min(0, "Invalid"),
      }),
    )
    .min(1),

  receivedAmount: z.coerce.number().min(0).default(0),

  status: z.enum(["working", "completed"]).default("working"),

  notes: z.string().max(500).optional(),
});

// ================= COMPONENT =================

export function BillForm({ defaultValues, onSubmit, submitting }) {
  const [customers, setCustomers] = useState([]);

  // ================= LOAD CUSTOMERS =================

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await customersService.list();

        setCustomers(data.customers || []);
      } catch {
        setCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  // ================= FORM =================

  const form = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      customer: "",

      lotNumber: "",

      vehicleNumber: "TN58AU0285",

      fromName: "Geethanjali Garments",

      address: "West street, Mallappuram, Madurai - 625535",

      rows: [
        {
          label: "M",
          quantity: 0,
          rate: 0,
        },
      ],

      receivedAmount: 0,

      status: "working",

      notes: "",

      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,

    formState: { errors },
  } = form;

  // ================= RESET FORM =================

  useEffect(() => {
    if (defaultValues) {
      reset({
        customer: "",

        lotNumber: "",

        vehicleNumber: "TN58AU0285",

        fromName: "Geethanjali Garments",

        address: "West street, Mallappuram, Madurai - 625535",

        rows: [
          {
            label: "M",
            quantity: 0,
            rate: 0,
          },
        ],

        receivedAmount: 0,

        status: "working",

        notes: "",

        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  // ================= ROWS =================

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  // ================= WATCH =================

  const rows = watch("rows") || [];

  const selectedCustomerId = watch("customer");

  const received = Number(watch("receivedAmount") || 0);

  // ================= TOTAL =================

  const total = useMemo(() => {
    return rows.reduce(
      (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.rate) || 0),

      0,
    );
  }, [rows]);

  const balance = Math.max(0, total - received);

  // ================= UI =================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ================= LEFT ================= */}

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
          {/* HEADER */}

          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <p className="font-display text-lg font-bold">Delivery Challan</p>

              <p className="text-xs text-muted-foreground">
                Fill in lot and delivery details
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Preview total</p>

              <p className="font-display text-2xl font-bold gradient-text">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          {/* FORM GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* CUSTOMER */}

            <div>
              <Label>Customer</Label>

              <Select
                value={watch("customer")}
                onValueChange={(v) =>
                  setValue("customer", v, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>

                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} — {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.customer && (
                <p className="text-xs text-destructive mt-1">
                  {errors.customer.message}
                </p>
              )}
            </div>

            {/* STATUS */}

            <div>
              <Label>Status</Label>

              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v)}
              >
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="working">Working</SelectItem>

                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LOT */}

            <div>
              <Label>Lot Number</Label>

              <Input
                {...register("lotNumber")}
                className="mt-1.5 h-11 font-mono"
                placeholder="000"
              />

              {errors.lotNumber && (
                <p className="text-xs text-destructive mt-1">
                  {errors.lotNumber.message}
                </p>
              )}
            </div>

            {/* VEHICLE */}

            <div>
              <Label>Vehicle Number</Label>

              <Input
                {...register("vehicleNumber")}
                className="mt-1.5 h-11 uppercase"
                placeholder="TN-00-0000"

              />
            </div>

            {/* FROM */}

            <div>
              <Label>From</Label>

              <Input {...register("fromName")} className="mt-1.5 h-11" />
            </div>

            {/* ADDRESS */}

            <div>
              <Label>Address</Label>

              <Input {...register("address")} className="mt-1.5 h-11" />
            </div>
          </div>

          {/* ================= ITEMS ================= */}

          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">Items</p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    label: "",
                    quantity: 0,
                    rate: 0,
                  })
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add row
              </Button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              {/* HEADER */}

              <div className="grid grid-cols-12 gap-2 bg-secondary/60 px-3 py-2 text-xs font-medium uppercase">
                <div className="col-span-3">Label</div>

                <div className="col-span-3">Qty</div>

                <div className="col-span-3">Rate</div>

                <div className="col-span-2 text-right">Amount</div>

                <div className="col-span-1" />
              </div>

              {/* ROWS */}

              <AnimatePresence initial={false}>
                {fields.map((field, i) => {
                  const qty = Number(rows[i]?.quantity) || 0;

                  const rate = Number(rows[i]?.rate) || 0;

                  const amt = qty * rate;

                  return (
                    <motion.div
                      key={field.id}
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-border items-center"
                    >
                      <Input
                        className="col-span-3 h-10"
                        placeholder="M"
                        {...register(`rows.${i}.label`)}
                      />

                      <Input
                        className="col-span-3 h-10"
                        type="number"
                        {...register(`rows.${i}.quantity`)}
                      />

                      <Input
                        className="col-span-3 h-10"
                        type="number"
                        step="0.01"
                        {...register(`rows.${i}.rate`)}
                      />

                      <div className="col-span-2 text-right font-bold">
                        {formatCurrency(amt)}
                      </div>

                      <button
                        type="button"
                        disabled={fields.length <= 1}
                        onClick={() => remove(i)}
                        className="col-span-1 justify-self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* NOTES */}

          <div>
            <Label>Notes</Label>

            <Textarea rows={2} {...register("notes")} className="mt-1.5" />
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit sticky top-20 space-y-4">
          <p className="font-display font-bold">Summary</p>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items</span>

              <span>{fields.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Total</span>

              <span className="font-bold">{formatCurrency(total)}</span>
            </div>

            <div>
              <Label>Received</Label>

              <Input
                type="number"
                step="0.01"
                className="mt-1.5 h-11"
                {...register("receivedAmount")}
              />
            </div>

            <div className="flex justify-between pt-2 border-t">
              <span>Balance</span>

              <span>{formatCurrency(balance)}</span>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-11">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Bill"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
