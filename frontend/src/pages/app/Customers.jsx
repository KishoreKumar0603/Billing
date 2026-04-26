import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Plus,
  Search,
  Phone,
  MapPin,
  User,
} from "lucide-react";

import { Link } from "react-router-dom";

import { customersService } from "@/services/customers.service";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { toast } from "sonner";

import { EmptyState } from "@/components/common/EmptyState";

import { Shimmer } from "@/components/common/Skeleton";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  phone: z
    .string()
    .trim()
    .min(7)
    .max(20),

  address: z
    .string()
    .trim()
    .max(200)
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export default function Customers() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [q, setQ] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver:
      zodResolver(schema),
  });

  const load = async () => {
    try {
      setLoading(true);

      const data =
        await customersService.list(
          q
        );

      setItems(
        data.customers ||
          []
      );
    } catch {
      setItems([]);
      toast.error(
        "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(
      load,
      250
    );

    return () =>
      clearTimeout(t);
  }, [q]);

  const onCreate =
    async (v) => {
      try {
        await customersService.create(
          v
        );

        toast.success(
          "Customer added"
        );

        reset();

        setOpen(false);

        load();
      } catch {
        toast.error(
          "Failed to add customer"
        );
      }
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">
            Customers
          </h1>

          <p className="text-muted-foreground mt-1">
            Your entire
            customer book
            in one place.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={
            setOpen
          }
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant">
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                New
                Customer
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(
                onCreate
              )}
              className="space-y-3 mt-2"
            >
              <div>
                <Label>
                  Name
                </Label>

                <Input
                  {...register(
                    "name"
                  )}
                  className="mt-1.5"
                />

                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {
                      errors
                        .name
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Phone
                </Label>

                <Input
                  {...register(
                    "phone"
                  )}
                  className="mt-1.5"
                />

                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">
                    {
                      errors
                        .phone
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Address
                </Label>

                <Input
                  {...register(
                    "address"
                  )}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>
                  Notes
                </Label>

                <Textarea
                  {...register(
                    "notes"
                  )}
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  className="bg-gradient-primary"
                >
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={q}
          onChange={(e) =>
            setQ(
              e.target
                .value
            )
          }
          placeholder="Search by name or phone..."
          className="pl-9 h-11"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map(
            (_, i) => (
              <Shimmer
                key={i}
                className="h-32"
              />
            )
          )}
        </div>
      ) : items.length ===
        0 ? (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={
              <User className="h-6 w-6" />
            }
            title="No customers found"
            description="Try a different search or add your first customer."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(
            (c, i) => (
              <motion.div
                key={c._id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    i *
                    0.03,
                }}
              >
                <Link
                  to={`/app/customers/${c._id}`}
                  className="block group"
                >
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-elegant hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold shadow-elegant">
                        {
                          c
                            .name[0]
                        }
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {
                            c.name
                          }
                        </p>

                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {
                            c.phone
                          }
                        </p>
                      </div>
                    </div>

                    {c.address && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5" />

                        <span className="line-clamp-2">
                          {
                            c.address
                          }
                        </span>
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          )}
        </div>
      )}
    </div>
  );
}