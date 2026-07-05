"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const saveName = async () => {
    setSavingName(true);
    setNameMessage(null);
    const res = await fetch("/api/v1/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    setSavingName(false);
    if (!res.ok || !json.success) {
      setNameMessage(json.message ?? "Gagal menyimpan nama");
      return;
    }
    setNameMessage("Nama berhasil diperbarui.");
    router.refresh();
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);
    const res = await fetch("/api/v1/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setSavingPassword(false);
    if (!res.ok || !json.success) {
      setPasswordMessage({ type: "error", text: json.message ?? "Gagal mengganti password" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage({ type: "success", text: "Password berhasil diganti." });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <Card className="p-6">
        <h2 className="font-heading font-semibold text-neutral-midnight">Informasi Akun</h2>
        <div className="flex flex-col gap-4 mt-4">
          <Input label="Email" value={email} disabled />
          <Input label="Nama" value={name} onChange={(e) => setName(e.target.value)} />
          {nameMessage && (
            <p className="font-body text-xs text-neutral-midnight/60">{nameMessage}</p>
          )}
          <Button onClick={saveName} isLoading={savingName} className="self-start">
            Simpan Nama
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-neutral-midnight">Ganti Password</h2>
        <form onSubmit={savePassword} className="flex flex-col gap-4 mt-4">
          <Input
            label="Password Lama"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          {passwordMessage && (
            <p
              className={`font-body text-xs ${
                passwordMessage.type === "success" ? "text-green-600" : "text-crimson"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}
          <Button type="submit" isLoading={savingPassword} className="self-start">
            Ganti Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
