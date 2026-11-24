export type JenisBahan = 'Lantai' | 'Dinding' | 'Countertop';

export type RuangInterior =
  | 'Ruang Tamu'
  | 'Dapur'
  | 'Kamar Mandi'
  | 'Kamar Tidur'
  | 'Ruang Makan';

export interface ProyekContoh {
  id: string;
  nama: string;
  lokasi: string;
  klien: string;
  desainer: string;
}

export interface BahanInterior {
  id: string;
  kode: string;
  nama: string;
  jenis: JenisBahan;
  ruangCocok: RuangInterior[];
  tersedia: boolean;
  ketahananGores: 1 | 2 | 3 | 4 | 5;
  tahanAir: 1 | 2 | 3 | 4 | 5;
  kemudahanPerawatan: 1 | 2 | 3 | 4 | 5;
  warna: string;
  catatanSingkat: string;
}

export interface KombinasiTersimpan {
  id: string;
  proyekId: string;
  judul: string;
  daftarBahanId: string[];
  alasan: string;
  dibuatOleh: string;
  tanggal: string;
}

export type TahapSampel = 'Diminta' | 'Disiapkan' | 'Dikirim' | 'Dikembalikan';

export type StatusTampilSampel = TahapSampel | 'Terlambat';

export interface PemantauanSampel {
  id: string;
  proyekId: string;
  bahanId: string;
  namaBahan: string;
  kodeSampel: string;
  peminjam: string;
  peran: 'Pelanggan' | 'Staf Studio';
  tanggalPinjamISO: string;
  batasKembaliISO: string;
  tahap: TahapSampel;
}
