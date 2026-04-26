import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { Link } from "react-router-dom";

import { useState } from "react";

import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { authService } from "@/services/auth.service";

import {
  Loader2,
  MailCheck,
} from "lucide-react";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email(),
});

export default function ForgotPassword() {
  const [sent, setSent] =
    useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const {
    register,
    handleSubmit,

    formState: {
      errors,
    },
  } = useForm({
    resolver:
      zodResolver(schema),
  });

  const onSubmit = async (
    v
  ) => {
    setLoading(true);

    try {
      await authService.forgotPassword(
        v
      );

      setSent(true);

      toast.success(
        "Reset link sent"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="We'll email you a secure reset link"
    >
      {sent ? (
        <div className="text-center py-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-soft text-primary">
            <MailCheck className="h-7 w-7" />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Check your inbox
            for the reset
            link.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-block text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          <div>
            <Label>
              Email
            </Label>

            <Input
              type="email"
              className="mt-1.5 h-11"
              {...register(
                "email"
              )}
            />

            {errors.email && (
              <p className="text-xs text-destructive mt-1">
                {
                  errors.email
                    .message
                }
              </p>
            )}
          </div>

          <Button
            disabled={
              loading
            }
            className="w-full h-11 bg-gradient-primary shadow-elegant"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send reset link"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Back to sign
              in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}