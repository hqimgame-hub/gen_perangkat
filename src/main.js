import './style.css'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'

const form = document.getElementById('modulForm');
const resultDiv = document.getElementById('result');
const modulContent = document.getElementById('modulContent');
const resultTitle = document.getElementById('resultTitle');
const exportWordBtn = document.getElementById('exportWord');

const KKO = {
  C1: ['Menyebutkan', 'Menjelaskan', 'Mengidentifikasi', 'Menunjukkan'],
  C2: ['Mengklasifikasikan', 'Membandingkan', 'Menyimpulkan', 'Menerjemahkan'],
  C3: ['Menerapkan', 'Menghitung', 'Menggunakan', 'Mendemonstrasikan'],
  C4: ['Menganalisis', 'Menelaah', 'Mendeteksi', 'Mengaitkan'],
  C5: ['Mengevaluasi', 'Memvalidasi', 'Mengkritik', 'Menilai'],
  C6: ['Merancang', 'Membangun', 'Menciptakan', 'Mengembangkan']
};

// Data Mappings
const JENJANG_MAP = {
  'SD': {
    fase: ['A', 'B', 'C'],
    subjects: ['Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'IPAS', 'Seni Budaya', 'PJOK', 'Bahasa Inggris', 'Lainnya']
  },
  'SMP': {
    fase: ['D'],
    subjects: ['Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'Bahasa Inggris', 'Informatika', 'Seni Budaya', 'PJOK', 'Lainnya']
  },
  'SMA': {
    fase: ['E', 'F'],
    subjects: ['Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Bahasa Inggris', 'Informatika', 'Sejarah', 'PJOK', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Sosiologi', 'Geografi', 'Seni Budaya', 'Lainnya']
  },
  'SMK': {
    fase: ['E', 'F'],
    subjects: ['Pendidikan Pancasila', 'Bahasa Indonesia', 'Matematika', 'Bahasa Inggris', 'Informatika', 'Sejarah', 'PJOK', 'Fisika', 'Kimia', 'Biologi', 'Seni Budaya', 'Kejuruan', 'Lainnya']
  }
};

const FASE_CLASSES = {
  'A': [1, 2],
  'B': [3, 4],
  'C': [5, 6],
  'D': [7, 8, 9],
  'E': [10],
  'F': [11, 12]
};

const formFields = ['jenjang', 'category', 'fase', 'class', 'semester', 'subject', 'topic', 'cp', 'duration', 'pertemuan', 'model', 'isDifferentiated'];

function saveFormData() {
  const data = {};
  formFields.forEach(field => {
    const el = document.getElementById(field);
    if (el) {
      data[field] = el.type === 'checkbox' ? el.checked : el.value;
    }
  });
  localStorage.setItem('modulData', JSON.stringify(data));
}

function loadFormData() {
  const saved = localStorage.getItem('modulData');
  if (saved) {
    const data = JSON.parse(saved);
    // Load Jenjang first to trigger dependent dropdowns
    const jenjangEl = document.getElementById('jenjang');
    if (jenjangEl && data.jenjang) {
      jenjangEl.value = data.jenjang;
      updateJenjangOptions();

      const faseEl = document.getElementById('fase');
      if (faseEl && data.fase) {
        faseEl.value = data.fase;
        updateFaseOptions();
      }
    }

    formFields.forEach(field => {
      const el = document.getElementById(field);
      if (el && data[field] !== undefined) {
        if (el.type === 'checkbox') el.checked = data[field];
        else el.value = data[field];
      }
    });
  }
}

const jenjangEl = document.getElementById('jenjang');
const categoryEl = document.getElementById('category');
const faseEl = document.getElementById('fase');
const classEl = document.getElementById('class');
const subjectInput = document.getElementById('subject');

function updateJenjangOptions() {
  const jen = jenjangEl.value;
  if (!jen) {
    categoryEl.innerHTML = '<option value="">-- Pilih Jenjang Terlebih Dahulu --</option>';
    faseEl.innerHTML = '<option value="">-- Pilih Jenjang Terlebih Dahulu --</option>';
    return;
  }

  const map = JENJANG_MAP[jen];

  // Update Category (Subjects)
  categoryEl.innerHTML = '<option value="">-- Pilih Mapel --</option>';
  map.subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.innerText = s;
    categoryEl.appendChild(opt);
  });

  // Update Fase
  faseEl.innerHTML = '<option value="">-- Pilih Fase --</option>';
  map.fase.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.innerText = `Fase ${f}`;
    faseEl.appendChild(opt);
  });

  updateFaseOptions(); // Clear classes
}

function updateFaseOptions() {
  const fase = faseEl.value;
  if (!fase) {
    classEl.innerHTML = '<option value="">-- Pilih Fase Terlebih Dahulu --</option>';
    return;
  }

  classEl.innerHTML = '<option value="">-- Pilih Kelas --</option>';
  FASE_CLASSES[fase].forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.innerText = `Kelas ${c}`;
    classEl.appendChild(opt);
  });
}

jenjangEl.addEventListener('change', updateJenjangOptions);
faseEl.addEventListener('change', updateFaseOptions);
categoryEl.addEventListener('change', () => {
  if (categoryEl.value !== 'Lainnya') {
    subjectInput.value = categoryEl.value;
  }
});

formFields.forEach(field => {
  const el = document.getElementById(field);
  if (el) el.addEventListener('input', saveFormData);
});

window.addEventListener('load', loadFormData);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    jenjang: document.getElementById('jenjang').value,
    category: document.getElementById('category').value,
    fase: document.getElementById('fase').value,
    class: document.getElementById('class').value,
    semester: document.getElementById('semester').value,
    subject: document.getElementById('subject').value,
    topic: document.getElementById('topic').value,
    cp: document.getElementById('cp').value,
    duration: document.getElementById('duration').value,
    pertemuan: document.getElementById('pertemuan').value,
    model: document.getElementById('model').value,
    isDifferentiated: document.getElementById('isDifferentiated').checked
  };

  generateModul(data);
});

exportWordBtn.addEventListener('click', async () => {
  const content = modulContent.innerHTML;

  // Wrap content with basic HTML structure for Word
  const htmlDoc = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Times New Roman', Times, serif; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; }
        .info-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = await asBlob(htmlDoc);
  saveAs(blob, `${resultTitle.innerText.replace(/:/g, '-')}.docx`);
});

function generateModul(data) {
  // 1. Generate Tujuan Pembelajaran (3-5 items)
  const tps = generateTP(data.cp, data.topic);

  // 2. Generate Alur Tujuan Pembelajaran (ATP) dengan 3 Tahap
  const atp = generateATP(tps);

  // 3. Generate Langkah Pembelajaran (Deep Learning + Diferensiasi)
  const steps = generateSteps(data.model, data.topic, tps, data.isDifferentiated);

  // 4. Generate Asesmen yang selaras
  const assessment = generateAssessment(data.model, data.topic, tps);

  // 5. Generate Rubrik KKTP
  const rubric = generateKKTP(tps);

  // 6. Generate Administrasi Tambahan (Glosarium & Daftar Pustaka)
  const extras = generateExtras(data.topic);

  renderResult(data, tps, atp, steps, assessment, extras, rubric);
}

function generateKKTP(tps) {
  return tps.map(tp => {
    // Ambil kata kerja pertama sebagai indikator
    const verb = tp.split(' ')[0];
    return {
      indikator: tp,
      kriteria: {
        perluBimbingan: `Belum mampu ${tp.toLowerCase()}.`,
        cukup: `Mampu ${tp.toLowerCase()} dengan bimbingan intensif.`,
        baik: `Mampu ${tp.toLowerCase()} secara mandiri namun belum konsisten.`,
        sangatBaik: `Mampu ${tp.toLowerCase()} secara mandiri, konsisten, dan dapat membantu teman.`
      }
    };
  });
}

function generateTP(cp, topic) {
  // Membersihkan CP dan membaginya menjadi fragmen kompetensi
  // Mencari kata penghubung umum dalam CP Indonesia seperti "melalui", "dengan", "dan", serta tanda baca
  const fragments = cp
    .split(/[.;]|\bdan\b|\bserta\b/)
    .map(s => s.trim())
    .filter(s => s.length > 15); // Filter fragmen yang terlalu pendek

  // Menentukan jumlah TP (3-5)
  const count = Math.min(Math.max(fragments.length, 3), 5);

  // Pemetaan KKO berdasarkan kata kunci di CP (simulasi analisis tingkat kognitif)
  const getKKO = (text) => {
    const low = text.toLowerCase();
    if (low.includes('buat') || low.includes('rancang') || low.includes('cipta')) return KKO.C6;
    if (low.includes('evaluasi') || low.includes('nilai') || low.includes('uji')) return KKO.C5;
    if (low.includes('analisis') || low.includes('kait') || low.includes('elaah')) return KKO.C4;
    return KKO.C3.concat(KKO.C2); // Default ke aplikasi/pemahaman
  };

  const tps = [];
  for (let i = 0; i < count; i++) {
    const fragment = fragments[i % fragments.length] || `${topic} secara komprehensif`;
    const pool = getKKO(fragment);
    const verb = pool[Math.floor(Math.random() * pool.length)];

    // Membersihkan fragment dari kata kerja awal jika ada agar tidak dobel
    let cleanedFragment = fragment
      .replace(/^(peserta didik|siswa|mampu|dapat|memahami|mengerti)\s+/i, '')
      .replace(/^[a-z]/, (L) => L.toLowerCase());

    // Memastikan satu kalimat utuh
    tps.push(`${verb} ${cleanedFragment}.`);
  }

  return tps;
}

function generateATP(tps) {
  // Membagi TP ke dalam 3 tahap secara logis
  const stages = {
    memahami: [],
    mengaplikasi: [],
    merefleksi: []
  };

  tps.forEach((tp, index) => {
    if (index === 0 || tp.toLowerCase().includes('jelaskan') || tp.toLowerCase().includes('identifikasi')) {
      stages.memahami.push(tp);
    } else if (index === tps.length - 1 || tp.toLowerCase().includes('evaluasi') || tp.toLowerCase().includes('nilai')) {
      stages.merefleksi.push(tp);
    } else {
      stages.mengaplikasi.push(tp);
    }
  });

  // Fallback jika ada tahap yang kosong
  if (stages.memahami.length === 0) stages.memahami.push(tps[0]);
  if (stages.mengaplikasi.length === 0 && tps.length > 1) stages.mengaplikasi.push(tps[1]);
  if (stages.merefleksi.length === 0 && tps.length > 2) stages.merefleksi.push(tps[tps.length - 1]);

  return stages;
}

function generateSteps(model, topic, tps, isDifferentiated) {
  const baseSteps = {
    pendahuluan: {
      guru: [
        'Membuka pembelajaran dengan salam dan doa.',
        'Melakukan presensi dan menanyakan kabar peserta didik.',
        `Memberikan pertanyaan pemantik terkait ${topic} untuk memotivasi siswa.`,
        'Menyampaikan tujuan pembelajaran yang akan dicapai.'
      ],
      siswa: [
        'Menjawab salam dan berdoa bersama.',
        'Merespon presensi guru.',
        'Menjawab pertanyaan pemantik berdasarkan pengalaman pribadi.',
        'Menyimak tujuan pembelajaran.'
      ]
    },
    inti: [], // Akan diisi sesuai fase model
    penutup: {
      guru: [
        'Membimbing siswa menyimpulkan hasil pembelajaran.',
        'Melakukan refleksi bersama siswa tentang kendala yang dihadapi.',
        'Memberikan penugasan atau informasi materi pertemuan berikutnya.',
        'Menutup pembelajaran dengan doa dan salam.'
      ],
      siswa: [
        'Membuat resume atau kesimpulan materi.',
        'Mengungkapkan perasaan dan pemahaman setelah belajar.',
        'Mencatat informasi tugas/materi berikutnya.',
        'Berdoa dan menjawab salam.'
      ]
    }
  };

  const modelPhases = {
    'Project Based Learning': [
      {
        name: 'Fase 1: Pertanyaan Mendasar',
        guru: [`Menyajikan tantangan atau pertanyaan esensial tentang ${topic} yang membangkitkan rasa ingin tahu.`],
        siswa: [`Mengidentifikasi masalah dan tantangan nyata terkait ${topic} yang akan diselesaikan.`]
      },
      {
        name: 'Fase 2: Mendesain Perencanaan Produk',
        guru: ['Membantu siswa membentuk kelompok heterogen.', 'Memastikan setiap kelompok merancang desain proyek dan memilih alat/bahan yang sesuai.'],
        siswa: ['Berdiskusi dalam kelompok untuk merancang langkah-langkah pembuatan proyek.', 'Menentukan pembagian tugas dalam tim.']
      },
      {
        name: 'Fase 3: Menyusun Jadwal Pembuatan',
        guru: ['Membimbing siswa menyusun timeline penyelesaian proyek agar selesai tepat waktu.'],
        siswa: ['Membuat jadwal aktivitas yang mendetail dari awal hingga pengujian produk akhir.']
      },
      {
        name: 'Fase 4: Memonitor Keaktifan dan Perkembangan Proyek',
        guru: ['Memantau jalannya proyek dan memberikan pendampingan (scaffolding).', 'Memfasilitasi diskusi saat siswa menemui kendala teknis.'],
        siswa: ['Melaksanakan langkah-langkah proyek secara kolaboratif (Tahap Mengaplikasi).', 'Mendokumentasikan setiap tahapan perkembangan karya.'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Mempraktikkan langkah dasar proyek dengan panduan template/lembar kerja terstruktur.',
          menengah: 'Menyelesaikan proyek sesuai rencana kelompok dengan konsultasi berkala.',
          mahir: 'Mengembangkan fitur tambahan atau analisis mendalam pada proyek yang melebihi standar dasar.'
        } : null
      },
      {
        name: 'Fase 5: Menguji Hasil',
        guru: ['Memfasilitasi presentasi atau unjuk karya (expo) hasil proyek.', 'Memberikan penilaian terhadap kualitas produk dan pemahaman konsep.'],
        siswa: ['Mempresentasikan hasil proyek di depan kelas.', 'Mendemonstrasikan bagaimana proyek tersebut memecahkan masalah awal.']
      },
      {
        name: 'Fase 6: Evaluasi Pengalaman Belajar',
        guru: ['Membimbing refleksi terhadap seluruh proses pengerjaan proyek.', 'Memberikan penguatan jika ada konsep yang belum tuntas.'],
        siswa: ['Melakukan evaluasi diri dan rekan sejawat.', 'Menyimpulkan pembelajaran baru yang didapat (Tahap Merefleksi).']
      }
    ],
    'Problem Based Learning': [
      {
        name: 'Fase 1: Orientasi Peserta Didik pada Masalah',
        guru: [`Menyajikan skenario masalah kontekstual yang kompleks terkait ${topic}.`],
        siswa: [`Menganalisis fenomena masalah dan merumuskan pertanyaan kunci (Tahap Memahami).`]
      },
      {
        name: 'Fase 2: Mengorganisasikan Peserta Didik untuk Belajar',
        guru: ['Memastikan setiap siswa memahami batasan masalah dan pembagian peran dalam kelompok.'],
        siswa: ['Membagi tugas investigasi dalam kelompok secara adil.']
      },
      {
        name: 'Fase 3: Membimbing Penyelidikan Individu maupun Kelompok',
        guru: ['Mendorong siswa mencari berbagai referensi data pendukung.', 'Membimbing jalannya diskusi pemecahan masalah agar tetap fokus.'],
        siswa: ['Melakukan penyelidikan melalui literasi, observasi, atau wawancara (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Mengidentifikasi 1 solusi sederhana dengan bimbingan intensif dalam mengolah data awal.',
          menengah: 'Membandingkan 2-3 alternatif solusi dan memilih yang paling efektif secara mandiri.',
          mahir: 'Menganalisis dampak jangka panjang dari solusi yang diusulkan dan menyusun argumen kritis.'
        } : null
      },
      {
        name: 'Fase 4: Mengembangkan dan Menyajikan Hasil Karya',
        guru: ['Membimbing siswa menyusun laporan atau media presentasi yang tepat.'],
        siswa: ['Menyusun solusi akhir dalam bentuk draf, poster, atau presentasi digital.']
      },
      {
        name: 'Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah',
        guru: ['Meminta siswa menyajikan hasil pemikiran mereka dan memfasilitasi tanya jawab.', 'Melakukan klarifikasi dan penguatan konsep.'],
        siswa: ['Mempresentasikan solusi dan memberikan argumen logis.', 'Merefleksikan efektivitas langkah pemecahan masalah yang dilakukan (Tahap Merefleksi).']
      }
    ],
    'Discovery Learning': [
      {
        name: 'Fase 1: Stimulation (Pemberian Rangsangan)',
        guru: [`Memberikan stimulus berupa data, gambar, atau video anomali terkait ${topic}.`],
        siswa: [`Melakukan observasi awal dan merasakan adanya ketidakpastian/keingintahuan.`]
      },
      {
        name: 'Fase 2: Problem Statement (Identifikasi Masalah)',
        guru: ['Mengarahkan siswa untuk merumuskan hipotesis atau pertanyaan penelitian.'],
        siswa: ['Menyusun daftar pertanyaan yang ingin dicari jawabannya melalui aktivitas ini (Tahap Memahami).']
      },
      {
        name: 'Fase 3: Data Collection (Pengumpulan Data)',
        guru: ['Memfasilitasi sarana eksplorasi baik secara fisik maupun digital.'],
        siswa: ['Mengumpulkan data relevan melalui percobaan atau pencarian literatur.']
      },
      {
        name: 'Fase 4: Data Processing (Pengolahan Data)',
        guru: ['Membimbing siswa mengklasifikasikan data untuk menemukan pola tertentu.'],
        siswa: ['Mengolah data dan menghubungkan antar fakta yang ditemukan (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Mengolah data menggunakan tabel bantu yang sudah disediakan guru.',
          menengah: 'Menyusun data secara mandiri dan menemukan pola umum dari fenomena yang diamati.',
          mahir: 'Merumuskan hubungan kompleks antar variabel berdasarkan data yang ditemukan.'
        } : null
      },
      {
        name: 'Fase 5: Verification (Pembuktian)',
        guru: ['Membimbing siswa mencocokkan hasil olah data dengan teori yang ada.'],
        siswa: ['Melakukan verifikasi temuan mereka dengan sumber tepercaya.']
      },
      {
        name: 'Fase 6: Generalization (Menarik Kesimpulan)',
        guru: ['Meninjau kesimpulan siswa dan memberikan penguatan konsep secara saintifik.'],
        siswa: ['Menarik kesimpulan umum (prinsip) dari hasil pembuktian (Tahap Merefleksi).']
      }
    ],
    'Inquiry Learning': [
      {
        name: 'Fase 1: Orientasi',
        guru: [`Membina suasana belajar yang kondusif dan memberikan gambaran fenomena ${topic}.`],
        siswa: [`Memperhatikan fenomena yang disajikan dengan rasa ingin tahu.`]
      },
      {
        name: 'Fase 2: Merumuskan Masalah',
        guru: ['Mengajukan pertanyaan menantang yang memerlukan investigasi lanjut.'],
        siswa: ['Mendefinisikan masalah penelitian secara mandiri (Tahap Memahami).']
      },
      {
        name: 'Fase 3: Merumuskan Hipotesis',
        guru: ['Membimbing siswa menyusun dugaan sementara berdasarkan pengetahuan awal.'],
        siswa: ['Menyusun hipotesis yang akan diuji kebenarannya.']
      },
      {
        name: 'Fase 4: Mengumpulkan Data',
        guru: ['Menyediakan alat, bahan, atau sumber informasi untuk investigasi.'],
        siswa: ['Melakukan eksperimen atau pelacakan informasi secara mendalam (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Melakukan investigasi menggunakan sumber referensi tunggal yang sederhana.',
          menengah: 'Mengintegrasikan informasi dari berbagai sumber untuk menjawab pertanyaan.',
          mahir: 'Melakukan eksperimen mandiri dengan variabel yang lebih kompleks.'
        } : null
      },
      {
        name: 'Fase 5: Menguji Hipotesis',
        guru: ['Membantu siswa menganalisis apakah data mendukung hipotesis atau tidak.'],
        siswa: ['Mengolah data untuk membuktikan validitas hipotesis yang dibuat.']
      },
      {
        name: 'Fase 6: Merumuskan Kesimpulan',
        guru: ['Memfasilitasi diskusi kelas untuk menyepakati kesimpulan ilmiah.'],
        siswa: ['Mengomunikasikan hasil temuan dan merefleksikan proses berpikir (Tahap Merefleksi).']
      }
    ],
    'Cooperative Learning': [
      {
        name: 'Fase 1: Menyampaikan Tujuan dan Memotivasi Siswa',
        guru: [`Menjelaskan indikator pembelajaran ${topic} dan pentingnya kerja sama tim.`],
        siswa: [`Memahami target yang harus dicapai bersama tim.`]
      },
      {
        name: 'Fase 2: Menyajikan Informasi',
        guru: ['Memberikan penjelasan materi inti secara singkat dan menarik.'],
        siswa: ['Menyimak poin-poin penting yang disampaikan guru (Tahap Memahami).']
      },
      {
        name: 'Fase 3: Mengorganisasikan Siswa ke dalam Kelompok Belajar',
        guru: ['Membentuk kelompok heterogen dan membagikan lembar kerja kelompok.'],
        siswa: ['Bergabung dengan tim dan membagi peran tugas (seperti ketua, sekretaris, dll).']
      },
      {
        name: 'Fase 4: Membimbing Kelompok Bekerja dan Belajar',
        guru: ['Memantau interaksi antar siswa dan memotivasi tutor sebaya.'],
        siswa: ['Berdiskusi dan saling membantu dalam menuntaskan tugas kelompok (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Bertanggung jawab pada bagian tugas yang bersifat teknis/prosedural.',
          menengah: 'Mengkoordinasikan diskusi dan menyatukan berbagai pendapat.',
          mahir: 'Memberikan tutorial sebaya dan memimpin analisis tingkat lanjut.'
        } : null
      },
      {
        name: 'Fase 5: Evaluasi',
        guru: ['Menguji pemahaman kelompok melalui kuis atau presentasi singkat.'],
        siswa: ['Menyajikan hasil diskusi kelompok di depan kelas atau melalui kuis interaktif.']
      },
      {
        name: 'Fase 6: Memberikan Penghargaan',
        guru: ['Memberikan apresiasi kepada kelompok dengan kinerja atau perkembangan terbaik.'],
        siswa: ['Melakukan refleksi atas efektivitas kerja sama mereka (Tahap Merefleksi).']
      }
    ],
    'Game-Based Learning': [
      {
        name: 'Fase 1: Persiapan dan Penjelasan (Game On-boarding)',
        guru: [`Memperkenalkan aturan main, level tantangan, dan target skor terkait ${topic}.`],
        siswa: [`Memahami mekanik permainan dan hubungannya dengan materi (Tahap Memahami).`]
      },
      {
        name: 'Fase 2: Sesi Bermain (Game Session)',
        guru: ['Bertindak sebagai moderator/Game Master yang menjaga sportivitas.', 'Memberikan petunjuk (hint) jika siswa mengalami kebuntuan.'],
        siswa: ['Menyelesaikan tantangan dalam game menggunakan konsep materi (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Menyelesaikan misi pada level dasar dengan pengulangan konsep kunci.',
          menengah: 'Menyusun strategi kreatif untuk melewati level kesulitan menengah secara mandiri.',
          mahir: 'Merancang modifikasi aturan atau strategi "expert" dalam permainan.'
        } : null
      },
      {
        name: 'Fase 3: De-briefing dan Refleksi',
        guru: ['Menarik substansi materi dari aktivitas permainan agar tidak sekadar bermain.', 'Membahas strategi yang berhasil.'],
        siswa: ['Mengaitkan pengalaman bermain dengan konsep nyata dan menyimpulkan pembelajaran (Tahap Merefleksi).']
      }
    ],
    'Direct Instruction': [
      {
        name: 'Fase 1: Menyampaikan Tujuan dan Mempersiapkan Siswa',
        guru: [`Menjelaskan apa yang akan dipelajari dan melakukan apersepsi tentang ${topic}.`],
        siswa: [`Menyiapkan diri dan alat bantu belajar.`]
      },
      {
        name: 'Fase 2: Mendemonstrasikan Pengetahuan atau Keterampilan',
        guru: ['Menunjukkan langkah-langkah atau prosedur materi secara sistematis.'],
        siswa: ['Mengamati demonstrasi guru dengan teliti (Tahap Memahami).']
      },
      {
        name: 'Fase 3: Membimbing Pelatihan',
        guru: ['Memberikan latihan terbimbing (guided practice) secara bertahap.'],
        siswa: ['Mencoba mempraktikkan keterampilan/pengetahuan di bawah pengawasan guru (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Mengerjakan latihan soal dengan jumlah yang lebih sedikit namun fokus pada dasar.',
          menengah: 'Menyelesaikan seluruh soal latihan standar dengan tingkat akurasi tinggi.',
          mahir: 'Menyelesaikan soal tantangan/pengayaan yang memerlukan penalaran tinggi.'
        } : null
      },
      {
        name: 'Fase 4: Mengecek Pemahaman dan Memberikan Umpan Balik',
        guru: ['Mengevaluasi hasil latihan siswa dan memperbaiki kesalahan secara langsung.'],
        siswa: ['Menerima masukan dan melakukan perbaikan mandiri.']
      },
      {
        name: 'Fase 5: Memberikan Kesempatan untuk Pelatihan Lanjutan dan Penerapan',
        guru: ['Memberikan tugas mandiri untuk memperkuat penguasaan materi.'],
        siswa: ['Menerapkan konsep secara mandiri pada konteks yang berbeda (Tahap Merefleksi).']
      }
    ]
  };

  baseSteps.inti = modelPhases[model] || [
    {
      name: 'Kegiatan Inti',
      guru: ['Menjelaskan konsep utama materi.', 'Memberikan tugas latihan.', 'Membahas hasil tugas.'],
      siswa: ['Menyimak dan mencatat poin penting.', 'Mengerjakan tugas secara mandiri.', 'Memperbaiki pemahaman yang keliru.']
    }
  ];

  return baseSteps;
}

function generateExtras(topic) {
  return {
    glosarium: [
      { istilah: topic, definisi: `Konsep utama dalam pembelajaran ini yang mencakup prinsip, teori, dan aplikasi praktisnya.` },
      { istilah: 'Kognitif', definisi: 'Proses mental yang mencakup perhatian, ingatan, dan memecahan masalah.' },
      { istilah: 'Metakognitif', definisi: 'Kesadaran individu tentang proses berfikirnya sendiri.' }
    ],
    daftarPustaka: [
      `Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). Buku Panduan Guru Mata Pelajaran terkait ${topic}. Jakarta.`,
      `Badan Standar, Kurikulum, dan Asesmen Pendidikan. (2022). Panduan Pembelajaran dan Asesmen Kurikulum Merdeka.`,
      `Sumber Referensi Digital Relevan: https://belajar.kemdikbud.go.id terkait materi ${topic}.`
    ],
    media: [
      `Video Pembelajaran: Penjelasan konsep ${topic} di kanal Edukasi YouTube.`,
      `Simulasi Interaktif/Alat Peraga: Penggunaan media konkrit atau digital untuk memvisualisasikan ${topic}.`,
      `Lembar Kerja Peserta Didik (LKPD) yang dirancang khusus untuk eksplorasi mandiri.`
    ]
  };
}

function generateAssessment(model, topic, tps) {
  const assessment = [];

  // 1. Asesmen Formatif (Awal)
  assessment.push({
    jenis: 'Formatif (Awal)',
    teknik: 'Diagnostik Non-Kognitif & Pertanyaan Pemantik',
    instrumen: `Daftar cek kesiapan belajar terkait ${topic}.`
  });

  // 2. Asesmen Formatif (Proses) - Disesuaikan dengan Model
  let teknikProses = 'Observasi & Performa';
  let instrumenProses = 'Rubrik Penilaian Proses';

  if (model === 'Project Based Learning') {
    teknikProses = 'Penilaian Produk & Observasi';
    instrumenProses = 'Laporan Kemajuan Proyek & Rubrik Kolaborasi';
  } else if (model === 'Problem Based Learning' || model === 'Inquiry Learning') {
    teknikProses = 'Diskusi & Pemecahan Masalah';
    instrumenProses = 'Lembar Kerja Peserta Didik (LKPD) & Jurnal Refleksi';
  } else if (model === 'Discovery Learning') {
    teknikProses = 'Laporan Hasil Temuan';
    instrumenProses = 'Lembar Observasi Eksplorasi';
  } else if (model === 'Cooperative Learning') {
    teknikProses = 'Penilaian Antar Teman';
    instrumenProses = 'Sosiogram Kelompok & Lembar Kontribusi Individu';
  } else if (model === 'Game-Based Learning') {
    teknikProses = 'Log Aktivitas Game';
    instrumenProses = 'Papan Skor Kompetensi & Refleksi Strategi';
  }

  assessment.push({
    jenis: 'Formatif (Proses)',
    teknik: teknikProses,
    instrumen: instrumenProses
  });

  // 3. Asesmen Sumatif - Selaras dengan TP tertinggi
  const hasHighCognitive = tps.some(tp =>
    tp.toLowerCase().includes('buat') ||
    tp.toLowerCase().includes('rancang') ||
    tp.toLowerCase().includes('analisis') ||
    tp.toLowerCase().includes('evaluasi')
  );

  assessment.push({
    jenis: 'Sumatif',
    teknik: hasHighCognitive ? 'Penugasan Proyek/Produk' : 'Tes Tertulis',
    instrumen: hasHighCognitive ? 'Rubrik Penilaian Karya Kreatif' : 'Soal Pilihan Ganda/Uraian'
  });

  return assessment;
}

function renderResult(data, tps, atp, steps, assessment, extras, rubric) {
  resultTitle.innerText = `Modul Ajar: ${data.topic}`;

  let html = `
    <div class="info-box" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 0.9rem; padding: 15px; background: var(--primary-light); border-radius: 8px;">
      <div><strong>Jenjang:</strong> ${data.jenjang}</div>
      <div><strong>Fase:</strong> ${data.fase}</div>
      <div><strong>Mata Pelajaran:</strong> ${data.subject}</div>
      <div><strong>Kelas/Semester:</strong> Kelas ${data.class} / Semester ${data.semester}</div>
      <div><strong>Materi:</strong> ${data.topic}</div>
      <div><strong>Alokasi Waktu:</strong> ${data.duration} (${data.pertemuan} Pertemuan)</div>
      <div style="grid-column: span 2;"><strong>Model Pembelajaran:</strong> ${data.model}</div>
    </div>

    <h2>A. Tujuan Pembelajaran (TP)</h2>
    <ul>
      ${tps.map(tp => `<li>${tp}</li>`).join('')}
    </ul>

    <h2>B. Alur Tujuan Pembelajaran (ATP)</h2>
    <div style="margin-left: 10px; border-left: 3px solid var(--primary); padding-left: 15px;">
      <p><strong>1. Tahap Memahami:</strong></p>
      <ul>
        ${atp.memahami.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <p><strong>2. Tahap Mengaplikasi:</strong></p>
      <ul>
        ${atp.mengaplikasi.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <p><strong>3. Tahap Merefleksi:</strong></p>
      <ul>
        ${atp.merefleksi.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <h2>C. Langkah Pembelajaran (Deep Learning)</h2>
    
    <div style="margin-bottom: 20px;">
      <h3>1. Pendahuluan</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 0.9rem;">
        <tr style="background: #f9f9f9;">
          <th style="width: 50%; padding: 8px; border: 1px solid var(--border); text-align: left;">Aktivitas Guru</th>
          <th style="width: 50%; padding: 8px; border: 1px solid var(--border); text-align: left;">Aktivitas Peserta Didik</th>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.pendahuluan.guru.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td style="padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.pendahuluan.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 20px;">
      <h3>2. Kegiatan Inti (${data.model})</h3>
      
      ${steps.inti.map((phase, index) => `
        <div style="margin-top: 15px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: var(--primary);">${phase.name}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <tr style="background: #fdfdfd;">
              <th style="width: 50%; padding: 6px; border: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: #666;">Aktivitas Guru</th>
              <th style="width: 50%; padding: 6px; border: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: #666;">Aktivitas Peserta Didik</th>
            </tr>
            <tr>
              <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
                <ul style="margin: 0; padding-left: 18px;">${phase.guru.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
              <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
                <ul style="margin: 0; padding-left: 18px;">${phase.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
            </tr>
          </table>
          
          ${phase.diferensiasi ? `
            <div style="margin-top: 8px; padding: 10px; border: 1px dashed var(--accent); border-radius: 8px; background: #fffcf0;">
              <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 0.85rem; color: #b45309;">Diferensiasi Proses:</p>
              <ul style="font-size: 0.85rem; margin-bottom: 0;">
                <li><strong>Kelompok Belum Siap:</strong> ${phase.diferensiasi.berjuang}</li>
                <li><strong>Kelompok Siap:</strong> ${phase.diferensiasi.menengah}</li>
                <li><strong>Kelompok Mahir:</strong> ${phase.diferensiasi.mahir}</li>
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div style="margin-bottom: 20px;">
      <h3>3. Penutup</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 0.9rem;">
        <tr>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.penutup.guru.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.penutup.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
        </tr>
      </table>
    </div>

    <h2>D. Asesmen</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem;">
      <thead>
        <tr style="background: var(--primary); color: white;">
          <th style="padding: 10px; border: 1px solid var(--border);">Jenis Asesmen</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Teknik</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Instrumen</th>
        </tr>
      </thead>
      <tbody>
        ${assessment.map(a => `
          <tr>
            <td style="padding: 10px; border: 1px solid var(--border);">${a.jenis}</td>
            <td style="padding: 10px; border: 1px solid var(--border);">${a.teknik}</td>
            <td style="padding: 10px; border: 1px solid var(--border);">${a.instrumen}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="page-break"></div>

    <h2>E. Rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85rem;">
      <thead>
        <tr style="background: var(--primary); color: white;">
          <th style="padding: 10px; border: 1px solid var(--border); width: 25%;">Indikator</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Perlu Bimbingan</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Cukup</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Baik</th>
          <th style="padding: 10px; border: 1px solid var(--border);">Sangat Baik</th>
        </tr>
      </thead>
      <tbody>
        ${rubric.map(r => `
          <tr>
            <td style="padding: 8px; border: 1px solid var(--border);"><strong>${r.indikator}</strong></td>
            <td style="padding: 8px; border: 1px solid var(--border);">${r.kriteria.perluBimbingan}</td>
            <td style="padding: 8px; border: 1px solid var(--border);">${r.kriteria.cukup}</td>
            <td style="padding: 8px; border: 1px solid var(--border);">${r.kriteria.baik}</td>
            <td style="padding: 8px; border: 1px solid var(--border);">${r.kriteria.sangatBaik}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>F. Media & Sumber Belajar</h2>
    <ul>
      ${extras.media.map(m => `<li>${m}</li>`).join('')}
    </ul>

    <h2>F. Glosarium</h2>
    <dl>
      ${extras.glosarium.map(g => `<dt><strong>${g.istilah}</strong></dt><dd>${g.definisi}</dd>`).join('')}
    </dl>

    <h2>G. Daftar Pustaka</h2>
    <ul style="list-style-type: none; padding-left: 0;">
      ${extras.daftarPustaka.map(d => `<li style="margin-bottom: 8px;">${d}</li>`).join('')}
    </ul>
  `;

  modulContent.innerHTML = html;
  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}
