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
  generateLKPD(data);
});

// Tab Navigation Logic
const btnTabModul = document.getElementById('btnTabModul');
const btnTabLKPD = document.getElementById('btnTabLKPD');
const modulContentDiv = document.getElementById('modulContent');
const lkpdContentDiv = document.getElementById('lkpdContent');
const resultTitle = document.getElementById('resultTitle');

function switchTab(tab) {
  if (tab === 'modul') {
    btnTabModul.classList.add('active');
    btnTabLKPD.classList.remove('active');
    modulContentDiv.style.display = 'block';
    lkpdContentDiv.style.display = 'none';
    modulContentDiv.classList.add('active');
    lkpdContentDiv.classList.remove('active');
  } else {
    btnTabModul.classList.remove('active');
    btnTabLKPD.classList.add('active');
    modulContentDiv.style.display = 'none';
    lkpdContentDiv.style.display = 'block';
    modulContentDiv.classList.remove('active');
    lkpdContentDiv.classList.add('active');
  }
}

btnTabModul.addEventListener('click', () => switchTab('modul'));
btnTabLKPD.addEventListener('click', () => switchTab('lkpd'));

exportWordBtn.addEventListener('click', async () => {
  const isModulActive = btnTabModul.classList.contains('active');
  const content = isModulActive ? modulContentDiv.innerHTML : lkpdContentDiv.innerHTML;
  const fileName = isModulActive ? `Modul Ajar - ${resultTitle.innerText.split(': ')[1] || 'Export'}` : `LKPD - ${resultTitle.innerText.split(': ')[1] || 'Export'}`;

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
        /* LKPD Specific Styles for Word */
        .lkpd-header { text-align: center; border-bottom: 3px double black; margin-bottom: 20px; }
        .lkpd-title { background: #eee; padding: 5px; border: 1px solid black; font-weight: bold; }
        .write-area { border: 1px dashed #aaa; height: 100px; margin-top: 5px; }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = await asBlob(htmlDoc);
  saveAs(blob, `${fileName}.docx`);
});

function generateModul(data) {
  // 1. Generate Tujuan Pembelajaran (Professional & Multi-Topic)
  const tps = generateTP(data.cp, data.topic);

  // 2. Generate Alur Tujuan Pembelajaran (ATP) dengan 3 Tahap
  const atp = generateATP(tps);

  // 3. Generate Langkah Pembelajaran (Deep Learning + Diferensiasi + Hybrid Flow)
  const steps = generateSteps(data.model, data.topic, tps, data.isDifferentiated, data.pertemuan);

  // 4. Generate Asesmen yang selaras
  const assessment = generateAssessment(data.model, data.topic, tps);

  // 5. Generate Rubrik KKTP
  const rubric = generateKKTP(tps);

  // 6. Generate Administrasi Tambahan (Glosarium & Daftar Pustaka)
  const extras = generateExtras(data.topic);

  renderResult(data, tps, atp, steps, assessment, extras, rubric);
}

function generateLKPD(data) {
  const lkpdHTML = renderLKPD(data);
  lkpdContentDiv.innerHTML = lkpdHTML;
}

function renderLKPD(data) {
  const modelActivities = getModelActivities(data.model);

  return `
    <div class="lkpd-container">
      <div class="lkpd-header">
        <h2>LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
        <h3>${data.subject} - Kelas ${data.class}</h3>
        <p>Materi: ${data.topic}</p>
      </div>

      <div class="lkpd-name-box">
        <div>
            <strong>Nama Kelompok:</strong> ............................................<br><br>
            <strong>Anggota:</strong>
            <ol style="margin-top: 5px; padding-left: 20px;">
                <li>....................................</li>
                <li>....................................</li>
                <li>....................................</li>
                <li>....................................</li>
            </ol>
        </div>
        <div style="text-align: right;">
            <strong>Hari/Tanggal:</strong> ....................................<br><br>
            <strong>Nilai:</strong> ....................
        </div>
      </div>

      <div class="lkpd-section">
        <div class="lkpd-title">A. PETUNJUK BELAJAR</div>
        <ol>
            <li>Berdoalah sebelum memulai kegiatan belajar.</li>
            <li>Bacalah materi dan panduan dengan seksama.</li>
            <li>Diskusikan tugas ini bersama teman sekelompokmu.</li>
            <li>Tanyakan pada guru jika mengalami kesulitan.</li>
        </ol>
      </div>

      <div class="lkpd-section">
        <div class="lkpd-title">B. KEGIATAN PEMBELAJARAN (${data.model})</div>
        ${modelActivities}
      </div>

      <div class="lkpd-section">
        <div class="lkpd-title">C. REFLEKSI & KESIMPULAN</div>
        <p>Apa yang telah kalian pelajari hari ini? Tuliskan kesimpulanmu:</p>
        <div class="write-area" style="height: 120px;"></div>
      </div>
      
      <div class="lkpd-section" style="margin-top: 50px; text-align: right;">
        <p>Mengetahui,<br>Guru Mata Pelajaran</p>
        <br><br><br>
        <p>( ............................................ )</p>
      </div>
    </div>
  `;
}

function getModelActivities(model) {
  switch (model) {
    case 'Problem Based Learning':
      return `
            <p><strong>Langkah 1: Identifikasi Masalah</strong><br>
            Amatilah kasus yang diberikan guru, kemudian tuliskan rumusan masalahnya:</p>
            <div class="write-area"></div>
            
            <p style="margin-top: 15px;"><strong>Langkah 2: Penyelidikan</strong><br>
            Carilah informasi dari berbagai sumber untuk menjawab masalah tersebut. Tuliskan temuanmu pada tabel di bawah:</p>
            <table class="lkpd-table">
                <tr><th>No</th><th>Sumber Informasi</th><th>Temuan Penting</th></tr>
                <tr><td>1</td><td></td><td></td></tr>
                <tr><td>2</td><td></td><td></td></tr>
                <tr><td>3</td><td></td><td></td></tr>
            </table>

            <p style="margin-top: 15px;"><strong>Langkah 3: Solusi</strong><br>
            Berdasarkan temuan di atas, solusi apa yang kalian tawarkan?</p>
            <div class="write-area"></div>
        `;

    case 'Project Based Learning':
      return `
            <p><strong>Langkah 1: Perencanaan Proyek</strong><br>
            Diskusikan rencana proyek yang akan kalian buat:</p>
            <table class="lkpd-table">
                <tr><td width="30%">Nama Proyek</td><td></td></tr>
                <tr><td>Alat & Bahan</td><td></td></tr>
                <tr><td>Estimasi Waktu</td><td></td></tr>
            </table>

            <p style="margin-top: 15px;"><strong>Langkah 2: Jadwal Kegiatan</strong></p>
            <table class="lkpd-table">
                <tr><th>Hari/Ke</th><th>Kegiatan</th><th>Penanggung Jawab</th></tr>
                <tr><td>1</td><td>Desain & Perencanaan</td><td></td></tr>
                <tr><td>2</td><td>Pembuatan/Pelaksanaan</td><td></td></tr>
                <tr><td>3</td><td>Finishing & Uji Coba</td><td></td></tr>
            </table>
        `;

    case 'Discovery Learning':
      return `
             <p><strong>Langkah 1: Stimulus & Identifikasi</strong><br>
             Perhatikan gambar/video yang disajikan. Tuliskan hipotesis (dugaan sementara) kalian:</p>
             <div class="write-area"></div>

             <p style="margin-top: 15px;"><strong>Langkah 2: Pengumpulan Data</strong></p>
             <table class="lkpd-table">
                <tr><th>Variabel Pengamatan</th><th>Hasil Pengamatan</th></tr>
                <tr><td>Objek A</td><td></td></tr>
                <tr><td>Objek B</td><td></td></tr>
             </table>

             <p style="margin-top: 15px;"><strong>Langkah 3: Pembuktian</strong><br>
             Apakah hipotesis awal kalian sesuai dengan data? Jelaskan!</p>
             <div class="write-area"></div>
        `;

    default: // Generic / Direct Instruction
      return `
            <p><strong>Langkah 1: Eksplorasi Konsep</strong><br>
            Jawablah pertanyaan berikut berdasarkan materi yang telah dijelaskan:</p>
            <ol>
                <li>Apa yang dimaksud dengan topik pembelajaran hari ini?<br><div class="write-line"></div></li>
                <li>Sebutkan 3 ciri utama/karakteristik penting!<br><div class="write-line"></div><div class="write-line"></div><div class="write-line"></div></li>
            </ol>
            
            <p style="margin-top: 15px;"><strong>Langkah 2: Latihan Terbimbing</strong><br>
            Kerjakan soal latihan berikut:</p>
            <div class="write-area"></div>
        `;
  }
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

function generateTP(cp, topicString) {
  const topics = topicString.split('\n').map(t => t.trim()).filter(t => t);
  const fragments = cp.split(/[.;]|\bdan\b|\bserta\b/).map(s => s.trim()).filter(s => s.length > 15);

  const professionalTPs = [];

  // Helper untuk mendapatkan KKO
  const getKKO = (text) => {
    const low = text.toLowerCase();
    if (low.includes('buat') || low.includes('rancang') || low.includes('cipta')) return KKO.C6;
    if (low.includes('evaluasi') || low.includes('nilai') || low.includes('uji')) return KKO.C5;
    if (low.includes('analisis') || low.includes('kaitan') || low.includes('elaah')) return KKO.C4;
    return KKO.C3.concat(KKO.C2);
  };

  // Strategi: Setiap materi harus punya perwakilan TP
  // Format: "Melalui [Metode], peserta didik mampu [KKO] [Materi] [Kriteria/Konteks]."

  topics.forEach((topic, idx) => {
    // Cari fragmen CP yang mungkin cocok (simplifikasi: random ambil dari CP jika tidak ada keyword match)
    const relevantFragment = fragments.find(f => f.toLowerCase().includes(topic.toLowerCase())) || fragments[idx % fragments.length] || `memahami konsep ${topic}`;
    const pool = getKKO(relevantFragment);
    const verb = pool[Math.floor(Math.random() * pool.length)];

    // Variasi Metode Pembelajaran
    const methods = [
      'diskusi kelompok', 'pengamatan langsung', 'studi literatur',
      'kegiatan proyek', 'analisis kasus', 'eksplorasi mandiri'
    ];
    const method = methods[idx % methods.length];

    professionalTPs.push(
      `Melalui ${method}, peserta didik mampu ${verb.toLowerCase()} ${topic} serta kaitannya dengan ${relevantFragment.replace(/^(peserta didik|siswa|mampu|dapat|memahami|mengerti)\s+/i, '')} secara kritis dan kreatif.`
    );
  });

  // Jika TP terlalu sedikit (kurang dari 3), tambahkan TP umum
  while (professionalTPs.length < 3) {
    const verb = KKO.C4[Math.floor(Math.random() * KKO.C4.length)];
    const topic = topics[professionalTPs.length % topics.length];
    professionalTPs.push(`Melalui refleksi pembelajaran, peserta didik mampu ${verb.toLowerCase()} kebermanfaatan ${topic} dalam kehidupan sehari-hari.`);
  }

  return professionalTPs;
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

function generateSteps(model, topicString, tps, isDifferentiated, numMeetingsRaw) {
  const numMeetings = parseInt(numMeetingsRaw) || 1;
  const topics = topicString.split('\n').map(t => t.trim()).filter(t => t);
  const topicCombined = topics.join(', ');

  const getPendahuluan = (topic, pemantik, pemahaman) => ({
    guru: [
      'Membuka pembelajaran dengan salam dan doa.',
      'Melakukan presensi dan memeriksa kehadiran siswa.',
      `Memberikan pertanyaan pemantik: "${pemantik[0]}"`,
      `Menyampaikan pemahaman bermakna: "${pemahaman[0]}"`,
      `Menyampaikan tujuan pembelajaran yang terkait dengan ${topic}.`
    ],
    siswa: [
      'Menjawab salam dan berdoa khusyuk.',
      'Merespon presensi guru.',
      'Merespon pertanyaan pemantik secara aktif.',
      'Menyimak penjelasan guru.'
    ]
  });

  const getPenutup = () => ({
    guru: [
      'Membimbing siswa menyimpulkan materi hari ini.',
      'Melakukan refleksi jalannya pembelajaran.',
      'Menyampaikan agenda pertemuan berikutnya.',
      'Menutup kelas dengan doa dan salam.'
    ],
    siswa: [
      'Menyusun kesimpulan pembelajaran.',
      'Menyampaikan refleksi diri.',
      'Mencatat agenda mendatang.',
      'Berdoa dan menjawab salam.'
    ]
  });

  const modelPhases = {
    'Project Based Learning': [
      {
        name: 'Fase 1: Pertanyaan Mendasar',
        guru: [`Menyajikan pertanyaan esensial tentang ${topicCombined}.`],
        siswa: [`Mengidentifikasi masalah proyek.`]
      },
      {
        name: 'Fase 2: Mendesain Perencanaan Produk',
        guru: ['Membimbing perancangan proyek kelompok.'],
        siswa: ['Berdiskusi menyusun desain dan timeline proyek.']
      },
      {
        name: 'Fase 3: Menyusun Jadwal Pembuatan',
        guru: ['Memantau penyusunan jadwal realisasi proyek.'],
        siswa: ['Menyepakati deadline setiap tahapan proyek.']
      },
      {
        name: 'Fase 4: Memonitor Keaktifan dan Perkembangan Proyek',
        guru: ['Melakukan monitoring progres siswa (scaffolding).'],
        siswa: ['Mengerjakan proyek sesuai desain (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Mengerjakan proyek dengan panduan *step-by-step* terstruktur.',
          menengah: 'Mengerjakan proyek sesuai timeline standar dengan konsultasi.',
          mahir: 'Menambahkan fitur/analisis kompleks pada proyek.'
        } : null
      },
      {
        name: 'Fase 5: Menguji Hasil',
        guru: ['Memfasilitasi presentasi/pameran hasil karya.'],
        siswa: ['Mendemonstrasikan produk dan menjawab pertanyaan.']
      },
      {
        name: 'Fase 6: Evaluasi Pengalaman Belajar',
        guru: ['Membimbing refleksi proses proyek secara menyeluruh.'],
        siswa: ['Mengevaluasi keberhasilan dan kendala proyek (Tahap Merefleksi).']
      }
    ],
    'Problem Based Learning': [
      {
        name: 'Fase 1: Orientasi pada Masalah',
        guru: [`Menyajikan kasus masalah terkait ${topicCombined}.`],
        siswa: [`Menganalisis inti masalah.`]
      },
      {
        name: 'Fase 2: Mengorganisasikan Siswa',
        guru: ['Membagi tugas investigasi masalah.'],
        siswa: ['Mendefinisikan tugas belajar individu/kelompok.']
      },
      {
        name: 'Fase 3: Membimbing Penyelidikan',
        guru: ['Mendorong pengumpulan informasi relevan.'],
        siswa: ['Melakukan riset dan investigasi solusi (Tahap Mengaplikasi).'],
        diferensiasi: isDifferentiated ? {
          berjuang: 'Investigasi dengan sumber terkurasi (disediakan guru).',
          menengah: 'Investigasi mandiri dengan minimal 2 sumber.',
          mahir: 'Investigasi mendalam lintas perspektif/sumber.'
        } : null
      },
      {
        name: 'Fase 4: Mengembangkan Hasil Karya',
        guru: ['Membantu penyusunan laporan solusi.'],
        siswa: ['Menyusun artefak/laporan hasil pemecahan masalah.']
      },
      {
        name: 'Fase 5: Analisis dan Evaluasi',
        guru: ['Mengevaluasi proses pemecahan masalah.'],
        siswa: ['Mempresentasikan solusi dan refleksi (Tahap Merefleksi).']
      }
    ],
    'Discovery Learning': [
      { name: 'Fase 1: Stimulation', guru: [`Memberikan stimulus terkait ${topicCombined}.`], siswa: ['Mengamati fenomena.'] },
      { name: 'Fase 2: Problem Statement', guru: ['Membimbing hipotesis.'], siswa: ['Merumuskan pertanyaan.'] },
      { name: 'Fase 3: Data Collection', guru: ['Memfasilitasi pengumpulan data.'], siswa: ['Mengumpulkan data relevan.'] },
      { name: 'Fase 4: Data Processing', guru: ['Membimbing olah data.'], siswa: ['Mengolah data (Tahap Mengaplikasi).'], diferensiasi: isDifferentiated ? { berjuang: 'Panduan teknis pengolahan.', menengah: 'Pengolahan mandiri.', mahir: 'Analisis korelasi data.' } : null },
      { name: 'Fase 5: Verification', guru: ['Memverifikasi hasil.'], siswa: ['Membuktikan hipotesis.'] },
      { name: 'Fase 6: Generalization', guru: ['Menarik kesimpulan umum.'], siswa: ['Menyimpulkan prinsip (Tahap Merefleksi).'] }
    ],
    'Inquiry Learning': [
      { name: 'Fase 1: Orientasi', guru: [`Menjelaskan topik ${topicCombined}.`], siswa: ['Menyimak tujuan.'] },
      { name: 'Fase 2: Merumuskan Masalah', guru: ['Membancing pertanyaan.'], siswa: ['Menentukan fokus masalah.'] },
      { name: 'Fase 3: Hipotesis', guru: ['Minta dugaan sementara.'], siswa: ['Menyusun hipotesis.'] },
      { name: 'Fase 4: Mengumpulkan Data', guru: ['Fasilitasi eksperimen.'], siswa: ['Eksperimen/Observasi (Tahap Mengaplikasi).'], diferensiasi: isDifferentiated ? { berjuang: 'Eksperimen sederhana.', menengah: 'Eksperimen standar.', mahir: 'Eksperimen variabel kompleks.' } : null },
      { name: 'Fase 5: Menguji Hipotesis', guru: ['Bimbing validasi.'], siswa: ['Analisis kesesuaian data.'] },
      { name: 'Fase 6: Kesimpulan', guru: ['Konfirmasi temuan.'], siswa: ['Menyimpulkan hasil (Tahap Merefleksi).'] }
    ],
    'Cooperative Learning': [
      { name: 'Fase 1: Tujuan & Motivasi', guru: [`Sampaikan tujuan ${topicCombined}.`], siswa: ['Paham target.'] },
      { name: 'Fase 2: Informasi', guru: ['Paparan singkat materi.'], siswa: ['Catat poin kunci.'] },
      { name: 'Fase 3: Organisasi', guru: ['Bentuk tim kooperatif.'], siswa: ['Masuk tim.'] },
      { name: 'Fase 4: Bimbingan Tim', guru: ['Mentor tim.'], siswa: ['Kerja tim (Tahap Mengaplikasi).'], diferensiasi: isDifferentiated ? { berjuang: 'Peran pendukung.', menengah: 'Peran koordinator.', mahir: 'Peran tutor sebaya.' } : null },
      { name: 'Fase 5: Evaluasi', guru: ['Kuis/Presentasi.'], siswa: ['Tampil/Jawab kuis.'] },
      { name: 'Fase 6: Penghargaan', guru: ['Apresiasi tim.'], siswa: ['Refleksi tim (Tahap Merefleksi).'] }
    ],
    'Game-Based Learning': [
      { name: 'Fase 1: Konsep & Aturan', guru: [`Jelaskan misi terkait ${topicCombined}.`], siswa: ['Paham aturan main.'] },
      { name: 'Fase 2: Bermain (Game)', guru: ['Moderasi permainan.'], siswa: ['Bermain strategis (Tahap Mengaplikasi).'], diferensiasi: isDifferentiated ? { berjuang: 'Level mudah.', menengah: 'Level standar.', mahir: 'Level hard/modifikasi.' } : null },
      { name: 'Fase 3: Refleksi (Debrief)', guru: ['Hubungkan game & materi.'], siswa: ['Refleksi makna game (Tahap Merefleksi).'] }
    ],
    'Direct Instruction': [
      { name: 'Fase 1: Tujuan', guru: [`Jelaskan target ${topicCombined}.`], siswa: ['Siap belajar.'] },
      { name: 'Fase 2: Demonstrasi', guru: ['Demo keterampilan.'], siswa: ['Amati demo.'] },
      { name: 'Fase 3: Latihan Terbimbing', guru: ['Pandu latihan.'], siswa: ['Latihan awal (Tahap Mengaplikasi).'], diferensiasi: isDifferentiated ? { berjuang: 'Latihan dasar.', menengah: 'Latihan standar.', mahir: 'Latihan kompleks.' } : null },
      { name: 'Fase 4: Cek Pemahaman', guru: ['Koreksi hasil.'], siswa: ['Perbaiki kinerja.'] },
      { name: 'Fase 5: Latihan Mandiri', guru: ['Tugas mandiri.'], siswa: ['Latihan lanjutan (Tahap Merefleksi).'] }
    ]
  };

  const selectedPhases = modelPhases[model] || modelPhases['Direct Instruction'];
  const meetings = [];

  // Klasifikasi Model (Long-term vs Short-term)
  const isLongTerm = ['Project Based Learning', 'Problem Based Learning', 'Discovery Learning', 'Inquiry Learning'].includes(model);

  for (let i = 0; i < numMeetings; i++) {
    // Tentukan Topik untuk pertemuan ini (Jika materi banyak, didistribusikan. Jika sedikit, topik utama dipakai terus).
    // Jika LongTerm & Single Topic -> TopicCombined
    // Jika ShortTerm & Multi Topic -> Topic[i]

    let currentTopic = topicCombined;
    if (!isLongTerm && topics.length >= numMeetings) {
      currentTopic = topics[i];
    } else if (!isLongTerm && topics.length > 1) {
      currentTopic = topics[i % topics.length];
    }

    // Generator Pemahaman & Pemantik Unik
    const pemahaman = [
      `Memahami bahwa konsep ${currentTopic} dapat diaplikasikan untuk menyelesaikan masalah sehari-hari.`,
      `Menyadari pentingnya penguasaan ${currentTopic} bagi pengembangan diri.`
    ];
    const pemantik = [
      `Apa yang terlintas di benak kalian saat mendengar kata ${currentTopic}?`,
      `Bagaimana jika prinsip ${currentTopic} tidak diterapkan dengan benar?`
    ];

    // Distribusi Fase
    let meetingPhases = [];
    if (isLongTerm && numMeetings > 1) {
      // Continuous Flow (Fase dibagi)
      const totalPhases = selectedPhases.length;
      const chunkSize = Math.ceil(totalPhases / numMeetings);
      const startIdx = i * chunkSize;
      const endIdx = Math.min(startIdx + chunkSize, totalPhases);
      meetingPhases = selectedPhases.slice(startIdx, endIdx);

      if (meetingPhases.length === 0) {
        // Jika fase habis (misal pertemuan lebih banyak dari fase), lakukan Review/Pengayaan
        meetingPhases = [{
          name: 'Fase Pengayaan / Review',
          guru: ['Mereview materi dari pertemuan sebelumnya.', 'Memberikan tantangan tambahan.'],
          siswa: ['Memperdalam pemahaman.', 'Mengerjakan tantangan pengayaan.']
        }];
      }
    } else {
      // Iterative Flow / Full Cycle
      meetingPhases = selectedPhases;
    }

    const meetingPendahuluan = getPendahuluan(currentTopic, pemantik, pemahaman);

    // [MODIFIKASI] Asesmen Diagnostik di Pertemuan 1
    if (i === 0) {
      meetingPendahuluan.guru.splice(2, 0, 'Melakukan Asesmen Diagnostik Awal (Kognitif & Non-Kognitif) untuk memetakan kesiapan belajar siswa.');
      meetingPendahuluan.siswa.splice(2, 0, 'Mengerjakan asesmen diagnostik awal dengan jujur.');
    }

    meetings.push({
      meeting: i + 1,
      topic: currentTopic,
      pemahaman: pemahaman,
      pemantik: pemantik,
      pendahuluan: meetingPendahuluan,
      inti: meetingPhases,
      penutup: getPenutup()
    });
  }

  return meetings;
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
    teknik: 'Asesmen Diagnostik (Kognitif & Non-Kognitif)',
    instrumen: `Lembar diagnostik kesiapan belajar & pemahaman awal materi ${topic}.`
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
    
    ${steps.map(meeting => `
      <div style="margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #f0f7ff; padding: 10px 15px; border-bottom: 1px solid #c7d2fe;">
          <h3 style="margin: 0; color: #3730a3;">Pertemuan ${meeting.meeting}: ${meeting.topic}</h3>
        </div>

        <!-- Info Pemantik & Pemahaman -->
        <div style="padding: 15px; background: #fffcf0; border-bottom: 1px dashed #e0e0e0;">
          <div style="margin-bottom: 10px;">
            <strong style="color: #b45309;">💡 Pemahaman Bermakna:</strong>
            <ul style="margin: 5px 0 0 20px;">
              ${meeting.pemahaman.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="color: #047857;">❓ Pertanyaan Pemantik:</strong>
            <ul style="margin: 5px 0 0 20px;">
              ${meeting.pemantik.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <!-- Pendahuluan -->
        <div style="padding: 15px;">
          <h4 style="margin-top: 0;">1. Pendahuluan</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <tr style="background: #f9f9f9;">
              <th style="width: 50%; padding: 8px; border: 1px solid var(--border); text-align: left;">Aktivitas Guru</th>
              <th style="width: 50%; padding: 8px; border: 1px solid var(--border); text-align: left;">Aktivitas Peserta Didik</th>
            </tr>
            <tr>
              <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border);">
                <ul>${meeting.pendahuluan.guru.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
              <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border);">
                <ul>${meeting.pendahuluan.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
            </tr>
          </table>
        </div>

        <!-- Inti -->
        <div style="padding: 15px;">
          <h4 style="margin-top: 0;">2. Kegiatan Inti (${data.model})</h4>
          ${meeting.inti.map(phase => `
            <div style="margin-top: 15px;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: var(--primary);">${phase.name}</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <tr style="background: #fdfdfd;">
                  <th style="width: 50%; padding: 6px; border: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: #666;">Aktivitas Guru</th>
                  <th style="width: 50%; padding: 6px; border: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: #666;">Aktivitas Peserta Didik</th>
                </tr>
                <tr>
                  <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border);">
                    <ul style="margin: 0; padding-left: 18px;">${phase.guru.map(s => `<li>${s}</li>`).join('')}</ul>
                  </td>
                  <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border);">
                    <ul style="margin: 0; padding-left: 18px;">${phase.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
                  </td>
                </tr>
              </table>
              ${phase.diferensiasi ? `
                <div style="margin-top: 8px; padding: 10px; border: 1px dashed var(--accent); border-radius: 8px; background: #fffcf0;">
                  <strong style="font-size: 0.85rem; color: #b45309;">Diferensiasi Proses:</strong>
                  <ul style="font-size: 0.85rem; margin: 5px 0 0 0;">
                    <li><strong>Kelompok Belum Siap:</strong> ${phase.diferensiasi.berjuang}</li>
                    <li><strong>Kelompok Siap:</strong> ${phase.diferensiasi.menengah}</li>
                    <li><strong>Kelompok Mahir:</strong> ${phase.diferensiasi.mahir}</li>
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Penutup -->
        <div style="padding: 15px;">
          <h4 style="margin-top: 0;">3. Penutup</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <tr>
              <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border); width: 50%;">
                <ul>${meeting.penutup.guru.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
              <td style="vertical-align: top; padding: 8px; border: 1px solid var(--border); width: 50%;">
                <ul>${meeting.penutup.siswa.map(s => `<li>${s}</li>`).join('')}</ul>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `).join('')}
    
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
