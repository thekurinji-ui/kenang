"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordForm) => {
    setServerError(null);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        setServerError(data.message ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      setSent(true);
    } catch {
      setServerError("Terjadi kesalahan. Coba lagi.");
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm text-center">
        <span className="text-3xl">📬</span>
        <p className="font-body text-sm text-neutral-midnight/70">
          Kalau email tersebut terdaftar, kami sudah kirim link reset password.
          Cek inbox (atau folder spam) kamu.
        </p>
        <Link href="/login" className="text-crimson text-sm font-medium">
          Balik ke halaman login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        {...register("email")}
        error={errors.email?.message}
      />
      {serverError && <p className="text-sm text-crimson">{serverError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Kirim Link Reset
      </Button>
      <p className="text-center text-sm text-neutral-midnight/60 font-body">
        Sudah ingat password?{" "}
        <Link href="/login" className="text-crimson font-medium">
          Masuk
        </Link>
      </p>
    </form>
  );
}
