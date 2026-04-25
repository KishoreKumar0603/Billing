import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { authService } from "@/services/auth.service";

import { Loader2 } from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(6),

    confirmPassword:
      z.string(),
  })
  .refine(
    (d) =>
      d.password ===
      d.confirmPassword,
    {
      path: [
        "confirmPassword",
      ],

      message:
        "Passwords don't match",
    }
  );

export default function ResetPassword() {
  const { token } =
    useParams();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const navigate =
    useNavigate();

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
      await authService.resetPassword(
        {
          token,
          ...v,
        }
      );

      toast.success(
        "Password reset"
      );

      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Make it strong and memorable"
    >
      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-4"
      >
        <div>
          <Label>
            New password
          </Label>

          <Input
            type="password"
            className="mt-1.5 h-11"
            {...register(
              "password"
            )}
          />

          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {
                errors
                  .password
                  .message
              }
            </p>
          )}
        </div>

        <div>
          <Label>
            Confirm
            password
          </Label>

          <Input
            type="password"
            className="mt-1.5 h-11"
            {...register(
              "confirmPassword"
            )}
          />

          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">
              {
                errors
                  .confirmPassword
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
            "Reset password"
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
    </AuthLayout>
  );
}