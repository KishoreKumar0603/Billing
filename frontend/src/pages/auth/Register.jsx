import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { AuthLayout } from "@/components/auth/AuthLayout";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { useAuth } from "@/stores/auth.store";

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name is too short"
      )
      .max(80),

    email: z
      .string()
      .trim()
      .email(),

    phone: z
      .string()
      .trim()
      .min(
        8,
        "Valid phone required"
      )
      .max(20),

    password: z
      .string()
      .min(
        6,
        "At least 6 characters"
      )
      .max(100),

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

export default function Register() {
  const [show, setShow] =
    useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const {
    register:
      doRegister,
  } = useAuth();

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
    values
  ) => {
    setLoading(true);

    try {
      const { email } =
        await doRegister(
          values
        );

      toast.success(
        "OTP sent to your email"
      );

      navigate(
        `/verify-otp?email=${encodeURIComponent(email)}`
      );
    } catch {
      toast.error(
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing bills and customers in minutes"
    >
      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-4"
      >
        <div>
          <Label>
            Full name
          </Label>

          <Input
            className="mt-1.5 h-11"
            placeholder="Your name"
            {...register(
              "name"
            )}
          />

          {errors.name && (
            <p className="text-xs text-destructive mt-1">
              {
                errors.name
                  .message
              }
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>
              Email
            </Label>

            <Input
              className="mt-1.5 h-11"
              type="email"
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

          <div>
            <Label>
              Phone
            </Label>

            <Input
              className="mt-1.5 h-11"
              {...register(
                "phone"
              )}
            />

            {errors.phone && (
              <p className="text-xs text-destructive mt-1">
                {
                  errors.phone
                    .message
                }
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>
            Password
          </Label>

          <div className="relative mt-1.5">
            <Input
              type={
                show
                  ? "text"
                  : "password"
              }
              {...register(
                "password"
              )}
              className="h-11 pr-10"
            />

            <button
              type="button"
              onClick={() =>
                setShow(
                  !show
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

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
            className="mt-1.5 h-11"
            type={
              show
                ? "text"
                : "password"
            }
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
          type="submit"
          disabled={
            loading
          }
          className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-elegant"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have
          an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}