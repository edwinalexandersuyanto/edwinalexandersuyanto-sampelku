import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { SkorBar } from './components/SkorBar';
import {
  buatKombinasiAwal,
  buatPemantauanAwal,
  DAFTAR_JENIS_BAHAN,
  DAFTAR_PROYEK_CONTOH,
  DAFTAR_RUANG,
  dapatkanHariIniISO,
  DATA_BAHAN_CONTOH,
  formatTanggalIndonesia,
  tambahHariISO,
} from './data/sampleData';
import {
  BahanInterior,
  JenisBahan,
  KombinasiTersimpan,
  PemantauanSampel,
  RuangInterior,
  StatusTampilSampel,
  TahapSampel,
} from './types';

type TabBawah = 'pemantauan' | 'terlambat';

interface SaranPengganti {
  bahanTidakTersedia: BahanInterior;
  penggantiTersedia: BahanInterior[];
}

interface PesanStatus {
  tipe: 'error' | 'sukses';
  teks: string;
  saranPengganti?: SaranPengganti[];
}

function samaSetId(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  if (setA.size !== b.length) return false;
  return b.every((id) => setA.has(id));
}

export default function App() {
  const hariIniDefault = useMemo(() => dapatkanHariIniISO(), []);

  // Proyek contoh aktif
  const [proyekAktifId, setProyekAktifId] = useState<string>(
    DAFTAR_PROYEK_CONTOH[0].id
  );

  // Filter kiri
  const [filterJenis, setFilterJenis] = useState<'Semua' | JenisBahan>('Semua');
  const [filterRuang, setFilterRuang] = useState<'Semua' | RuangInterior>(
    'Semua'
  );
  const [hanyaTersedia, setHanyaTersedia] = useState<boolean>(false);

  // Pilihan bahan per proyek untuk tabel perbandingan & kombinasi
  const [pilihanPerProyek, setPilihanPerProyek] = useState<
    Record<string, string[]>
  >({
    'prj-01': ['bhn-01', 'bhn-02', 'bhn-08'],
    'prj-02': [],
    'prj-03': [],
  });

  // Form kombinasi & daftar kombinasi tersimpan
  const [judulKombinasi, setJudulKombinasi] = useState<string>('');
  const [alasanPilihan, setAlasanPilihan] = useState<string>('');
  const [kombinasiTersimpan, setKombinasiTersimpan] = useState<
    KombinasiTersimpan[]
  >(() => buatKombinasiAwal(hariIniDefault));

  // Pemantauan sampel & tanggal cek tenggat
  const [daftarSampel, setDaftarSampel] = useState<PemantauanSampel[]>(() =>
    buatPemantauanAwal(hariIniDefault)
  );
  const [tanggalAcuanISO, setTanggalAcuanISO] =
    useState<string>(hariIniDefault);
  const [tabBawah, setTabBawah] = useState<TabBawah>('pemantauan');
  const [pesanStatus, setPesanStatus] = useState<PesanStatus | null>(null);

  const proyekAktif = useMemo(
    () =>
      DAFTAR_PROYEK_CONTOH.find((p) => p.id === proyekAktifId) ??
      DAFTAR_PROYEK_CONTOH[0],
    [proyekAktifId]
  );

  const bahanById = useMemo(() => {
    const map = new Map<string, BahanInterior>();
    for (const bahan of DATA_BAHAN_CONTOH) {
      map.set(bahan.id, bahan);
    }
    return map;
  }, []);

  const bahanTerpilihIds = useMemo(
    () => pilihanPerProyek[proyekAktifId] ?? [],
    [pilihanPerProyek, proyekAktifId]
  );

  const bahanTerpilih = useMemo(() => {
    return bahanTerpilihIds
      .map((id) => bahanById.get(id))
      .filter((item): item is BahanInterior => Boolean(item));
  }, [bahanById, bahanTerpilihIds]);

  const bahanTersaring = useMemo(() => {
    return DATA_BAHAN_CONTOH.filter((bahan) => {
      if (filterJenis !== 'Semua' && bahan.jenis !== filterJenis) {
        return false;
      }
      if (
        filterRuang !== 'Semua' &&
        !bahan.ruangCocok.includes(filterRuang)
      ) {
        return false;
      }
      if (hanyaTersedia && !bahan.tersedia) {
        return false;
      }
      return true;
    });
  }, [filterJenis, filterRuang, hanyaTersedia]);

  const kombinasiProyekIni = useMemo(
    () => kombinasiTersimpan.filter((k) => k.proyekId === proyekAktifId),
    [kombinasiTersimpan, proyekAktifId]
  );

  const kombinasiAktifTersimpan = useMemo(() => {
    if (bahanTerpilihIds.length < 2) return undefined;
    return kombinasiProyekIni.find((k) =>
      samaSetId(k.daftarBahanId, bahanTerpilihIds)
    );
  }, [kombinasiProyekIni, bahanTerpilihIds]);

  const sampelProyekIni = useMemo(
    () => daftarSampel.filter((s) => s.proyekId === proyekAktifId),
    [daftarSampel, proyekAktifId]
  );

  function dapatkanStatusTampil(sampel: PemantauanSampel): StatusTampilSampel {
    if (
      sampel.tahap !== 'Dikembalikan' &&
      tanggalAcuanISO > sampel.batasKembaliISO
    ) {
      return 'Terlambat';
    }
    return sampel.tahap;
  }

  const sampelPerluTindakLanjut = useMemo(() => {
    return sampelProyekIni.filter((s) => {
      const status = dapatkanStatusTampil(s);
      return status !== 'Dikembalikan';
    });
  }, [sampelProyekIni, tanggalAcuanISO]);

  const dataTabAktif =
    tabBawah === 'pemantauan' ? sampelProyekIni : sampelPerluTindakLanjut;

  const filterAktif =
    filterJenis !== 'Semua' || filterRuang !== 'Semua' || hanyaTersedia;

  function perbaruiPilihanProyek(updater: (prev: string[]) => string[]) {
    setPilihanPerProyek((prev) => ({
      ...prev,
      [proyekAktifId]: updater(prev[proyekAktifId] ?? []),
    }));
  }

  function handleGantiProyek(idProyekBaru: string) {
    setProyekAktifId(idProyekBaru);
    setJudulKombinasi('');
    setAlasanPilihan('');
    setPesanStatus(null);
  }

  function resetFilter() {
    setFilterJenis('Semua');
    setFilterRuang('Semua');
    setHanyaTersedia(false);
  }

  function togglePilihBahan(id: string) {
    setPesanStatus(null);
    perbaruiPilihanProyek((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleGantiBahanPengganti(idLama: string, idBaru: string) {
    perbaruiPilihanProyek((prev) => {
      const tanpaLama = prev.filter((id) => id !== idLama);
      if (tanpaLama.includes(idBaru)) return tanpaLama;
      return [...tanpaLama, idBaru];
    });
    const bahanBaru = bahanById.get(idBaru);
    setPesanStatus({
      tipe: 'sukses',
      teks: `Bahan diganti ke "${bahanBaru?.nama ?? 'bahan pengganti'}". Simpan kombinasi jika daftar pilihan berubah, lalu klik Minta Sampel lagi.`,
    });
  }

  // ATURAN 2: Alasan pilihan tidak boleh kosong dan bahan dipilih minimal 2
  function handleSimpanKombinasi() {
    const alasanBersih = alasanPilihan.trim();
    const kurangDariDua = bahanTerpilih.length < 2;
    const alasanKosong = alasanBersih.length === 0;

    if (kurangDariDua && alasanKosong) {
      setPesanStatus({
        tipe: 'error',
        teks: `Kombinasi belum dapat disimpan karena bahan yang dipilih baru ${bahanTerpilih.length} dan kolom Alasan Pilihan masih kosong. Petunjuk perbaikan: pilih minimal 2 bahan pada daftar di tengah, lalu tuliskan alasan pilihan di panel kanan sebelum klik "Simpan Kombinasi".`,
      });
      return;
    }

    if (kurangDariDua) {
      setPesanStatus({
        tipe: 'error',
        teks: `Kombinasi belum dapat disimpan karena bahan yang dipilih kurang dari 2 (saat ini ${bahanTerpilih.length} bahan). Petunjuk perbaikan: klik tombol "Pilih" pada daftar bahan di bagian tengah hingga minimal 2 bahan masuk ke tabel perbandingan.`,
      });
      return;
    }

    if (alasanKosong) {
      setPesanStatus({
        tipe: 'error',
        teks: 'Kombinasi belum dapat disimpan karena kolom Alasan Pilihan masih kosong. Petunjuk perbaikan: tuliskan pertimbangan pemilihan bahan (misalnya tahan air untuk dapur atau mudah dibersihkan) pada kotak "Alasan Pilihan" di kanan, lalu klik "Simpan Kombinasi".',
      });
      return;
    }

    const kombinasiBaru: KombinasiTersimpan = {
      id: `kmb-${Date.now()}`,
      proyekId: proyekAktifId,
      judul:
        judulKombinasi.trim() ||
        `Kombinasi ${proyekAktif.nama.split(' ').slice(0, 2).join(' ')} (${bahanTerpilih.length} Bahan)`,
      daftarBahanId: bahanTerpilih.map((b) => b.id),
      alasan: alasanBersih,
      dibuatOleh: `${proyekAktif.klien} & ${proyekAktif.desainer}`,
      tanggal: formatTanggalIndonesia(hariIniDefault),
    };

    setKombinasiTersimpan((prev) => [kombinasiBaru, ...prev]);
    setJudulKombinasi('');
    setAlasanPilihan('');
    setPesanStatus({
      tipe: 'sukses',
      teks: `Kombinasi "${kombinasiBaru.judul}" berhasil disimpan. Anda sekarang dapat mengajukan "Minta Sampel" untuk kombinasi ini.`,
    });
  }

  // ATURAN 1: Tidak boleh ada bahan tidak tersedia, dan kombinasi harus sudah disimpan
  function handleMintaSampel() {
    if (bahanTerpilih.length === 0) {
      setPesanStatus({
        tipe: 'error',
        teks: 'Permintaan sampel ditolak karena belum ada bahan yang dipilih. Pilih 2–3 bahan yang tersedia, simpan kombinasinya di panel kanan, lalu klik "Minta Sampel".',
      });
      return;
    }

    const bahanTidakTersedia = bahanTerpilih.filter((b) => !b.tersedia);
    if (bahanTidakTersedia.length > 0) {
      const saranPengganti: SaranPengganti[] = bahanTidakTersedia.map(
        (bahanKosong) => {
          const pengganti = DATA_BAHAN_CONTOH.filter(
            (kandidat) =>
              kandidat.jenis === bahanKosong.jenis &&
              kandidat.tersedia &&
              !bahanTerpilihIds.includes(kandidat.id)
          );
          const semuaSejenisTersedia =
            pengganti.length > 0
              ? pengganti
              : DATA_BAHAN_CONTOH.filter(
                  (kandidat) =>
                    kandidat.jenis === bahanKosong.jenis && kandidat.tersedia
                );
          return {
            bahanTidakTersedia: bahanKosong,
            penggantiTersedia: semuaSejenisTersedia,
          };
        }
      );

      const rincianSaran = saranPengganti
        .map((item) => {
          const namaPengganti = item.penggantiTersedia
            .map((p) => p.nama)
            .join(', ');
          return `${item.bahanTidakTersedia.nama} (${item.bahanTidakTersedia.jenis}) tidak tersedia — saran pengganti sejenis yang tersedia: ${namaPengganti}`;
        })
        .join('; ');

      setPesanStatus({
        tipe: 'error',
        teks: `Permintaan sampel ditolak karena ada bahan yang sedang tidak tersedia di studio. ${rincianSaran}.`,
        saranPengganti,
      });
      return;
    }

    if (!kombinasiAktifTersimpan) {
      setPesanStatus({
        tipe: 'error',
        teks: 'Permintaan sampel ditolak karena kombinasi bahan yang dipilih belum disimpan. Isi kolom "Alasan Pilihan" dan klik "Simpan Kombinasi" terlebih dahulu (atau muat salah satu kombinasi tersimpan) sebelum meminta sampel.',
      });
      return;
    }

    const batasKembaliISO = tambahHariISO(hariIniDefault, 7);
    const permintaanBaru: PemantauanSampel[] = bahanTerpilih.map((b, idx) => ({
      id: `smp-${Date.now()}-${idx}`,
      proyekId: proyekAktifId,
      bahanId: b.id,
      namaBahan: b.nama,
      kodeSampel: b.kode,
      peminjam: proyekAktif.klien,
      peran: 'Pelanggan',
      tanggalPinjamISO: hariIniDefault,
      batasKembaliISO,
      tahap: 'Diminta',
    }));

    setDaftarSampel((prev) => [...permintaanBaru, ...prev]);
    setTabBawah('pemantauan');
    setPesanStatus({
      tipe: 'sukses',
      teks: `Permintaan sampel untuk ${bahanTerpilih.length} bahan berhasil dibuat dengan status "Diminta" dan tenggat pengembalian 7 hari (${formatTanggalIndonesia(batasKembaliISO)}).`,
    });
  }

  function handleMuatKombinasi(kombinasi: KombinasiTersimpan) {
    perbaruiPilihanProyek(() => [...kombinasi.daftarBahanId]);
    setPesanStatus({
      tipe: 'sukses',
      teks: `Kombinasi "${kombinasi.judul}" dimuat ke tabel perbandingan.`,
    });
  }

  function handleLanjutTahap(id: string, tahapBerikutnya: TahapSampel) {
    setDaftarSampel((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, tahap: tahapBerikutnya } : item
      )
    );
    setPesanStatus({
      tipe: 'sukses',
      teks: `Status sampel diperbarui menjadi "${tahapBerikutnya}".`,
    });
  }

  function handleTandaiDikembalikan(sampel: PemantauanSampel) {
    if (sampel.tahap !== 'Dikirim') {
      setPesanStatus({
        tipe: 'error',
        teks: `Sampel "${sampel.namaBahan}" belum berstatus Dikirim. Tombol "Tandai Dikembalikan" hanya boleh digunakan setelah sampel dikirim.`,
      });
      return;
    }

    setDaftarSampel((prev) =>
      prev.map((item) =>
        item.id === sampel.id ? { ...item, tahap: 'Dikembalikan' } : item
      )
    );
    setPesanStatus({
      tipe: 'sukses',
      teks: `Sampel "${sampel.namaBahan}" telah ditandai Dikembalikan.`,
    });
  }

  function warnaStatusTampil(status: StatusTampilSampel): string {
    switch (status) {
      case 'Terlambat':
        return 'font-semibold text-red-600';
      case 'Diminta':
        return 'font-medium text-zinc-700';
      case 'Disiapkan':
        return 'font-medium text-amber-700';
      case 'Dikirim':
        return 'font-semibold text-[#1F3A3D]';
      case 'Dikembalikan':
        return 'font-medium text-emerald-700';
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-zinc-900">
      {/* BAGIAN ATAS: Judul & Pemilih Proyek Contoh */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-baseline gap-4">
            <h1 className="text-xl font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0">
              SampelKu
            </h1>
            <span
              className="hidden text-sm text-zinc-400 sm:inline"
              aria-hidden="true"
            >
              /
            </span>
            <p className="text-sm text-zinc-600">
              Perbandingan Sifat Bahan &amp; Pemantauan Sampel Studio Interior
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="pilih-proyek"
                className="text-xs font-semibold text-zinc-700 whitespace-nowrap shrink-0"
              >
                Proyek Contoh:
              </label>
              <select
                id="pilih-proyek"
                value={proyekAktifId}
                onChange={(e) => handleGantiProyek(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 focus:border-[#1F3A3D] focus:outline-none focus:ring-2 focus:ring-[#1F3A3D]/20"
              >
                {DAFTAR_PROYEK_CONTOH.map((proyek) => (
                  <option key={proyek.id} value={proyek.id}>
                    {proyek.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 text-xs text-zinc-600">
              <span>{proyekAktif.lokasi}</span>
              <span className="text-zinc-300" aria-hidden="true">
                ·
              </span>
              <span>Klien: {proyekAktif.klien}</span>
            </div>
          </div>
        </div>
      </header>

      {/* AREA UTAMA: Kiri (Filter) + Tengah (Daftar & Perbandingan) + Kanan (Kombinasi & Alasan) */}
      <main className="mx-auto max-w-[1440px] space-y-6 px-6 py-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* DI KIRI: Filter Jenis Bahan, Ruang, dan Centang "Hanya yang tersedia" */}
          <aside
            aria-label="Filter Bahan"
            className="rounded-lg border border-zinc-200 bg-white p-5 lg:col-span-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="text-base font-semibold text-zinc-950">
                Filter Bahan
              </h2>
              {filterAktif && (
                <button
                  type="button"
                  onClick={resetFilter}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Atur Ulang
                </button>
              )}
            </div>

            <div className="mt-4 space-y-5">
              {/* Filter Jenis Bahan */}
              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-700">
                  Jenis Bahan
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2">
                  {(['Semua', ...DAFTAR_JENIS_BAHAN] as const).map((jenis) => {
                    const aktif = filterJenis === jenis;
                    return (
                      <button
                        key={jenis}
                        type="button"
                        onClick={() => setFilterJenis(jenis)}
                        className={`rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D] whitespace-nowrap shrink-0 cursor-pointer ${
                          aktif
                            ? 'border-[#1F3A3D] bg-[#1F3A3D] font-medium text-white'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                        }`}
                      >
                        {jenis}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Ruang */}
              <div>
                <label
                  htmlFor="filter-ruang"
                  className="mb-2 block text-xs font-semibold text-zinc-700"
                >
                  Ruang yang Cocok
                </label>
                <select
                  id="filter-ruang"
                  value={filterRuang}
                  onChange={(e) =>
                    setFilterRuang(e.target.value as 'Semua' | RuangInterior)
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#1F3A3D] focus:outline-none focus:ring-2 focus:ring-[#1F3A3D]/20"
                >
                  <option value="Semua">Semua Ruang</option>
                  {DAFTAR_RUANG.map((ruang) => (
                    <option key={ruang} value={ruang}>
                      {ruang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Centang Hanya yang Tersedia */}
              <div className="border-t border-zinc-200 pt-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={hanyaTersedia}
                    onChange={(e) => setHanyaTersedia(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[#1F3A3D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D]"
                  />
                  <span className="text-sm text-zinc-800">
                    Hanya yang tersedia
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      Sembunyikan bahan yang sampelnya kosong
                    </span>
                  </span>
                </label>
              </div>

              {/* Ringkasan Filter */}
              <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-500 tabular-nums">
                Menampilkan {bahanTersaring.length} dari{' '}
                {DATA_BAHAN_CONTOH.length} bahan contoh
              </div>
            </div>
          </aside>

          {/* DI TENGAH: Daftar Bahan & Tabel Perbandingan Tiga Sifat */}
          <section
            aria-label="Daftar Bahan dan Perbandingan"
            className="space-y-6 lg:col-span-5"
          >
            {/* Daftar Bahan */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">
                    Daftar Bahan Studio
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Pilih 2–3 bahan untuk membandingkan sifat pemakaiannya
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-600 tabular-nums">
                  {bahanTerpilih.length} dipilih
                </span>
              </div>

              {bahanTersaring.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-zinc-800">
                    Tidak ada bahan yang sesuai dengan filter.
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Ubah jenis bahan, pilihan ruang, atau nonaktifkan centang
                    &ldquo;Hanya yang tersedia&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilter}
                    className="mt-4 rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Tampilkan Semua Bahan
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-zinc-200">
                  {bahanTersaring.map((bahan) => {
                    const dipilih = bahanTerpilihIds.includes(bahan.id);
                    return (
                      <li
                        key={bahan.id}
                        className="flex items-start justify-between gap-4 py-3.5 first:pt-3 last:pb-1"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className="mt-0.5 h-8 w-8 shrink-0 rounded border border-zinc-300"
                            style={{ backgroundColor: bahan.warna }}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-mono text-xs text-zinc-500 tabular-nums">
                                {bahan.kode}
                              </span>
                              <h3 className="text-sm font-semibold text-zinc-950">
                                {bahan.nama}
                              </h3>
                            </div>

                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-600">
                              <span>{bahan.jenis}</span>
                              <span className="text-zinc-300" aria-hidden="true">
                                ·
                              </span>
                              <span>{bahan.ruangCocok.join(', ')}</span>
                              <span className="text-zinc-300" aria-hidden="true">
                                ·
                              </span>
                              <span
                                className={
                                  bahan.tersedia
                                    ? 'font-medium text-emerald-700'
                                    : 'font-medium text-red-600'
                                }
                              >
                                {bahan.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                              {bahan.catatanSingkat}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => togglePilihBahan(bahan.id)}
                          aria-pressed={dipilih}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D] whitespace-nowrap shrink-0 cursor-pointer ${
                            dipilih
                              ? 'border-[#1F3A3D] bg-[#1F3A3D]/10 text-[#1F3A3D] hover:bg-[#1F3A3D]/15'
                              : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          {dipilih ? 'Dipilih' : 'Pilih'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Tabel Perbandingan Tiga Sifat */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-200 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-950">
                    Tabel Perbandingan Tiga Sifat
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Skala 1 (rendah) hingga 5 (sangat baik)
                  </p>
                </div>
                {bahanTerpilih.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPesanStatus(null);
                      perbaruiPilihanProyek(() => []);
                    }}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Kosongkan Pilihan
                  </button>
                )}
              </div>

              {bahanTerpilih.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-zinc-700">
                    Belum ada bahan yang dipilih untuk dibandingkan.
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Klik tombol &ldquo;Pilih&rdquo; pada 2–3 bahan di daftar atas
                    untuk membandingkan sifatnya.
                  </p>
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-600">
                        <th className="py-2.5 pr-3">Bahan</th>
                        <th className="px-2 py-2.5">Ketahanan Gores</th>
                        <th className="px-2 py-2.5">Tahan Air</th>
                        <th className="px-2 py-2.5">Kemudahan Perawatan</th>
                        <th className="py-2.5 pl-2 text-right">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {bahanTerpilih.map((bahan) => (
                        <tr key={bahan.id} className="hover:bg-zinc-50/70">
                          <td className="py-3 pr-3 align-top">
                            <div className="font-medium text-zinc-950">
                              {bahan.nama}
                            </div>
                            <div className="mt-0.5 text-xs text-zinc-500">
                              {bahan.jenis} ·{' '}
                              <span
                                className={
                                  bahan.tersedia
                                    ? 'text-emerald-700'
                                    : 'text-red-600 font-medium'
                                }
                              >
                                {bahan.tersedia ? 'Tersedia' : 'Tidak Tersedia'}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3 align-top">
                            <SkorBar
                              nilai={bahan.ketahananGores}
                              label="Ketahanan Gores"
                            />
                          </td>
                          <td className="px-2 py-3 align-top">
                            <SkorBar
                              nilai={bahan.tahanAir}
                              label="Tahan Air"
                            />
                          </td>
                          <td className="px-2 py-3 align-top">
                            <SkorBar
                              nilai={bahan.kemudahanPerawatan}
                              label="Kemudahan Perawatan"
                            />
                          </td>
                          <td className="py-3 pl-2 text-right align-top">
                            <button
                              type="button"
                              onClick={() => togglePilihBahan(bahan.id)}
                              aria-label={`Hapus ${bahan.nama} dari perbandingan`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* DI KANAN: Kombinasi Tersimpan, Kolom Alasan Pilihan, Tombol Simpan Kombinasi & Minta Sampel */}
          <aside
            aria-label="Kombinasi Bahan dan Permintaan Sampel"
            className="rounded-lg border border-zinc-200 bg-white p-5 lg:col-span-4"
          >
            <div className="border-b border-zinc-200 pb-3">
              <h2 className="text-base font-semibold text-zinc-950">
                Kombinasi &amp; Permintaan Sampel
              </h2>
              <p className="text-xs text-zinc-500">
                Simpan kombinasi bahan beserta alasannya sebelum meminta sampel
              </p>
            </div>

            {/* Ringkasan Bahan Terpilih */}
            <div className="mt-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-700">
                  Bahan Terpilih ({bahanTerpilih.length})
                </p>
                {bahanTerpilih.length > 0 && (
                  <span
                    className={`text-xs font-medium ${
                      kombinasiAktifTersimpan
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {kombinasiAktifTersimpan
                      ? 'Sudah tersimpan'
                      : 'Belum disimpan'}
                  </span>
                )}
              </div>

              {bahanTerpilih.length === 0 ? (
                <p className="mt-1.5 text-xs text-zinc-500">
                  Belum ada bahan dipilih. Pilih minimal 2 bahan dari daftar di
                  tengah.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-zinc-100 border-y border-zinc-200">
                  {bahanTerpilih.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 py-2 text-xs"
                    >
                      <span className="truncate font-medium text-zinc-800">
                        {b.nama}{' '}
                        <span
                          className={`font-normal ${
                            b.tersedia ? 'text-zinc-500' : 'text-red-600'
                          }`}
                        >
                          ({b.jenis}
                          {!b.tersedia ? ' · Tidak Tersedia' : ''})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePilihBahan(b.id)}
                        aria-label={`Keluarkan ${b.nama}`}
                        className="text-zinc-400 hover:text-zinc-800 shrink-0 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Form Alasan Pilihan & Tombol Aksi */}
            <div className="mt-4 space-y-3">
              <div>
                <label
                  htmlFor="judul-kombinasi"
                  className="mb-1 block text-xs font-semibold text-zinc-700"
                >
                  Nama Kombinasi (Opsional)
                </label>
                <input
                  id="judul-kombinasi"
                  type="text"
                  value={judulKombinasi}
                  onChange={(e) => setJudulKombinasi(e.target.value)}
                  placeholder="Contoh: Paket Dapur & Ruang Makan"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1F3A3D] focus:outline-none focus:ring-2 focus:ring-[#1F3A3D]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="alasan-pilihan"
                  className="mb-1 block text-xs font-semibold text-zinc-700"
                >
                  Alasan Pilihan <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="alasan-pilihan"
                  rows={3}
                  value={alasanPilihan}
                  onChange={(e) => setAlasanPilihan(e.target.value)}
                  placeholder="Tuliskan alasan memilih bahan ini (mis. tahan air untuk dapur basah, tahan gores, mudah dibersihkan)..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1F3A3D] focus:outline-none focus:ring-2 focus:ring-[#1F3A3D]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleSimpanKombinasi}
                  className="flex-1 rounded-md bg-[#1F3A3D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#172B2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Simpan Kombinasi
                </button>
                <button
                  type="button"
                  onClick={handleMintaSampel}
                  className="flex-1 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F3A3D] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Minta Sampel
                </button>
              </div>
            </div>

            {/* Kombinasi Tersimpan */}
            <div className="mt-6 border-t border-zinc-200 pt-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-zinc-950">
                  Kombinasi Tersimpan
                </h3>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {kombinasiProyekIni.length}
                </span>
              </div>

              {kombinasiProyekIni.length === 0 ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Belum ada kombinasi tersimpan untuk proyek ini. Pilih minimal 2
                  bahan, isi alasan pilihan, lalu klik &ldquo;Simpan
                  Kombinasi&rdquo;.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-zinc-200">
                  {kombinasiProyekIni.map((kombinasi) => {
                    const namaBahanList = kombinasi.daftarBahanId
                      .map((id) => bahanById.get(id)?.nama)
                      .filter(Boolean);
                    const sedangDimuat =
                      kombinasiAktifTersimpan?.id === kombinasi.id;

                    return (
                      <li
                        key={kombinasi.id}
                        className="py-3 first:pt-1 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-zinc-900">
                            {kombinasi.judul}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleMuatKombinasi(kombinasi)}
                            className="text-xs font-medium text-[#1F3A3D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {sedangDimuat ? 'Sedang Dipilih' : 'Muat'}
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-500 tabular-nums">
                          {kombinasi.dibuatOleh} · {kombinasi.tanggal}
                        </p>
                        <p className="mt-1.5 text-xs font-medium text-zinc-700">
                          Bahan: {namaBahanList.join(', ')}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                          Alasan: {kombinasi.alasan}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>

        {/* DI BAWAH: Tempat Pesan Kesalahan & Tab "Pemantauan Sampel" */}
        <section
          aria-label="Pemantauan Sampel dan Pesan Kesalahan"
          className="space-y-4"
        >
          {/* Tempat Pesan Kesalahan / Pemberitahuan */}
          <div
            role="alert"
            aria-live="polite"
            className={`rounded-lg border px-4 py-3 text-sm ${
              pesanStatus?.tipe === 'error'
                ? 'border-red-300 bg-red-50 text-red-900'
                : pesanStatus?.tipe === 'sukses'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-zinc-200 bg-white text-zinc-600'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                {pesanStatus?.tipe === 'error' ? (
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                    aria-hidden="true"
                  />
                ) : pesanStatus?.tipe === 'sukses' ? (
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                    aria-hidden="true"
                  />
                )}
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">
                      {pesanStatus?.tipe === 'error'
                        ? 'Pesan Kesalahan: '
                        : pesanStatus?.tipe === 'sukses'
                          ? 'Berhasil: '
                          : 'Pesan Kesalahan & Petunjuk: '}
                    </span>
                    <span>
                      {pesanStatus
                        ? pesanStatus.teks
                        : 'Tidak ada kesalahan. Jika ada aturan yang belum terpenuhi, petunjuk perbaikan akan muncul di sini.'}
                    </span>
                  </div>

                  {pesanStatus?.saranPengganti &&
                    pesanStatus.saranPengganti.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {pesanStatus.saranPengganti.map((saran) =>
                          saran.penggantiTersedia.map((pengganti) => (
                            <button
                              key={`${saran.bahanTidakTersedia.id}-${pengganti.id}`}
                              type="button"
                              onClick={() =>
                                handleGantiBahanPengganti(
                                  saran.bahanTidakTersedia.id,
                                  pengganti.id
                                )
                              }
                              className="rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-900 hover:bg-red-100 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Ganti {saran.bahanTidakTersedia.nama} ke{' '}
                              {pengganti.nama}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                </div>
              </div>

              {pesanStatus && (
                <button
                  type="button"
                  onClick={() => setPesanStatus(null)}
                  aria-label="Tutup pesan"
                  className="text-xs font-medium underline-offset-2 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>

          {/* Panel Tab Pemantauan Sampel */}
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-5 pt-3">
              <div
                role="tablist"
                aria-label="Navigasi Pemantauan Sampel"
                className="flex items-center gap-6"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabBawah === 'pemantauan'}
                  onClick={() => setTabBawah('pemantauan')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tabBawah === 'pemantauan'
                      ? 'border-[#1F3A3D] text-zinc-950'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Pemantauan Sampel ({sampelProyekIni.length})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={tabBawah === 'terlambat'}
                  onClick={() => setTabBawah('terlambat')}
                  className={`border-b-2 pb-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    tabBawah === 'terlambat'
                      ? 'border-[#1F3A3D] text-zinc-950'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Belum Dikembalikan ({sampelPerluTindakLanjut.length})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-3">
                <label
                  htmlFor="tanggal-cek-tenggat"
                  className="text-xs text-zinc-500 whitespace-nowrap"
                >
                  Tanggal Cek Tenggat:
                </label>
                <input
                  id="tanggal-cek-tenggat"
                  type="date"
                  value={tanggalAcuanISO}
                  onChange={(e) =>
                    setTanggalAcuanISO(e.target.value || hariIniDefault)
                  }
                  className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 font-mono text-xs text-zinc-800 tabular-nums focus:border-[#1F3A3D] focus:outline-none focus:ring-2 focus:ring-[#1F3A3D]/20"
                />
              </div>
            </div>

            <div className="p-5">
              <p className="mb-3 text-xs text-zinc-500">
                Urutan status: Diminta → Disiapkan → Dikirim → Dikembalikan.
                Tombol &ldquo;Tandai Dikembalikan&rdquo; aktif setelah status
                Dikirim. Sampel yang melewati tenggat 7 hari otomatis berstatus
                Terlambat.
              </p>

              {dataTabAktif.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-600">
                  Belum ada catatan permintaan sampel untuk proyek ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-600">
                        <th className="py-2.5 pr-4">Kode &amp; Bahan</th>
                        <th className="px-3 py-2.5">Peminjam</th>
                        <th className="px-3 py-2.5">Tanggal Minta</th>
                        <th className="px-3 py-2.5">Tenggat (7 Hari)</th>
                        <th className="px-3 py-2.5">Status Sampel</th>
                        <th className="py-2.5 pl-3 text-right">
                          Pembaruan Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {dataTabAktif.map((sampel) => {
                        const statusTampil = dapatkanStatusTampil(sampel);
                        const bolehDikembalikan = sampel.tahap === 'Dikirim';

                        return (
                          <tr key={sampel.id} className="hover:bg-zinc-50/70">
                            <td className="py-3 pr-4">
                              <span className="mr-2 font-mono text-xs text-zinc-500 tabular-nums">
                                {sampel.kodeSampel}
                              </span>
                              <span className="font-medium text-zinc-950">
                                {sampel.namaBahan}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              {sampel.peminjam}{' '}
                              <span className="text-xs text-zinc-500">
                                · {sampel.peran}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-mono text-xs text-zinc-600 tabular-nums">
                              {formatTanggalIndonesia(sampel.tanggalPinjamISO)}
                            </td>
                            <td className="px-3 py-3 font-mono text-xs text-zinc-600 tabular-nums">
                              {formatTanggalIndonesia(sampel.batasKembaliISO)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <span className={warnaStatusTampil(statusTampil)}>
                                {statusTampil}
                              </span>
                              {statusTampil === 'Terlambat' && (
                                <span className="ml-1.5 text-zinc-500">
                                  (sebelumnya: {sampel.tahap})
                                </span>
                              )}
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <div className="inline-flex items-center justify-end gap-2">
                                {sampel.tahap === 'Diminta' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleLanjutTahap(sampel.id, 'Disiapkan')
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Siapkan
                                    <ArrowRight
                                      className="h-3 w-3 text-zinc-500"
                                      aria-hidden="true"
                                    />
                                  </button>
                                )}

                                {sampel.tahap === 'Disiapkan' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleLanjutTahap(sampel.id, 'Dikirim')
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    Kirim
                                    <ArrowRight
                                      className="h-3 w-3 text-zinc-500"
                                      aria-hidden="true"
                                    />
                                  </button>
                                )}

                                {sampel.tahap !== 'Dikembalikan' ? (
                                  <button
                                    type="button"
                                    disabled={!bolehDikembalikan}
                                    onClick={() =>
                                      handleTandaiDikembalikan(sampel)
                                    }
                                    title={
                                      bolehDikembalikan
                                        ? 'Tandai sampel sudah kembali ke studio'
                                        : 'Baru boleh dipakai setelah status Dikirim'
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                                      bolehDikembalikan
                                        ? 'border-[#1F3A3D] bg-[#1F3A3D] text-white hover:bg-[#172B2E] cursor-pointer'
                                        : 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <PackageCheck
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                    Tandai Dikembalikan
                                  </button>
                                ) : (
                                  <span className="text-xs text-zinc-400">
                                    Selesai
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
