import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW
  const [resendLoading, setResendLoading] = useState(false);

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    if (otp.length < 4) return toast.error("Enter 4-digit OTP");

    setLoading(true);

    try {
      await verifyOtp(email, otp);

      toast.success("Account verified");

      navigate("/app/dashboard");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResendLoading(true);

    try {
      await authService.resendOtp({ email });

      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 4-digit code to ${email || "your email"}`}
    >
      <div className="space-y-5">
        <InputOTP maxLength={4} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {[0, 1, 2, 3].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-12 w-12 text-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button
          onClick={submit}
          disabled={loading}
          className="w-full h-11 bg-gradient-primary shadow-elegant"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Verify"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn't get it?{" "}

          <button
            onClick={resend}
            disabled={resendLoading}
            className="text-primary font-medium hover:underline inline-flex items-center gap-2 disabled:opacity-50"
          >
            {resendLoading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}