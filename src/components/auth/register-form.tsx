"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.message ?? "Registrasi gagal");
      return;
    }

    // Auto sign-in right after successful registration.
    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
      <Input label="Nama" placeholder="Nama lengkap" {...register("name")} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        placeholder="kamu@email.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Minimal 8 karakter"
        {...register("password")}
        error={errors.password?.message}
      />
      {serverError && <p className="text-sm text-crimson">{serverError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Buat Akun
      </Button>
      <p className="text-center text-sm text-neutral-midnight/60 font-body">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-crimson font-medium">
          Masuk
        </Link>
      </p>
    </form>
  );
}
