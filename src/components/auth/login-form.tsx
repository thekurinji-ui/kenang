"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    const result = await signIn("credentials", { ...values, redirect: false });

    if (result?.error) {
      setServerError("Email atau password salah");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-sm">
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
        placeholder="Password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Link
        href="/forgot-password"
        className="-mt-2 self-end text-xs text-crimson font-medium font-body"
      >
        Lupa password?
      </Link>
      {serverError && <p className="text-sm text-crimson">{serverError}</p>}
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Masuk
      </Button>
      <p className="text-center text-sm text-neutral-midnight/60 font-body">
        Belum punya akun?{" "}
        <Link href="/register" className="text-crimson font-medium">
          Daftar
        </Link>
      </p>
    </form>
  );
}
