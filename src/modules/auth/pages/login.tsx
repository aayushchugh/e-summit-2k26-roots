"use client";

import Image from "next/image";
import SkyImage from "@/assets/space.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/config/endpoints";
import { AuthServices } from "@/services";
import { useUserStore } from "@/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "otp";

export function Login() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const requestOtpMutation = useMutation({
    mutationKey: [endpoints.auth.requestOtp.query],
    mutationFn: () => AuthServices.requestOtp(email),
    onSuccess: () => setStep("otp"),
  });

  const verifyOtpMutation = useMutation({
    mutationKey: [endpoints.auth.verifyOtp.query],
    mutationFn: () => AuthServices.verifyOtp(email, otp),
    onSuccess: (data) => {
      const user = data?.data?.payload?.user;
      if (user) {
        setUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName ?? null,
          role: user.role,
        });
        router.push("/dashboard");
      }
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    requestOtpMutation.mutate();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  return (
    <main className="flex items-center justify-between min-h-dvh w-full">
      <div className="w-1/2 flex gap-6 flex-col items-center justify-center px-8">
        <h1 className="text-2xl font-semibold">Roots</h1>
        <p className="text-muted-foreground text-sm">Sign in with your email and OTP</p>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={requestOtpMutation.isPending}
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={requestOtpMutation.isPending}
              disabled={!email.trim()}
            >
              Send OTP
            </Button>
            {requestOtpMutation.isError && (
              <p className="text-destructive text-sm">
                {requestOtpMutation.error instanceof Error
                  ? requestOtpMutation.error.message
                  : "Failed to send OTP"}
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full max-w-sm space-y-4">
            <p className="text-muted-foreground text-sm">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={verifyOtpMutation.isPending}
                autoComplete="one-time-code"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={verifyOtpMutation.isPending}
              disabled={otp.length !== 6}
            >
              Verify & sign in
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setStep("email")}
              disabled={verifyOtpMutation.isPending}
            >
              Use a different email
            </Button>
            {verifyOtpMutation.isError && (
              <p className="text-destructive text-sm">
                {verifyOtpMutation.error instanceof Error
                  ? verifyOtpMutation.error.message
                  : "Invalid or expired OTP"}
              </p>
            )}
          </form>
        )}
      </div>
      <div className="w-1/2 h-screen relative">
        <Image src={SkyImage} alt="" fill className="object-cover" />
      </div>
    </main>
  );
}
