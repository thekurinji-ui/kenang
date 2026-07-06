import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const joinEventSchema = z.object({
  nickname: z.string().min(1).max(40).optional(),
  deviceId: z.string().min(8),
});

export const captureMetadataSchema = z.object({
  filmType: z.string(),
  deviceId: z.string().min(8),
  orientation: z.enum(["portrait", "landscape"]),
  timestamp: z.string(),
});

export const createEventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  description: z.string().max(500).optional(),
  eventDate: z.string().optional(),
  location: z.string().max(200).optional(),
  revealMode: z.enum(["INSTANT", "AFTER_EVENT_ENDS"]).default("INSTANT"),
  shotLimit: z.number().int().positive().nullable().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(["DRAFT", "LIVE", "ENDED", "ARCHIVED"]).optional(),
});

// Dipakai admin untuk membuat event atas nama client — sama seperti
// createEventSchema, ditambah email client pemilik event.
export const adminCreateEventSchema = createEventSchema.extend({
  ownerEmail: z.string().email("Email client tidak valid"),
});

export const createAlbumSchema = z.object({
  title: z.string().min(1, "Judul album wajib diisi").max(100),
  description: z.string().max(300).optional(),
});

export const updateAlbumSchema = createAlbumSchema.partial();
