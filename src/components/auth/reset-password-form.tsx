"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form-nya cuma minta password baru; token diambil dari URL, gak dari input user
const formSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
});
type ResetPasswordFormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(formSchema) });

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm text-center">
        <p className="font-body text-sm text-crimson">
          Link reset password tidak valid. Pastikan kamu membuka link
          langsung dari email.
        </p>
        <Link href="/forgot-password" className="text-crimson text-sm font-medium">
          Minta link baru
        </Link>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const data = await res.json();
      if (!data.success) {
        setServerError(data.message ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setServerError("Terjadi kesalahan. Coba lagi.");
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-sm text-center">
        <span className="text-3xl">✅</span>
        <p className="font-body text-sm text-neutral-midnight/70">
          Password berhasil diubah. Mengarahkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <Input
        label="Password Baru"
        type="password"
        placeholder="Minimal 8 karakter"
        {...register("password")}
        error={errors.password?.message}
      />
      {serverError && <p className="text-sm text-crimson">{serverError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Simpan Password Baru
      </Button>
    </form>
  );
}
