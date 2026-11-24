import {
  BahanInterior,
  JenisBahan,
  KombinasiTersimpan,
  PemantauanSampel,
  ProyekContoh,
  RuangInterior,
} from '../types';

export function tambahHariISO(baseISO: string, jumlahHari: number): string {
  const [tahun, bulan, tanggal] = baseISO.split('-').map(Number);
  const dt = new Date(Date.UTC(tahun, bulan - 1, tanggal));
  dt.setUTCDate(dt.getUTCDate() + jumlahHari);
  return dt.toISOString().slice(0, 10);
}

export function formatTanggalIndonesia(iso: string): string {
  const bulanSingkat = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const [tahun, bulan, tanggal] = iso.split('-').map(Number);
  if (!tahun || !bulan || !tanggal) return iso;
  return `${String(tanggal).padStart(2, '0')} ${bulanSingkat[bulan - 1]} ${tahun}`;
}

export function dapatkanHariIniISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const DAFTAR_PROYEK_CONTOH: ProyekContoh[] = [
  {
    id: 'prj-01',
    nama: 'Renovasi Rumah Keluarga Pratama',
    lokasi: 'Cilandak, Jakarta Selatan',
    klien: 'Ibu Nadia Pratama',
    desainer: 'Raka Mahendra',
  },
  {
    id: 'prj-02',
    nama: 'Apartemen Studio Kemang',
    lokasi: 'Kemang, Jakarta Selatan',
    klien: 'Bapak Dimas Wijaya',
    desainer: 'Sinta Larasati',
  },
  {
    id: 'prj-03',
    nama: 'Kantor Kecil Studio Arsitek',
    lokasi: 'Bintaro, Tangerang Selatan',
    klien: 'Tim Ruang Karya',
    desainer: 'Raka Mahendra',
  },
];

export const DAFTAR_JENIS_BAHAN: JenisBahan[] = [
  'Lantai',
  'Dinding',
  'Countertop',
];

export const DAFTAR_RUANG: RuangInterior[] = [
  'Ruang Tamu',
  'Dapur',
  'Kamar Mandi',
  'Kamar Tidur',
  'Ruang Makan',
];

export const DATA_BAHAN_CONTOH: BahanInterior[] = [
  {
    id: 'bhn-01',
    kode: 'LNT-01',
    nama: 'Parket Kayu Ek Alami',
    jenis: 'Lantai',
    ruangCocok: ['Ruang Tamu', 'Kamar Tidur'],
    tersedia: true,
    ketahananGores: 3,
    tahanAir: 2,
    kemudahanPerawatan: 3,
    warna: '#C49A6C',
    catatanSingkat: 'Hangat di kaki, perlu dijaga dari genangan air berlebih.',
  },
  {
    id: 'bhn-02',
    kode: 'LNT-02',
    nama: 'Vinil SPC Serat Jati',
    jenis: 'Lantai',
    ruangCocok: ['Ruang Tamu', 'Dapur', 'Kamar Tidur', 'Ruang Makan'],
    tersedia: true,
    ketahananGores: 4,
    tahanAir: 5,
    kemudahanPerawatan: 5,
    warna: '#9C734B',
    catatanSingkat: 'Tahan lembap dan mudah dipel, cocok untuk area lalu lintas tinggi.',
  },
  {
    id: 'bhn-03',
    kode: 'LNT-03',
    nama: 'Terrazzo Semen Matte',
    jenis: 'Lantai',
    ruangCocok: ['Ruang Tamu', 'Ruang Makan', 'Kamar Mandi'],
    tersedia: false,
    ketahananGores: 4,
    tahanAir: 4,
    kemudahanPerawatan: 3,
    warna: '#D6D3CD',
    catatanSingkat: 'Perlu pelapis ulang berkala agar pori tidak menyerap noda.',
  },
  {
    id: 'bhn-04',
    kode: 'LNT-04',
    nama: 'Keramik Porselen Abu Batu',
    jenis: 'Lantai',
    ruangCocok: ['Dapur', 'Kamar Mandi', 'Ruang Makan'],
    tersedia: true,
    ketahananGores: 5,
    tahanAir: 5,
    kemudahanPerawatan: 5,
    warna: '#8C8E8B',
    catatanSingkat: 'Permukaan padat, sangat tahan goresan perabot dan cairan.',
  },
  {
    id: 'bhn-05',
    kode: 'DND-01',
    nama: 'Panel WPC Alur Kayu',
    jenis: 'Dinding',
    ruangCocok: ['Ruang Tamu', 'Kamar Tidur'],
    tersedia: true,
    ketahananGores: 3,
    tahanAir: 4,
    kemudahanPerawatan: 4,
    warna: '#A67B5B',
    catatanSingkat: 'Aksen garis vertikal rapi, cukup dilap kain lembap.',
  },
  {
    id: 'bhn-06',
    kode: 'DND-02',
    nama: 'Cat Kapur Mineral Hangat',
    jenis: 'Dinding',
    ruangCocok: ['Ruang Tamu', 'Kamar Tidur', 'Ruang Makan'],
    tersedia: true,
    ketahananGores: 2,
    tahanAir: 2,
    kemudahanPerawatan: 3,
    warna: '#E5DED3',
    catatanSingkat: 'Tampilan lembut bertekstur halus, hindari area basah langsung.',
  },
  {
    id: 'bhn-07',
    kode: 'DND-03',
    nama: 'Bata Ekspos Putih Halus',
    jenis: 'Dinding',
    ruangCocok: ['Ruang Tamu', 'Ruang Makan', 'Dapur'],
    tersedia: true,
    ketahananGores: 4,
    tahanAir: 3,
    kemudahanPerawatan: 3,
    warna: '#EFECE6',
    catatanSingkat: 'Celah nat perlu disikat ringan berkala jika dipasang dekat dapur.',
  },
  {
    id: 'bhn-08',
    kode: 'CTP-01',
    nama: 'Kuarsa Putih Uratsari',
    jenis: 'Countertop',
    ruangCocok: ['Dapur', 'Kamar Mandi'],
    tersedia: true,
    ketahananGores: 5,
    tahanAir: 5,
    kemudahanPerawatan: 5,
    warna: '#F2F1ED',
    catatanSingkat: 'Tidak berpori, aman dari noda kopi, kunyit, dan air dapur.',
  },
  {
    id: 'bhn-09',
    kode: 'CTP-02',
    nama: 'Marmer Carrara Lokal',
    jenis: 'Countertop',
    ruangCocok: ['Dapur', 'Kamar Mandi'],
    tersedia: false,
    ketahananGores: 3,
    tahanAir: 3,
    kemudahanPerawatan: 2,
    warna: '#E2E4E6',
    catatanSingkat: 'Corak alami unik, rentan kusam bila terkena asam atau jeruk.',
  },
  {
    id: 'bhn-10',
    kode: 'CTP-03',
    nama: 'Solid Surface Krem Matte',
    jenis: 'Countertop',
    ruangCocok: ['Dapur', 'Kamar Mandi'],
    tersedia: true,
    ketahananGores: 3,
    tahanAir: 5,
    kemudahanPerawatan: 4,
    warna: '#E8E0D2',
    catatanSingkat: 'Sambungan nyaris tak terlihat, gores ringan bisa dipoles ulang.',
  },
];

export function buatKombinasiAwal(hariIniISO: string): KombinasiTersimpan[] {
  return [
    {
      id: 'kmb-01',
      proyekId: 'prj-01',
      judul: 'Paket Dapur Praktis & Tahan Noda',
      daftarBahanId: ['bhn-04', 'bhn-07', 'bhn-08'],
      alasan:
        'Ibu Nadia sering memasak harian sehingga butuh meja kuarsa dan lantai porselen yang tahan air serta mudah dilap.',
      dibuatOleh: 'Raka (Staf Studio)',
      tanggal: formatTanggalIndonesia(tambahHariISO(hariIniISO, -4)),
    },
    {
      id: 'kmb-02',
      proyekId: 'prj-01',
      judul: 'Paket Ruang Tamu Hangat',
      daftarBahanId: ['bhn-02', 'bhn-05', 'bhn-06'],
      alasan:
        'Memilih vinil SPC daripada parket asli agar lebih aman terhadap gesekan kursi dan lebih mudah dirawat.',
      dibuatOleh: 'Ibu Nadia (Pelanggan)',
      tanggal: formatTanggalIndonesia(tambahHariISO(hariIniISO, -2)),
    },
    {
      id: 'kmb-03',
      proyekId: 'prj-02',
      judul: 'Paket Studio Ringkas Mudah Rawat',
      daftarBahanId: ['bhn-02', 'bhn-05', 'bhn-10'],
      alasan:
        'Apartemen studio membutuhkan material yang cepat dibersihkan dan tahan lembap di area pantry terbuka.',
      dibuatOleh: 'Bapak Dimas (Pelanggan)',
      tanggal: formatTanggalIndonesia(tambahHariISO(hariIniISO, -1)),
    },
  ];
}

export function buatPemantauanAwal(hariIniISO: string): PemantauanSampel[] {
  return [
    {
      id: 'smp-01',
      proyekId: 'prj-01',
      bahanId: 'bhn-01',
      namaBahan: 'Parket Kayu Ek Alami',
      kodeSampel: 'LNT-01',
      peminjam: 'Ibu Nadia Pratama',
      peran: 'Pelanggan',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -10),
      batasKembaliISO: tambahHariISO(hariIniISO, -3),
      tahap: 'Dikirim',
    },
    {
      id: 'smp-02',
      proyekId: 'prj-01',
      bahanId: 'bhn-08',
      namaBahan: 'Kuarsa Putih Uratsari',
      kodeSampel: 'CTP-01',
      peminjam: 'Ibu Nadia Pratama',
      peran: 'Pelanggan',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -5),
      batasKembaliISO: tambahHariISO(hariIniISO, 2),
      tahap: 'Dikirim',
    },
    {
      id: 'smp-03',
      proyekId: 'prj-01',
      bahanId: 'bhn-05',
      namaBahan: 'Panel WPC Alur Kayu',
      kodeSampel: 'DND-01',
      peminjam: 'Raka Mahendra',
      peran: 'Staf Studio',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -1),
      batasKembaliISO: tambahHariISO(hariIniISO, 6),
      tahap: 'Disiapkan',
    },
    {
      id: 'smp-04',
      proyekId: 'prj-01',
      bahanId: 'bhn-02',
      namaBahan: 'Vinil SPC Serat Jati',
      kodeSampel: 'LNT-02',
      peminjam: 'Ibu Nadia Pratama',
      peran: 'Pelanggan',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -14),
      batasKembaliISO: tambahHariISO(hariIniISO, -7),
      tahap: 'Dikembalikan',
    },
    {
      id: 'smp-05',
      proyekId: 'prj-02',
      bahanId: 'bhn-10',
      namaBahan: 'Solid Surface Krem Matte',
      kodeSampel: 'CTP-03',
      peminjam: 'Bapak Dimas Wijaya',
      peran: 'Pelanggan',
      tanggalPinjamISO: hariIniISO,
      batasKembaliISO: tambahHariISO(hariIniISO, 7),
      tahap: 'Diminta',
    },
    {
      id: 'smp-06',
      proyekId: 'prj-02',
      bahanId: 'bhn-02',
      namaBahan: 'Vinil SPC Serat Jati',
      kodeSampel: 'LNT-02',
      peminjam: 'Bapak Dimas Wijaya',
      peran: 'Pelanggan',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -10),
      batasKembaliISO: tambahHariISO(hariIniISO, -3),
      tahap: 'Dikirim',
    },
    {
      id: 'smp-07',
      proyekId: 'prj-03',
      bahanId: 'bhn-08',
      namaBahan: 'Kuarsa Putih Uratsari',
      kodeSampel: 'CTP-01',
      peminjam: 'Tim Ruang Karya',
      peran: 'Pelanggan',
      tanggalPinjamISO: tambahHariISO(hariIniISO, -10),
      batasKembaliISO: tambahHariISO(hariIniISO, -3),
      tahap: 'Dikirim',
    },
  ];
}
