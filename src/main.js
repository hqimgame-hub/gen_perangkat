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

// Database CP sederhana untuk Mapel Populer
const cpDatabase = {
  'Informatika': {
    'D': [
      { element: 'Berpikir Komputasional', text: 'Peserta didik mampu menerapkan berpikir komputasional untuk menghasilkan beberapa solusi dari persoalan dengan data diskrit bervolume kecil serta mendisposisikan berpikir komputasional dalam bidang lain terutama dalam literasi, numerasi, dan literasi sains (computationally literate).' },
      { element: 'Teknologi Informasi dan Komunikasi', text: 'Peserta didik mampu menerapkan praktik baik dalam memanfaatkan aplikasi surel untuk berkomunikasi, aplikasi peramban untuk pencarian informasi di internet, CMS di perangkat komputer untuk membuat karya digital, dan mengelola dokumen pencahayaan.' }
    ],
    'E': [
      { element: 'Berpikir Komputasional', text: 'Peserta didik mampu menerapkan strategi algoritmik standar untuk menghasilkan beberapa solusi persoalan dengan data diskrit bervolume besar dan kompleks pada kehidupan sehari-hari maupun implementasinya dalam sistem komputer.' }
    ]
  },
  'Matematika': {
    'D': [
      { element: 'Bilangan', text: 'Peserta didik dapat membaca, menulis, dan membandingkan bilangan bulat, bilangan rasional dan irasional, bilangan desimal, bilangan berpangkat bulat dan akar, bilangan dalam notasi ilmiah.' },
      { element: 'Aljabar', text: 'Peserta didik dapat mengenali, memprediksi dan menggeneralisasi pola dalam bentuk susunan benda dan bilangan.' }
    ]
  },
  'Bahasa Indonesia': {
    'D': [
      { element: 'Menyimak', text: 'Peserta didik mampu menganalisis dan memaknai informasi berupa gagasan, pikiran, perasaan, pandangan, arahan atau pesan yang tepat dari berbagai jenis teks (nonfiksi dan fiksi) audiovisual dan aural dalam bentuk monolog, dialog, dan gelar wicara.' }
    ]
  },
  'Bahasa Inggris': {
    'D': [
      { element: 'Menyimak - Berbicara', text: 'Peserta didik menggunakan bahasa Inggris untuk berinteraksi dan saling bertukar ide, pengalaman, minat, pendapat dan pandangan dengan guru, teman sebaya dan orang lain dalam berbagai macam konteks familiar yang formal dan informal.' }
    ]
  }
};

// Fitur Auto-Save
const formFields = ['subject', 'level', 'topic', 'cp', 'duration', 'model', 'differentiation', 'category', 'fase', 'cpSelect'];

function saveFormData() {
  const data = {};
  formFields.forEach(field => {
    const el = document.getElementById(field);
    data[field] = el.type === 'checkbox' ? el.checked : el.value;
  });
  localStorage.setItem('modulData', JSON.stringify(data));
}

function loadFormData() {
  const saved = localStorage.getItem('modulData');
  if (saved) {
    const data = JSON.parse(saved);
    formFields.forEach(field => {
      const el = document.getElementById(field);
      if (el) {
        if (el.type === 'checkbox') el.checked = data[field];
        else el.value = data[field] || '';
      }
    });
  }
}

const cpSelectField = document.getElementById('cpSelectField');
const cpManualField = document.getElementById('cpManualField');
const categoryEl = document.getElementById('category');
const faseEl = document.getElementById('fase');
const cpSelectEl = document.getElementById('cpSelect');
const cpTextArea = document.getElementById('cp');
const subjectInput = document.getElementById('subject');

function updateCPOptions() {
  const cat = categoryEl.value;
  const fase = faseEl.value;

  // Update Subject Input automatically if not "custom"
  if (cat !== 'custom') {
    subjectInput.value = cat;
  }

  if (cpDatabase[cat] && cpDatabase[cat][fase]) {
    cpSelectField.style.display = 'block';
    cpManualField.style.display = 'none';

    // Clear and Fill Select
    cpSelectEl.innerHTML = '<option value="">-- Pilih Elemen CP --</option>';
    cpDatabase[cat][fase].forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.text;
      opt.innerText = item.element;
      cpSelectEl.appendChild(opt);
    });
    cpTextArea.required = false;
    cpTextArea.value = ''; // Clear manual if switching to auto
  } else {
    cpSelectField.style.display = 'none';
    cpManualField.style.display = 'block';
    cpTextArea.required = true;
  }
}

categoryEl.addEventListener('change', updateCPOptions);
faseEl.addEventListener('change', updateCPOptions);

formFields.forEach(field => {
  document.getElementById(field).addEventListener('input', saveFormData);
});

window.addEventListener('load', loadFormData);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    subject: document.getElementById('subject').value,
    level: document.getElementById('level').value,
    topic: document.getElementById('topic').value,
    cp: cpSelectEl.value || cpTextArea.value,
    duration: document.getElementById('duration').value,
    model: document.getElementById('model').value,
    isDifferentiated: document.getElementById('differentiation').checked,
    fase: faseEl.value
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
    inti: {
      memahami: { guru: [], siswa: [] },
      mengaplikasi: { guru: [], siswa: [], diferensiasi: null },
      merefleksi: { guru: [], siswa: [] }
    },
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
        'Berdoa and menjawab salam.'
      ]
    }
  };

  // Logika Spesifik Model
  switch (model) {
    case 'Project Based Learning':
      baseSteps.inti.memahami = {
        guru: [`Menyajikan tantangan proyek nyata tentang ${topic}.`, 'Membantu siswa membentuk kelompok dan merancang desain proyek.'],
        siswa: ['Mengidentifikasi masalah yang akan diselesaikan melalui proyek.', 'Menyusun rencana dan jadwal pelaksanaan proyek kelompok.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Memantau jalannya proyek dan memberikan pendampingan (scaffolding).', 'Memfasilitasi diskusi kelompok saat menemui kendala teknis.'],
        siswa: ['Melaksanakan langkah-langkah proyek secara kolaboratif.', 'Menguji hasil proyek dan melakukan perbaikan jika diperlukan.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Mempraktikkan langkah dasar proyek dengan panduan template/lembar kerja terstruktur.',
          menengah: 'Menyelesaikan proyek sesuai rencana kelompok dengan konsultasi berkala.',
          mahir: 'Mengembangkan fitur tambahan atau analisis mendalam pada proyek yang melebihi standar dasar.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Memfasilitasi presentasi hasil proyek (expo).', 'Memberikan umpan balik konstruktif terhadap proses dan hasil karya.'],
        siswa: ['Mempresentasikan hasil proyek di depan kelas.', 'Melakukan evaluasi diri dan rekan sejawat terkait kontribusi dalam kelompok.']
      };
      break;

    case 'Problem Based Learning':
      baseSteps.inti.memahami = {
        guru: [`Menyajikan skenario masalah kontekstual terkait ${topic}.`, 'Memastikan setiap siswa memahami batasan masalah yang diberikan.'],
        siswa: ['Menganalisis fenomena masalah yang disajikan.', 'Mendefinisikan masalah yang perlu dicari solusinya.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Mendorong siswa mencari referensi dan data pendukung.', 'Membimbing jalannya diskusi pemecahan masalah.'],
        siswa: ['Melakukan penyelidikan melalui literasi dan diskusi.', 'Menyusun draf solusi atau gagasan penyelesaian masalah.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Mengidentifikasi 1 solusi sederhana dengan bimbingan intensif dalam mengolah data awal.',
          menengah: 'Membandingkan 2-3 alternatif solusi dan memilih yang paling efektif secara mandiri.',
          mahir: 'Menganalisis dampak jangka panjang dari solusi yang diusulkan dan menyusun argumen kritis.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Meminta siswa menyajikan hasil pemikiran mereka.', 'Melakukan klarifikasi dan penguatan konsep agar pemahaman tidak melenceng.'],
        siswa: ['Mempresentasikan solusi yang dipilih dan alasannya.', 'Menyimpulkan pemahaman baru yang didapat dari proses pemecahan masalah.']
      };
      break;

    case 'Discovery Learning':
      baseSteps.inti.memahami = {
        guru: [`Memberikan stimulus berupa data atau objek terkait ${topic}.`, 'Mengarahkan siswa untuk mengamati keunikan data tersebut.'],
        siswa: ['Melakukan observasi mendalam terhadap objek studi.', 'Merumuskan identifikasi masalah atau pertanyaan penelitian.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Memfasilitasi pengumpulan data melalui eksperimen/eksplorasi.', 'Membimbing siswa dalam mengolah informasi yang ditemukan.'],
        siswa: ['Mengumpulkan informasi relevan secara mandiri atau berkelompok.', 'Mencoba menghubungkan antar data yang ditemukan untuk mencari pola.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Mengolah data menggunakan tabel bantu yang sudah disediakan guru.',
          menengah: 'Menyusun data secara mandiri dan menemukan pola umum dari fenomena yang diamati.',
          mahir: 'Merumuskan generalisasi/prinsip baru berdasarkan anomali atau data kompleks yang ditemukan.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Meninjau kesimpulan yang dibuat siswa apakah sudah sesuai prinsip ilmiah.', 'Memberikan apresiasi atas proses penemuan mandiri.'],
        siswa: ['Menarik kesimpulan umum (generalisasi) dari hasil olah data.', 'Memverifikasi temuan dengan sumber tepercaya.']
      };
      break;

    case 'Inquiry Learning':
      baseSteps.inti.memahami = {
        guru: [`Mengajukan pertanyaan besar yang menantang keingintahuan siswa tentang ${topic}.`, 'Menyusun landasan teori dasar bagi investigasi siswa.'],
        siswa: ['Mempertanyakan fakta-fakta yang ada di sekitarnya.', 'Menyusun hipotesis atau dugaan sementara.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Menyediakan sarana investigasi (alat/bahan/link sumber).', 'Bertindak sebagai konsultan selama proses pencarian data.'],
        siswa: ['Menguji hipotesis melalui pengumpulan dan analisis data.', 'Menyusun argumen berdasarkan bukti yang ditemukan.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Melakukan investigasi menggunakan sumber referensi tunggal yang sederhana.',
          menengah: 'Mengintegrasikan informasi dari berbagai sumber (buku, internet, observasi) untuk menjawab pertanyaan.',
          mahir: 'Melakukan eksperimen mandiri dengan variabel yang lebih kompleks untuk menguji hipotesis.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Memfasilitasi diskusi kritis antar siswa.', 'Menghubungkan hasil temuan siswa dengan konsep yang lebih luas.'],
        siswa: ['Mengomunikasikan hasil investigasi secara lisan maupun tulisan.', 'Menilai validitas data dan kekuatan argumen yang disusun.']
      };
      break;

    case 'Cooperative Learning':
      baseSteps.inti.memahami = {
        guru: [`Menjelaskan konsep dasar ${topic} secara singkat.`, 'Membentuk kelompok heterogen dan menjelaskan tanggung jawab individu.'],
        siswa: ['Menyimak penjelasan awal dari guru.', 'Bergabung dengan kelompok dan memahami peran masing-masing.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Memantau interaksi antar siswa dalam kelompok.', 'Memastikan terjadinya tutor sebaya dalam diskusi.'],
        siswa: ['Berdiskusi dan saling membantu dalam menyelesaikan tugas kelompok.', 'Menjelaskan pemahaman pribadi kepada anggota kelompok lain.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Bertanggung jawab pada bagian tugas yang bersifat teknis/prosedural.',
          menengah: 'Mengkoordinasikan diskusi dan menyatukan berbagai pendapat anggota kelompok.',
          mahir: 'Memberikan tutorial sebaya dan memimpin analisis tingkat lanjut dalam tugas kelompok.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Mengadakan kuis kelompok atau kompetisi antar tim.', 'Memberikan penghargaan kepada kelompok yang paling solid.'],
        siswa: ['Mengerjakan evaluasi secara individu maupun tim.', 'Melakukan refleksi terhadap cara kerja sama mereka.']
      };
      break;

    case 'Game-Based Learning':
      baseSteps.inti.memahami = {
        guru: [`Memperkenalkan aturan main dan tantangan (level) terkait ${topic}.`, 'Memberikan tutorial singkat mengenai mekanik permainan.'],
        siswa: ['Memahami instruksi dan tujuan dari tantangan yang diberikan.', 'Mencoba simulasi awal dalam permainan.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Bertindak sebagai "Game Master" yang menjaga ritme permainan.', 'Memberikan petunjuk (hint) saat siswa mengalami hambatan progres.'],
        siswa: ['Menyelesaikan tantangan permainan menggunakan konsep ' + topic + '.', 'Berkompetisi atau berkolaborasi untuk mencapai level tertinggi.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Menyelesaikan misi pada level dasar dengan pengulangan konsep kunci.',
          menengah: 'Menyusun strategi kreatif untuk melewati level kesulitan menengah secara mandiri.',
          mahir: 'Merancang modifikasi aturan atau strategi "expert" dalam permainan.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Membahas makna dari setiap kegagalan dan keberhasilan dalam game.', 'Menarik substansi materi dari aktivitas permainan.'],
        siswa: ['Menganalisis strategi yang berhasil dan yang gagal.', 'Mengaitkan pengalaman bermain dengan konsep materi di dunia nyata.']
      };
      break;

    case 'Direct Instruction':
      baseSteps.inti.memahami = {
        guru: [`Mendemonstrasikan prosedur atau konsep ${topic} langkah demi langkah.`, 'Memberikan ilustrasi dan analogi yang mudah dipahami.'],
        siswa: ['Mengamati demonstrasi guru dengan seksama.', 'Bertanya pada bagian yang belum dipahami.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Memberikan latihan terbimbing (guided practice).', 'Memberikan koreksi langsung terhadap kesalahan siswa.'],
        siswa: ['Mencoba mengerjakan soal/prosedur di bawah pengawasan guru.', 'Memperbaiki kesalahan berdasarkan saran guru.']
      };
      if (isDifferentiated) {
        baseSteps.inti.mengaplikasi.diferensiasi = {
          berjuang: 'Mengerjakan latihan soal dengan jumlah yang lebih sedikit namun fokus pada pemahaman dasar.',
          menengah: 'Menyelesaikan seluruh soal latihan standar dengan tingkat akurasi tinggi.',
          mahir: 'Menyelesaikan soal tantangan/pengayaan yang memerlukan penalaran lebih tinggi.'
        };
      }
      baseSteps.inti.merefleksi = {
        guru: ['Memberikan latihan mandiri (independent practice).', 'Mengecek pemahaman akhir melalui kuis singkat.'],
        siswa: ['Menyelesaikan tugas secara mandiri tanpa bantuan guru.', 'Memastikan diri telah menguasai setiap tahapan materi.']
      };
      break;

    default:
      baseSteps.inti.memahami = {
        guru: ['Menjelaskan konsep utama materi.'],
        siswa: ['Menyimak dan mencatat poin penting.']
      };
      baseSteps.inti.mengaplikasi = {
        guru: ['Memberikan tugas latihan.'],
        siswa: ['Mengerjakan tugas secara mandiri.']
      };
      baseSteps.inti.merefleksi = {
        guru: ['Membahas hasil tugas.'],
        siswa: ['Memperbaiki pemahaman yang keliru.']
      };
  }

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
      <div><strong>Mata Pelajaran:</strong> ${data.subject}</div>
      <div><strong>Kelas/Semester:</strong> ${data.level} / ${data.fase ? 'Fase ' + data.fase : ''}</div>
      <div><strong>Materi:</strong> ${data.topic}</div>
      <div><strong>Alokasi Waktu:</strong> ${data.duration}</div>
      <div style="grid-column: span 2;"><strong>Model Pembelajaran:</strong> ${data.model} ${data.isDifferentiated ? '(Berdiferensiasi)' : ''}</div>
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
      
      <p style="margin: 10px 0 5px 0; font-weight: bold; color: var(--primary);">Fase A: Memahami</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
        <tr>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.memahami.guru.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.memahami.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
        </tr>
      </table>

      <p style="margin: 15px 0 5px 0; font-weight: bold; color: var(--primary);">Fase B: Mengaplikasi</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
        <tr>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.mengaplikasi.guru.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.mengaplikasi.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
        </tr>
      </table>

      ${steps.inti.mengaplikasi.diferensiasi ? `
        <div style="margin-top: 10px; padding: 10px; border: 1px dashed var(--accent); border-radius: 8px; background: #fffcf0;">
          <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 0.85rem; color: #b45309;">Diferensiasi Proses:</p>
          <ul style="font-size: 0.85rem; margin-bottom: 0;">
            <li><strong>Kelompok Belum Siap:</strong> ${steps.inti.mengaplikasi.diferensiasi.berjuang}</li>
            <li><strong>Kelompok Siap:</strong> ${steps.inti.mengaplikasi.diferensiasi.menengah}</li>
            <li><strong>Kelompok Mahir:</strong> ${steps.inti.mengaplikasi.diferensiasi.mahir}</li>
          </ul>
        </div>
      ` : ''}

      <p style="margin: 15px 0 5px 0; font-weight: bold; color: var(--primary);">Fase C: Merefleksi</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
        <tr>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.merefleksi.guru.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
          <td style="width: 50%; padding: 8px; border: 1px solid var(--border); vertical-align: top;">
            <ul>${steps.inti.merefleksi.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
          </td>
        </tr>
      </table>
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
