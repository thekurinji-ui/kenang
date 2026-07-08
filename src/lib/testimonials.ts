export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Warna latar avatar inisial (bukan foto asli — lihat catatan di bawah). */
  avatarColor: "crimson" | "royal" | "gold";
}

/**
 * ⚠️ PLACEHOLDER — ini contoh testimoni fiktif buat scaffolding UI, BUKAN
 * kutipan dari pengguna asli. Ganti dengan testimoni customer beneran
 * (idealnya lengkap dengan izin pemakaian nama/cerita) sebelum section ini
 * tayang ke publik. Avatar sengaja pakai inisial + warna, bukan foto stok,
 * biar tidak menampilkan wajah orang yang tidak benar-benar memberi testimoni.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Dinda & Radit",
    role: "Pernikahan · Kerinci",
    quote:
      "Galeri kami penuh sudut pandang yang fotografer aja nggak akan sempat tangkap. Tamu-tamu malah minta difoto pakai Kenang Camera terus.",
    rating: 5,
    avatarColor: "crimson",
  },
  {
    name: "Wisnu Ardiansyah",
    role: "Wedding Organizer",
    quote:
      "Sekarang tiap client selalu aku tawarin Kenang Kurinji sebagai tambahan. Setup-nya cepat, host tinggal scan QR, sisanya tamu yang jalanin sendiri.",
    rating: 5,
    avatarColor: "royal",
  },
  {
    name: "Alya Ramadhani",
    role: "Ulang Tahun ke-7 anak",
    quote:
      "Nggak nyangka anak-anak segitu antusiasnya motret pakai HP masing-masing. Hasil rollnya jadi kenangan yang beneran dari sudut pandang mereka.",
    rating: 5,
    avatarColor: "gold",
  },
];
