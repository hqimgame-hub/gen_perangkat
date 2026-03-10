import './style.css'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'

const form = document.getElementById('modulForm');
const resultDiv = document.getElementById('result');
const modulContent = document.getElementById('modulContent');
const lkpdContent = document.getElementById('lkpdContent');
const soalTab = document.getElementById('soalTab');
const soalContentOut = document.getElementById('soalContentOut');
const kunciJawabanSection = document.getElementById('kunciJawabanSection');
const kunciContent = document.getElementById('kunciContent');
const btnToggleKunci = document.getElementById('btnToggleKunci');

const resultTitle = document.getElementById('resultTitle');
const exportWordBtn = document.getElementById('exportWord');
const btnTabModul = document.getElementById('btnTabModul');
const btnTabLKPD = document.getElementById('btnTabLKPD');
const btnTabSoal = document.getElementById('btnTabSoal');

const soalForm = document.getElementById('soalForm');
const distribusiLevel = document.getElementById('distribusiLevel');
const jumlahSoalSelect = document.getElementById('jumlahSoal');

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
function switchTab(tab) {
  btnTabModul.classList.remove('active');
  btnTabLKPD.classList.remove('active');
  btnTabSoal.classList.remove('active');

  modulContent.style.display = 'none';
  lkpdContent.style.display = 'none';
  soalTab.style.display = 'none';

  modulContent.classList.remove('active');
  lkpdContent.classList.remove('active');
  soalTab.classList.remove('active');

  if (tab === 'modul') {
    btnTabModul.classList.add('active');
    modulContent.style.display = 'block';
    modulContent.classList.add('active');
  } else if (tab === 'lkpd') {
    btnTabLKPD.classList.add('active');
    lkpdContent.style.display = 'block';
    lkpdContent.classList.add('active');
  } else if (tab === 'soal') {
    btnTabSoal.classList.add('active');
    soalTab.style.display = 'block';
    soalTab.classList.add('active');
  }
}

btnTabModul.addEventListener('click', () => switchTab('modul'));
btnTabLKPD.addEventListener('click', () => switchTab('lkpd'));
btnTabSoal.addEventListener('click', () => switchTab('soal'));

exportWordBtn.addEventListener('click', async () => {
  const activeTab = document.querySelector('.tab-btn.active').id;
  let content = '';
  let fileName = '';

  if (activeTab === 'btnTabModul') {
    content = modulContent.innerHTML;
    fileName = `Modul Ajar - ${resultTitle.innerText.split(': ')[1] || 'Export'}`;
  } else if (activeTab === 'btnTabLKPD') {
    content = lkpdContent.innerHTML;
    fileName = `LKPD - ${resultTitle.innerText.split(': ')[1] || 'Export'}`;
  } else if (activeTab === 'btnTabSoal') {
    // Hide config and keys for clean export if desired, but we export as is
    content = soalContentOut.innerHTML;
    // For Word export, we include the answer key if it's currently generated
    if (kunciJawabanSection.style.display !== 'none') {
      content += `\n<div style="page-break-before: always;"></div>\n<h1>Kunci Jawaban & Rubrik</h1>\n${kunciContent.innerHTML}`;
    }
    fileName = `Bank Soal - ${resultTitle.innerText.split(': ')[1] || 'Export'}`;
  }

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

  // Fix KaTeX for Word (Word doesn't run JS, so we try to fallback to raw text if needed or keep HTML representation)
  const cleanedHtml = htmlDoc.replace(/<span class="katex-mathml">.*?<\/span>/g, '') // remove mathml for clean render

  const blob = await asBlob(cleanedHtml);
  saveAs(blob, `${fileName}.docx`);
});

// Generator Soal UI Logic
const useAICheckbox = document.getElementById('useAI');
const apiKeySection = document.getElementById('apiKeySection');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const btnGenerateSoal = document.getElementById('btnGenerateSoal');

// Load API Key from local storage if exists
if (localStorage.getItem('geminiApiKey')) {
  geminiApiKeyInput.value = localStorage.getItem('geminiApiKey');
}

useAICheckbox.addEventListener('change', (e) => {
  apiKeySection.style.display = e.target.checked ? 'block' : 'none';
});

distribusiLevel.addEventListener('change', (e) => {
  document.getElementById('customDistribusi').style.display = e.target.value === 'custom' ? 'grid' : 'none';
});

jumlahSoalSelect.addEventListener('change', (e) => {
  document.getElementById('customJumlah').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

btnToggleKunci.addEventListener('click', () => {
  const isHidden = kunciContent.style.display === 'none';
  kunciContent.style.display = isHidden ? 'block' : 'none';
  btnToggleKunci.innerText = isHidden ? 'Sembunyikan Kunci Jawaban' : 'Tampilkan Kunci Jawaban Lengkap';
  if (isHidden) {
    kunciContent.scrollIntoView({ behavior: 'smooth' });
  }
});

soalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validasi proporsi
  if (distribusiLevel.value === 'custom') {
    const pM = parseInt(document.getElementById('propMudah').value) || 0;
    const pSe = parseInt(document.getElementById('propSedang').value) || 0;
    const pSu = parseInt(document.getElementById('propSulit').value) || 0;
    if (pM + pSe + pSu !== 100) {
      document.getElementById('distribusiError').style.display = 'block';
      return;
    }
    document.getElementById('distribusiError').style.display = 'none';
  }

  // Ambil Data Modul Existing (untuk konteks)
  const dataModulStr = localStorage.getItem('modulData');
  const dataModul = dataModulStr ? JSON.parse(dataModulStr) : null;

  if (!dataModul || !dataModul.topic || !dataModul.cp) {
    alert("Silakan lengkapi dan Generate Modul Ajar terlebih dahulu agar generator soal memiliki konteks materi dan CP yang relevan.");
    return;
  }

  const soalConfig = {
    tipe: document.getElementById('tipeSoal').value,
    jumlah: jumlahSoalSelect.value === 'custom' ? parseInt(document.getElementById('customJumlah').value) : parseInt(jumlahSoalSelect.value),
    distribusi: distribusiLevel.value,
    customProp: {
      mudah: parseInt(document.getElementById('propMudah').value) || 0,
      sedang: parseInt(document.getElementById('propSedang').value) || 0,
      sulit: parseInt(document.getElementById('propSulit').value) || 0
    },
    useImage: document.getElementById('useImage').checked,
    useEquation: document.getElementById('useEquation').checked,
    useAI: useAICheckbox.checked,
    apiKey: geminiApiKeyInput.value,
    topic: dataModul.topic,
    subject: dataModul.subject,
    cp: dataModul.cp,
    jenjang: dataModul.jenjang,
    fase: dataModul.fase,
    kelas: dataModul.class,
    tps: generateTP(dataModul.cp, dataModul.topic) // Dapatkan TP dari existing context
  };

  if (soalConfig.useAI) {
    if (!soalConfig.apiKey) {
      alert("Harap masukkan Gemini API Key Anda untuk menggunakan fitur AI Asli.");
      return;
    }
    localStorage.setItem('geminiApiKey', soalConfig.apiKey); // Save it for future
    generateSoalWithAI(soalConfig);
  } else {
    generateSoal(soalConfig);
  }
});

// --- GENERATOR SOAL LOGIC (AI GEMINI) ---
async function generateSoalWithAI(config) {
  // Parsing prompt config
  const prompt = `Anda adalah seorang ahli pembuat soal evaluasi pendidikan untuk siswa di Indonesia.
Buat soal evaluasi berdasarkan data berikut:
- Mata Pelajaran: ${config.subject}
- Jenjang/Fase/Kelas: ${config.jenjang} / Fase ${config.fase} / Kelas ${config.kelas}
- Topik Materi: ${config.topic}
- Capaian Pembelajaran (CP): ${config.cp}
- Indikator Tersedia (TP): ${config.tps.join('; ')}

Spesifikasi Soal yang Harus Dibuat:
- Tipe Soal: ${config.tipe} (PG = Pilihan Ganda A-E, PG_KOMPLEKS = Pilih 2 benar dari 5 opsi A-E, BENAR_SALAH = Pernyataan dengan Opsi Benar/Salah, MENJODOHKAN = Lajur Kiri & Kanan, URAIAN = Soal esai HOTS/Medium dengan rubrik skor 1-4)
- Jumlah Soal Total: ${config.jumlah}
- Distribusi Kognitif/Level: ${config.distribusi.toUpperCase()} (Mudah, Sedang, Sulit) dimana HOTS = penalaran tingkat tinggi. Distribusikan ke ${config.jumlah} soal dengan tepat.
- Bahasa: Indonesia baku, ejaan EYD yang baik dan mendidik.

Kriteria Khusus:
1. Soal harus merepresentasikan indikator pelajaran.
2. Panjang soal harus memadai untuk masing-masing level kognitif. Soal Sulit (HOTS) wajib menyajikan kasus/narasi observasi pendahuluan yang jelas sebelum pertanyaannya.
3. OUTPUT HARUS FULL JSON (tanpa tag markdown \`\`\`json \`\`\`, cukup text murni valid JSON). Format JSON sebagai berikut:

[
  {
    "no": 1,
    "tipe": "${config.tipe}",
    "tp": "<ambil salah satu Indikator (TP) yang paling relevan>",
    "level": "<Mudah / Sedang / Sulit>",
    "teksSoal": "<Teks panjang dari soal pertanyaan. Jika KaTeX diperlukan, gunakan format $$rumus$$ (display) atau \\\\(rumus\\\\) (inline)>",
    "opsi": ["<opsi A jika PG>", "<opsi B>", "<opsi C>", "<opsi D>", "<opsi E>"], // ISI HANYA JIKA TIPE PG/PG_KOMPLEKS
    "kunci": "<Kunci jawaban: string (huruf A jika PG, kata Benar/Salah) atau array of string jika PG Kompleks (['A','C']) atau Menjodohkan (['1-B','2-C'])>",
    "pembahasan": "<Teks pembahasan rasional kunci jawaban singkat>",
    "kiri": ["<Pernyataan Kiri 1>", "<Kiri 2>", "<Kiri 3>", "<Kiri 4>"], // KHUSUS MENJODOHKAN
    "kanan": ["A. <Kanan A>", "B. <Kanan B>", "C. <Kanan C>", "D. <Kanan D>", "E. Pengecoh"], // KHUSUS MENJODOHKAN
    "rubrik": { // KHUSUS URAIAN
      "skor4": "<Kriteria skor sempurna>",
      "skor3": "<Kriteria skor 3>",
      "skor2": "<Kriteria skor 2>",
      "skor1": "<Kriteria minimal>"
    }
  },
  ... lanjutkan persis sampai soal ke-${config.jumlah} ...
]`;

  soalContentOut.innerHTML = `
    <div style="text-align:center; padding: 40px; color: #be185d;">
      <svg class="spinner" viewBox="0 0 50 50" style="width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px auto;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="1, 200" style="animation: dash 1.5s ease-in-out infinite;" />
      </svg>
      <h3 style="margin: 0;">AI Sedang Menyusun Soal...</h3>
      <p style="color: #666; font-size: 0.9rem;">Gemini sedang menyusun indikator, menganalisis materi, dan menyiapkan soal berstandar tinggi (${config.jumlah} pertanyaan). Mohon tunggu beberapa detik.</p>
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      @keyframes dash { 0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; } 50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; } 100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; } }
    </style>
  `;
  kunciJawabanSection.style.display = 'none';
  btnGenerateSoal.disabled = true;
  btnGenerateSoal.innerHTML = 'Memproses...';

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gagal memanggil API Gemini. Periksa API Key Anda.');
    }

    const jsonRes = await response.json();
    let textOut = jsonRes.candidates[0].content.parts[0].text;

    // Clean markdown json tags if AI ignores instruction
    textOut = textOut.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

    try {
      const gSoalData = JSON.parse(textOut);

      // Inject placeholder and process KatTex spacing for every soal obj
      gSoalData.forEach((s, idx) => {
        // Re-assign default values if missing
        if (!s.opsi) s.opsi = [];
        if (!s.kunci) s.kunci = "";
        if (s.tipe === 'URAIAN' && !s.rubrik) s.rubrik = { skor4: "Sangat baik", skor3: "Baik", skor2: "Cukup", skor1: "Kurang" };
        if (s.tipe === 'MENJODOHKAN') {
          if (!s.kiri) s.kiri = ['Pertanyaan'];
          if (!s.kanan) s.kanan = ['Jawaban'];
        }

        // Apply post-processing visual modifier (images layer, KaTeX re-mapper)
        let modTeks = s.teksSoal;
        modTeks += getPlaceholderImage(config.useImage, idx + 1);
        s.teksSoal = modTeks;
      });

      renderSoal(gSoalData, config);

    } catch (errParse) {
      console.error("AI Output:", textOut);
      throw new Error("AI memberikan respons yang tidak berformat JSON valid. Silakan coba tekan Generate lagi.");
    }

  } catch (err) {
    soalContentOut.innerHTML = `<div style="color: red; padding: 20px; background: #fee2e2; border-radius: 8px;"><b>Error:</b> ${err.message}</div>`;
  } finally {
    btnGenerateSoal.disabled = false;
    btnGenerateSoal.innerHTML = `<span>Generate Soal Sekarang</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
  }
}

// --- GENERATOR SOAL LOGIC (STATIS - FALLBACK) ---

function isScienceMath(subject) {
  const s = subject.toLowerCase();
  return s.includes('matematika') || s.includes('fisika') || s.includes('kimia') || s.includes('ipa');
}

function processKaTeX(text, subject, enableEquation) {
  if (!enableEquation || !isScienceMath(subject)) return text;

  // Randomly inject equation pattern if it's a science subject context
  const s = subject.toLowerCase();
  let eq = '';
  if (s.includes('matematika')) {
    const eqs = ['f(x) = ax^2 + bx + c', '\\int_{a}^{b} x^2 dx', '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', '\\log_{a} x = y \\iff a^y = x'];
    eq = eqs[Math.floor(Math.random() * eqs.length)];
  } else if (s.includes('fisika')) {
    const eqs = ['E = mc^2', 'F = G \\frac{m_1 m_2}{r^2}', 'V = I \\cdot R', '\\Delta Q = m \\cdot c \\cdot \\Delta T'];
    eq = eqs[Math.floor(Math.random() * eqs.length)];
  } else if (s.includes('kimia')) {
    const eqs = ['\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}', 'pH = -\\log[H^+]', 'PV = nRT'];
    eq = eqs[Math.floor(Math.random() * eqs.length)];
  } else {
    const eqs = ['x = \\frac{y}{z}', 'A = \\pi r^2'];
    eq = eqs[Math.floor(Math.random() * eqs.length)];
  }

  if (eq && Math.random() > 0.5) { // 50% chance to insert equation into question
    return text + `<div class="katex-display">\\[${eq}\\]</div>`;
  }
  return text;
}

function getPlaceholderImage(useImage, index) {
  if (!useImage || Math.random() > 0.4) return ''; // 40% chance to have image
  return `<div class="gambar-placeholder"> [TEMPELKAN GAMBAR/GRAFIK UNTUK SOAL NO. ${index} DI SINI] </div>`;
}

function generateSoal(config) {
  let listSoal = [];

  // Calculate distribution
  let pMudah = 0, pSedang = 0, pSulit = 0;
  if (config.distribusi === 'seimbang') { pMudah = 30; pSedang = 40; pSulit = 30; }
  else if (config.distribusi === 'lots') { pMudah = 50; pSedang = 30; pSulit = 20; }
  else if (config.distribusi === 'hots') { pMudah = 20; pSedang = 30; pSulit = 50; }
  else {
    pMudah = config.customProp.mudah;
    pSedang = config.customProp.sedang;
    pSulit = config.customProp.sulit;
  }

  const cMudah = Math.round((pMudah / 100) * config.jumlah);
  const cSedang = Math.round((pSedang / 100) * config.jumlah);
  // Sulit takes the remainder to ensure exact total
  const cSulit = config.jumlah - (cMudah + cSedang);

  const levels = [
    ...Array(cMudah).fill('Mudah'),
    ...Array(cSedang).fill('Sedang'),
    ...Array(cSulit).fill('Sulit')
  ];

  // Randomize array
  levels.sort(() => Math.random() - 0.5);

  for (let i = 0; i < config.jumlah; i++) {
    const level = levels[i];
    const tp = config.tps[i % config.tps.length];

    let soalObj = null;
    if (config.tipe === 'PG') soalObj = generateSoalPG(i + 1, tp, config.topic, level, config);
    else if (config.tipe === 'PG_KOMPLEKS') soalObj = generateSoalPGKompleks(i + 1, tp, config.topic, level, config);
    else if (config.tipe === 'BENAR_SALAH') soalObj = generateSoalBenarSalah(i + 1, tp, config.topic, level, config);
    else if (config.tipe === 'MENJODOHKAN') soalObj = generateSoalMenjodohkan(i + 1, tp, config.topic, config);
    else if (config.tipe === 'URAIAN') soalObj = generateSoalUraian(i + 1, tp, config.topic, level, config);

    listSoal.push(soalObj);
  }

  renderSoal(listSoal, config);
}

// ---------------- SOAL GENERATORS ---------------- 

const PENGHANTAR = [
  "Berdasarkan konsep yang telah dipelajari,",
  "Perhatikan pernyataan berikut dengan seksama.",
  "Dalam konteks kehidupan sehari-hari,",
  "Sebuah fenomena menunjukkan bahwa",
  "Ilmuwan menemukan bahwa"
];

function getRandomPenghantar() {
  return Math.random() > 0.5 ? PENGHANTAR[Math.floor(Math.random() * PENGHANTAR.length)] + " " : "";
}

function processTeksSoal(baseText, config, index) {
  let t = getRandomPenghantar() + baseText;
  t += getPlaceholderImage(config.useImage, index);
  t = processKaTeX(t, config.subject, config.useEquation);
  return t;
}

function generateSoalPG(no, tp, topic, level, config) {
  const topikUtama = topic.split('\n')[0].trim();
  let pertanyaan = "";
  let opsi = [];
  let jwbIndex = 0;

  if (level === 'Mudah') {
    pertanyaan = `Apa pengertian utama dari konsep ${topikUtama}?`;
    opsi = [
      `Proses atau karakteristik inti dari ${topikUtama} yang menjadikannya unik`,
      `Kumpulan unsur yang tidak berhubungan dengan ${topikUtama} sama sekali`,
      `Mekanisme respons dari sistem luar terhadap ${topikUtama}`,
      `Definisi alternatif yang berlawanan dengan konsep ${topikUtama}`,
      `Pernyataan yang bersifat netral dan tidak menjelaskan ${topikUtama}`
    ];
    jwbIndex = 0; // opsi A adalah yang benar
  } else if (level === 'Sedang') {
    pertanyaan = `Manakah penerapan yang TEPAT dari konsep ${topikUtama} dalam kehidupan nyata?`;
    opsi = [
      `Menerapkan prinsip ${topikUtama} untuk memecahkan permasalahan yang relevan di lingkungan`,
      `Mengabaikan ${topikUtama} dan menggatikannya dengan konsep yang tidak berkaitan`,
      `Menerapkan ${topikUtama} hanya pada kondisi yang terisolasi dari konteks aslinya`,
      `Membalikkan prinsip kerja ${topikUtama} sehingga menghasilkan hasil yang berlawanan`,
      `Menggunakan konsep dari bidang lain yang tidak memiliki keterkaitan dengan ${topikUtama}`
    ];
    jwbIndex = 0; // opsi A adalah yang benar
  } else { // Sulit / HOTS
    pertanyaan = `Jika terjadi gangguan kritis pada proses ${topikUtama}, evaluasi dampak paling signifikan yang akan terjadi!`;
    opsi = [
      `Memburuknya keseimbangan keseluruhan sistem yang bergantung pada ${topikUtama}`,
      `Sistem beradaptasi secara sempurna tanpa ada perubahan yang berarti`,
      `Proses ${topikUtama} tergantikan oleh mekanisme lain secara otomatis dan instan`,
      `Dampak hanya terjadi secara lokal dan terisolasi pada komponen terkecil saja`,
      `Tidak ada dampak apapun karena ${topikUtama} bersifat independen dari sistem`
    ];
    jwbIndex = 0; // opsi A adalah yang benar
  }

  pertanyaan = processTeksSoal(pertanyaan, config, no);

  return {
    no, tipe: 'PG', tp, level,
    teksSoal: pertanyaan,
    opsi: opsi,
    kunci: String.fromCharCode(65 + jwbIndex) // A
  };
}

function generateSoalPGKompleks(no, tp, topic, level, config) {
  const topikUtama = topic.split('\n')[0].trim();
  let pertanyaan = `Pilihlah DUA pernyataan yang BENAR mengenai ${topikUtama}!`;
  pertanyaan = processTeksSoal(pertanyaan, config, no);

  return {
    no, tipe: 'PG_KOMPLEKS', tp, level,
    teksSoal: pertanyaan,
    opsi: [
      `${topikUtama} memiliki peran penting dalam menjaga keseimbangan sistem terkait`,
      `${topikUtama} tidak dipengaruhi oleh faktor eksternal manapun`,
      `${topikUtama} dapat diobservasi melalui perubahan yang dapat diukur secara ilmiah`,
      `${topikUtama} hanya berlaku pada kondisi laboratorium dan tidak ditemukan di alam`,
      `Gangguan pada ${topikUtama} tidak menimbulkan konsekuensi apapun pada organisme/sistem`
    ],
    kunci: ['A', 'C'] // Opsi A dan C yang benar
  };
}

function generateSoalBenarSalah(no, tp, topic, level, config) {
  let pernyataan = `Pernyataan: Konsep ${topic.split('\n')[0].trim()} tidak memiliki pengaruh apa-apa terhadap lingkungan sekitar.`;
  pernyataan = processTeksSoal(pernyataan, config, no);

  return {
    no, tipe: 'BENAR_SALAH', tp, level,
    teksSoal: pernyataan,
    kunci: 'Salah',
    pembahasan: 'Konsep tersebut sangat berpengaruh pada keseimbangan sistem terkait.'
  };
}

function generateSoalMenjodohkan(no, tp, topic, config) {
  let pertanyaan = `Pasangkanlah pernyataan di lajur kiri dengan jawaban yang tepat di lajur kanan terkait ${topic.split('\n')[0].trim()}!`;
  pertanyaan = processTeksSoal(pertanyaan, config, no);

  return {
    no, tipe: 'MENJODOHKAN', tp, level: 'Sedang',
    teksSoal: pertanyaan,
    kiri: ['Pernyataan 1', 'Pernyataan 2', 'Pernyataan 3', 'Pernyataan 4'],
    kanan: ['A. Jawaban X', 'B. Jawaban Y', 'C. Jawaban Z', 'D. Jawaban W', 'E. Pengecoh'],
    kunci: ['1-B', '2-C', '3-A', '4-D']
  };
}

function generateSoalUraian(no, tp, topic, level, config) {
  let pertanyaan = "";
  if (level === 'Mudah') {
    pertanyaan = `Sebutkan dan jelaskan secara ringkas 3 komponen dari ${topic.split('\n')[0].trim()}!`;
  } else if (level === 'Sedang') {
    pertanyaan = `Bandingkan dua hal yang berkaitan dengan ${topic.split('\n')[0].trim()}, lalu berikan contoh penerapannya!`;
  } else {
    pertanyaan = `Rancanglah sebuah solusi inovatif untuk mengatasi masalah yang melibatkan ${topic.split('\n')[0].trim()}! Berikan alasan yang logis (HOTS).`;
  }

  pertanyaan = processTeksSoal(pertanyaan, config, no);

  return {
    no, tipe: 'URAIAN', tp, level,
    teksSoal: pertanyaan,
    rubrik: {
      skor4: 'Menjawab sangat lengkap, logis, sesuai konteks, dan memberikan contoh yang relevan.',
      skor3: 'Menjawab cukup lengkap, sesuai konteks, namun contoh kurang relevan.',
      skor2: 'Menjawab sebagian kecil pertanyaan namun belum tepat sasaran.',
      skor1: 'Menjawab dengan pemahaman yang kurang tepat / melenceng jauh.'
    }
  };
}

// ---------------- RENDER UI ---------------- 

function renderSoal(listSoal, config) {
  let htmlSoal = `<div class="info-box" style="margin-bottom:20px; background:#f8fafc; padding:15px; border-radius:8px; border:1px solid #cbd5e1;">
    <strong>Topik:</strong> ${config.topic.replace(/\n/g, ', ')} <br>
    <strong>Tipe Soal:</strong> ${config.tipe} | <strong>Jumlah:</strong> ${config.jumlah} | <strong>Level:</strong> ${config.distribusi.toUpperCase()}
  </div>
  <div class="soal-container">`;

  let htmlKunci = `<table class="kunci-table">
    <tr><th>No</th><th>Indikator (TP)</th><th>Level</th><th>Kunci Jawaban</th></tr>`;

  listSoal.forEach(s => {
    // Determine level badge class
    const bClass = s.level === 'Mudah' ? 'badge-mudah' : (s.level === 'Sedang' ? 'badge-sedang' : 'badge-sulit');

    htmlSoal += `<div class="soal-item">
      <div class="soal-header">
        <div class="soal-nomor">SOAL NO. ${s.no}</div>
        <div class="badge-group">
          <span class="badge badge-tp" title="${s.tp}">TP: ${s.tp.substring(0, 30)}...</span>
          <span class="badge ${bClass}">${s.level}</span>
        </div>
      </div>
      <div class="soal-teks">${s.teksSoal}</div>`;

    if (s.tipe === 'PG' || s.tipe === 'PG_KOMPLEKS') {
      htmlSoal += `<ul class="opsi-list">`;
      s.opsi.forEach((op, idx) => {
        const hrf = String.fromCharCode(65 + idx);
        // PG Kompleks checkboxes, PG radio
        const inputType = s.tipe === 'PG' ? 'radio' : 'checkbox';
        htmlSoal += `<li class="opsi-item">
          <input type="${inputType}" name="soal_${s.no}" style="margin-right: 12px; transform: scale(1.2);">
          <span class="opsi-huruf">${hrf}.</span>
          <span class="opsi-teks">${op} (Distraktor representatif)</span>
        </li>`;
      });
      htmlSoal += `</ul>`;
    }
    else if (s.tipe === 'BENAR_SALAH') {
      htmlSoal += `
        <div style="display:flex; gap:20px; margin-top:20px;">
          <label style="display:flex; align-items:center; gap:8px;"><input type="radio" name="soal_${s.no}"> <strong>BENAR</strong></label>
          <label style="display:flex; align-items:center; gap:8px;"><input type="radio" name="soal_${s.no}"> <strong>SALAH</strong></label>
        </div>`;
    }
    else if (s.tipe === 'MENJODOHKAN') {
      htmlSoal += `<div class="menjodohkan-container">
        <div class="menjodohkan-col">
          <h4>Pernyataan</h4>
          <ul class="menjodohkan-list">
            ${s.kiri.map((k, i) => `<li><span class="num">${i + 1}.</span><span class="val">${k}</span></li>`).join('')}
          </ul>
        </div>
        <div class="menjodohkan-col">
          <h4>Pilihan Jawaban</h4>
          <ul class="menjodohkan-list">
            ${s.kanan.map(k => `<li><span class="val">${k}</span></li>`).join('')}
          </ul>
        </div>
      </div>`;
    }
    else if (s.tipe === 'URAIAN') {
      htmlSoal += `<div class="write-area" style="height: 120px; border: 1px dashed #aaa; margin-top: 15px; background: #fafafa;"></div>`;
    }

    htmlSoal += `</div>`;

    // Build Kunci
    let kStr = '';
    if (s.tipe === 'PG') kStr = `<strong>${s.kunci}</strong>`;
    else if (s.tipe === 'PG_KOMPLEKS') kStr = `<strong>${s.kunci.join(', ')}</strong>`;
    else if (s.tipe === 'BENAR_SALAH') kStr = `<strong>${s.kunci}</strong> <br><small style="color:#666;">(${s.pembahasan})</small>`;
    else if (s.tipe === 'MENJODOHKAN') kStr = `<strong>${s.kunci.join(' | ')}</strong>`;
    else if (s.tipe === 'URAIAN') kStr = `
      <table class="rubrik-uraian-table">
        <tr><th>Skor 4</th><th>Skor 3</th><th>Skor 2</th><th>Skor 1</th></tr>
        <tr><td>${s.rubrik.skor4}</td><td>${s.rubrik.skor3}</td><td>${s.rubrik.skor2}</td><td>${s.rubrik.skor1}</td></tr>
      </table>`;

    htmlKunci += `<tr>
      <td style="text-align:center;">${s.no}</td>
      <td><small>${s.tp}</small></td>
      <td><span class="badge ${bClass}">${s.level}</span></td>
      <td>${kStr}</td>
    </tr>`;
  });

  htmlSoal += `</div>`;
  htmlKunci += `</table>`;

  soalContentOut.innerHTML = htmlSoal;
  kunciContent.innerHTML = htmlKunci;

  resultDiv.style.display = 'block';
  kunciJawabanSection.style.display = 'block';

  // Render KaTeX if window.renderMathInElement exists
  if (window.renderMathInElement) {
    window.renderMathInElement(soalContentOut, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ]
    });
  }

  soalContentOut.scrollIntoView({ behavior: 'smooth' });
}

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

function generateLKPD(data) {
  const lkpdHTML = renderSmartLKPD(data);
  lkpdContent.innerHTML = lkpdHTML;
}

function renderSmartLKPD(data) {
  // 1. Analisis Topik untuk "AI-like" generation
  const context = analyzeTopicContext(data.topic);

  // 2. Generate TPs (Konsistensi)
  const tps = generateTP(data.cp, data.topic);
  const displayTPs = tps.slice(0, 3).map(tp => `<li>${tp}</li>`).join('');

  // 3. Generate Stimulus & Pemantik Cerdas
  const stimulus = generateSmartStimulus(context);
  const hotsQuestions = generateSmartQuestions(context);

  // 4. Generate Aktivitas per Pertemuan (Smart Steps)
  const numMeetings = parseInt(data.pertemuan) || 1;
  let activitiesContent = '';

  for (let i = 1; i <= numMeetings; i++) {
    const meetingData = {
      meeting: i,
      total: numMeetings,
      model: data.model,
      topic: context.subtopics[(i - 1) % context.subtopics.length] || context.mainTopic,
      context: context
    };

    activitiesContent += `
        <div class="lkpd-section meeting-section" style="break-before: page; margin-top: 30px; border-top: 3px double #333; padding-top: 20px;">
            <div class="lkpd-header-small">KEGIATAN PEMBELAJARAN PERTEMUAN KE-${i}</div>
            <div class="sub-topic-badge">Fokus: ${meetingData.topic}</div>
            ${generateSmartActivities(meetingData)}
        </div>
     `;
  }

  // 5. Rubrik Penilaian Diri (Baru)
  const selfAssessment = generateSelfAssessment(context);

  return `
    <div class="lkpd-paper">
      <!-- HEADER IDENTITAS -->
      <div class="lkpd-header-box">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 15%; text-align: center;">
              <div style="border: 2px solid #333; padding: 10px; font-weight: bold; border-radius: 5px;">LKPD</div>
            </td>
            <td style="text-align: center;">
              <h2 style="margin: 0; font-size: 1.2rem;">LEMBAR KERJA PESERTA DIDIK</h2>
              <h3 style="margin: 5px 0 0 0; font-size: 1rem;">${data.subject} | KELAS ${data.class} | ${data.semester.toUpperCase()}</h3>
              <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Materi Pokok: <strong>${data.topic.split('\n')[0]}</strong></p>
            </td>
            <td style="width: 25%; font-size: 0.8rem; border-left: 1px solid #ccc; padding-left: 10px;">
              <strong>KELOMPOK:</strong> ........................<br>
              <strong>ANGGOTA:</strong><br>
              1. ....................................<br>
              2. ....................................<br>
              3. ....................................<br>
              4. ....................................
            </td>
          </tr>
        </table>
      </div>

      <!-- TUJUAN -->
      <div class="lkpd-section">
        <div class="section-title">A. TUJUAN PEMBELAJARAN</div>
        <ul class="lkpd-list">
            ${displayTPs}
        </ul>
      </div>

      <!-- STIMULUS -->
      <div class="lkpd-section">
        <div class="section-title">B. STIMULUS & ORIENTASI</div>
        <div class="stimulus-box">
            <p style="text-align: center; font-style: italic; color: #555;">${stimulus.instruction}</p>
            <div style="margin-top: 10px; text-align: center; font-weight: bold;">"${stimulus.headline}"</div>
            <div class="placeholder-image">
                [TEMPELKAN GAMBAR/ARTIKEL TENTANG "${context.mainTopic.toUpperCase()}" DI SINI]
            </div>
        </div>
        <p><strong>Pertanyaan Pemantik:</strong></p>
        <ol class="lkpd-list">
            ${hotsQuestions.map(q => `<li>${q}<br><div class="lines-dotted"></div></li>`).join('')}
        </ol>
      </div>

      <!-- PETUNJUK -->
      <div class="lkpd-section">
        <div class="section-title">C. PETUNJUK PENGERJAAN</div>
        <ol class="lkpd-list">
            <li>Bacalah doa sebelum memulai kegiatan belajar.</li>
            <li>Diskusikan setiap masalah dengan teman sekelompokmu.</li>
            <li>Tanyakan pada guru jika ada instruksi yang kurang jelas.</li>
            <li>Gunakan sumber belajar (Buku Paket/Internet) yang relevan.</li>
        </ol>
      </div>

      <!-- AKTIVITAS PER PERTEMUAN -->
      ${activitiesContent}

      <!-- REFLEKSI & PENILAIAN -->
      <div class="lkpd-section" style="break-before: auto;">
        <div class="section-title">D. REFLEKSI & PENILAIAN DIRI</div>
        ${selfAssessment}
      </div>
      
      <div class="lkpd-footer">
        <table style="width: 100%;">
          <tr>
             <td style="text-align: center; width: 30%;">
                <p>Nilai</p>
                <div style="border: 1px solid #333; height: 50px; width: 80px; margin: auto;"></div>
             </td>
             <td style="width: 40%;"></td>
             <td style="text-align: center; width: 30%;">
                <p>Guru Mata Pelajaran</p>
                <br><br><br>
                <p>( .................................... )</p>
             </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

// --- SMART LOGIC HELPERS ---

function analyzeTopicContext(topicString) {
  const topics = topicString.split('\n').map(t => t.trim()).filter(t => t);
  const mainTopic = topics[0];
  const lowerTopic = mainTopic.toLowerCase();

  // Deteksi Keyword untuk menentukan Jenis Materi
  let type = 'konsep'; // default
  if (lowerTopic.includes('proses') || lowerTopic.includes('daur') || lowerTopic.includes('siklus') || lowerTopic.includes('cara')) type = 'proses';
  else if (lowerTopic.includes('struktur') || lowerTopic.includes('bagian') || lowerTopic.includes('jenis')) type = 'struktur';
  else if (lowerTopic.includes('perbedaan') || lowerTopic.includes('perbandingan')) type = 'komparasi';
  else if (lowerTopic.includes('hitung') || lowerTopic.includes('rumus')) type = 'kalkulasi';

  return {
    mainTopic: mainTopic,
    subtopics: topics,
    type: type, // proses, struktur, komparasi, kalkulasi, konsep
    keywords: lowerTopic.split(' ')
  };
}

function generateSmartStimulus(context) {
  const type = context.type;
  const topic = context.mainTopic;

  if (type === 'proses') {
    return {
      instruction: "Perhatikan diagram alur/video di bawah ini!",
      headline: `Bagaimana Proses ${topic} Terjadi?`
    };
  } else if (type === 'struktur') {
    return {
      instruction: "Amati gambar struktur di bawah ini!",
      headline: `Mengenal Bagian-Bagian ${topic}`
    };
  } else if (type === 'komparasi') {
    return {
      instruction: "Baca tabel perbandingan/kasus berikut!",
      headline: `Perbedaan Karakteristik pada ${topic}`
    };
  } else {
    return {
      instruction: "Bacalah artikel berita/kasus faktual berikut!",
      headline: `Fenomena ${topic} di Kehidupan Sehari-hari`
    };
  }
}

function generateSmartQuestions(context) {
  const topic = context.mainTopic;
  // Template pertanyaan yang lebih spesifik
  const templates = [
    `Apa yang menyebabkan terjadinya fenomena ${topic} seperti pada stimulus di atas?`,
    `Bagaimana dampak ${topic} terhadap lingkungan/kehidupan manusia?`,
    `Jika komponen utama ${topic} hilang, apa yang akan terjadi?`,
    `Apakah penerapan ${topic} di sekitarmu sudah optimal? Jelaskan alasannya!`
  ];
  return templates.slice(0, 2); // Ambil 2
}

function generateSmartActivities(data) {
  const { model, topic, context } = data;

  // Helper render fungsi input
  const renderInput = (height = '50px') => `<div class="write-area" style="height: ${height};"></div>`;
  const renderTable = (headers, rows = 3) => {
    let th = headers.map(h => `<th>${h}</th>`).join('');
    let tr = '';
    for (let i = 0; i < rows; i++) {
      tr += `<tr>${headers.map((_, idx) => idx === 0 && headers[0] === 'No' ? `<td style="text-align:center;">${i + 1}</td>` : `<td></td>`).join('')}</tr>`;
    }
    return `<table class="lkpd-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  };

  // 1. PROJECT BASED LEARNING (PjBL)
  if (model === 'Project Based Learning') {
    if (data.meeting === 1) {
      return `
        <div class="activity-step">
          <div class="step-label">FASE 1: PERTANYAAN MENDASAR</div>
          <p>Diskusikanlah masalah terkait <strong>${topic}</strong> yang ingin kalian selesaikan melalui sebuah proyek.</p>
          <p><strong>Masalah Utama:</strong></p>
          ${renderInput('40px')}
          <p><strong>Solusi (Produk) yang akan dibuat:</strong></p>
          ${renderInput('40px')}
        </div>
        <div class="activity-step">
          <div class="step-label">FASE 2: DESAIN PERENCANAAN</div>
          <p>Gambarkan sketsa/rancangan produk kalian di bawah ini:</p>
          ${renderInput('150px')}
          <p><strong>Alat & Bahan:</strong></p>
          ${renderTable(['No', 'Nama Alat/Bahan', 'Fungsi/Kegunaan'], 4)}
        </div>
      `;
    } else {
      return `
        <div class="activity-step">
          <div class="step-label">FASE 3 & 4: PENJADWALAN & MONITORING</div>
          <p>Susunlah jadwal pengerjaan proyek <strong>${topic}</strong> kalian:</p>
          ${renderTable(['No', 'Tahapan Kegiatan', 'Waktu Pelaksanaan', 'Penanggung Jawab'], 4)}
        </div>
        <div class="activity-step">
          <div class="step-label">FASE 5: PENGUJIAN HASIL</div>
          <p>Lakukan uji coba terhadap produk kalian. Catat hasilnya:</p>
          ${renderTable(['Aspek yang Diuji', 'Hasil Pengujian', 'Keterangan'], 3)}
        </div>
      `;
    }
  }

  // 2. PROBLEM BASED LEARNING (PBL)
  if (model === 'Problem Based Learning') {
    return `
        <div class="activity-step">
          <div class="step-label">LANGKAH 1: ORIENTASI MASALAH</div>
          <p>Berdasarkan kasus <strong>${topic}</strong> yang diberikan guru, identifikasi inti permasalahannya:</p>
          ${renderInput('60px')}
        </div>
        <div class="activity-step">
          <div class="step-label">LANGKAH 2: ORGANISASI BELAJAR</div>
          <p>Bagilah tugas untuk mencari informasi mengenai penyebab dan dampak masalah tersebut:</p>
          ${renderTable(['No', 'Nama Anggota', 'Tugas Investigasi'], 4)}
        </div>
        <div class="activity-step">
          <div class="step-label">LANGKAH 3: PENYELIDIKAN</div>
          <p>Tuliskan data/fakta yang kalian temukan:</p>
          ${renderInput('100px')}
        </div>
        <div class="activity-step">
          <div class="step-label">LANGKAH 4: PENGEMBANGAN SOLUSI</div>
          <p>Apa solusi paling efektif untuk masalah <strong>${topic}</strong> ini? Jelaskan alasannya!</p>
          ${renderInput('80px')}
        </div>
      `;
  }

  // 3. DISCOVERY LEARNING
  if (model === 'Discovery Learning') {
    let dataCollectTable = '';
    if (context.type === 'proses') {
      dataCollectTable = renderTable(['No', 'Tahapan Proses', 'Apa yang terjadi?', 'Waktu/Kondisi'], 4);
    } else if (context.type === 'struktur') {
      dataCollectTable = renderTable(['No', 'Nama Bagian', 'Ciri-Ciri', 'Fungsi'], 4);
    } else {
      dataCollectTable = renderTable(['No', 'Data/Temuan', 'Keterangan'], 4);
    }

    return `
        <div class="activity-step">
            <div class="step-label">TAHAP 1: STIMULASI & IDENTIFIKASI</div>
            <p>Tuliskan hipotesis (dugaan sementara) kalian tentang <strong>${topic}</strong>:</p>
            ${renderInput('40px')}
        </div>
        <div class="activity-step">
            <div class="step-label">TAHAP 2: PENGUMPULAN DATA</div>
            <p>Lakukan pengamatan/literasi, lalu catat informasinya:</p>
            ${dataCollectTable}
        </div>
        <div class="activity-step">
            <div class="step-label">TAHAP 3: PENGOLAHAN DATA & PEMBUKTIAN</div>
            <p>Apakah data di atas sesuai dengan hipotesis awal kalian? Jelaskan!</p>
            ${renderInput('80px')}
        </div>
      `;
  }

  // 4. GENERIC / LAINNYA
  return `
    <div class="activity-step">
        <div class="step-label">AKTIVITAS 1: EKSPLORASI KONSEP</div>
        <p>Jelaskan pemahaman kalian tentang konsep <strong>${topic}</strong> melalui peta konsep atau ringkasan di bawah ini:</p>
        <div class="write-area" style="height: 150px; border: 1px dashed #aaa; text-align: center; color: #999; padding-top: 60px;">(Gambarkan Peta Konsep / Mind Map Di Sini)</div>
    </div>
    <div class="activity-step">
        <div class="step-label">AKTIVITAS 2: ANALISIS KASUS</div>
        <p>Diskusikan pertanyaan berikut:</p>
        <ol>
            <li>Mengapa <strong>${topic}</strong> penting dipelajari?</li>
            <div class="write-line"></div>
            <li>Berikan 3 contoh penerapan nyata dari <strong>${topic}</strong>!</li>
            <div class="write-line"></div>
        </ol>
    </div>
  `;
}

function generateSelfAssessment(context) {
  return `
      <p>Berilah tanda ceklis (✔) pada kolom yang sesuai dengan diri kalian.</p>
      <table class="lkpd-table">
        <thead>
            <tr>
                <th>Pernyataan</th>
                <th>Sangat Paham</th>
                <th>Paham</th>
                <th>Kurang Paham</th>
                <th>Tidak Paham</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: left;">Saya memahami konsep dasar <strong>${context.mainTopic}</strong>.</td>
                <td></td><td></td><td></td><td></td>
            </tr>
            <tr>
                <td style="text-align: left;">Saya dapat menjelaskan kembali materi dengan bahasa sendiri.</td>
               <td></td><td></td><td></td><td></td>
            </tr>
            <tr>
                <td style="text-align: left;">Saya aktif berdiskusi dengan kelompok.</td>
                <td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
      </table>
      <p style="margin-top: 10px;"><strong>Hal yang belum saya pahami:</strong></p>
      <div class="write-line"></div>
    `;
}