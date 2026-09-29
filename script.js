// Cari berita: filter kartu berdasarkan judul, ringkasan, dan kata kunci
const cari = document.getElementById("cariBerita");
const kartu = document.querySelectorAll("#daftarBerita .news-card");
const kosong = document.getElementById("beritaKosong");
cari.addEventListener("input", () => {
  const q = cari.value.trim().toLowerCase();
  let tampil = 0;
  kartu.forEach((k) => {
    const teks = (k.textContent + " " + (k.dataset.search || "")).toLowerCase();
    const cocok =
      teks.includes(q) &&
      (window.kat === "Semua" ||
        k.querySelector(".badge").textContent === window.kat);
    k.classList.toggle("d-none", !cocok);
    if (cocok) tampil++;
  });
  kosong.classList.toggle("d-none", tampil > 0);
});

// Galeri: isi modal dengan foto yang diklik
document
  .getElementById("modalGaleri")
  .addEventListener("show.bs.modal", (e) => {
    const b = e.relatedTarget;
    document.getElementById("modalImg").src = b.dataset.src;
    document.getElementById("modalImg").alt = b.dataset.cap;
    document.getElementById("modalCap").textContent = b.dataset.cap;
  });

// Verifikasi sertifikat: DEMO. Ganti dengan fetch() ke API/database Anda.
const dataSertifikat = {
  "KC/2026/0001": {
    nama: "Contoh Peserta",
    program: "IT Training",
    tanggal: "15 September 2026",
  },
};
document.getElementById("formVerifikasi").addEventListener("submit", (e) => {
  e.preventDefault();
  const no = document.getElementById("noSertifikat").value.trim().toUpperCase();
  const hasil = document.getElementById("hasilVerifikasi");
  const d = dataSertifikat[no];
  hasil.innerHTML =
    '<div class="text-center text-secondary py-2"><span class="spinner-border spinner-border-sm me-2"></span>Memeriksa data...</div>';
  setTimeout(
    () =>
      (hasil.innerHTML = d
        ? `<div class="alert alert-success mb-0"><strong><i class="bi bi-patch-check-fill me-1"></i>Sertifikat valid.</strong><br>Nama: ${d.nama}<br>Program: ${d.program}<br>Tanggal terbit: ${d.tanggal}</div>`
        : `<div class="alert alert-danger mb-0"><strong>Sertifikat tidak ditemukan.</strong> Periksa kembali nomor yang Anda masukkan.</div>`),
    700,
  );
});

// ===== Interaksi & animasi =====
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const navEl = document.querySelector(".navbar-klinik");
const prog = document.getElementById("progress");
const toTop = document.getElementById("toTop");
let tick = false;
function onScroll() {
  const y = scrollY,
    h = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  navEl.classList.toggle("scrolled", y > 40);
  toTop.classList.toggle("show", y > 500);
  tick = false;
}
addEventListener(
  "scroll",
  () => {
    if (!tick) {
      tick = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
onScroll();
toTop.addEventListener("click", () =>
  scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }),
);
new bootstrap.ScrollSpy(document.body, {
  target: "#navbarSupportedContent",
  rootMargin: "0px 0px -60%",
});

// Muncul saat di-scroll (dengan jeda bertahap antar elemen sejajar)
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        setTimeout(() => en.target.classList.remove("reveal", "in"), 1500);
        io.unobserve(en.target);
      }),
    { threshold: 0.15 },
  );
  document
    .querySelectorAll(
      ".section-title,.section-sub,.stat,.about-img,.program,.steps li,.news-card,.widget,.gallery-item,.panel,.contact-line,.accordion-item",
    )
    .forEach((el) => {
      const par = el.parentElement;
      const node =
        par.matches('[class*="col-"]') && par.children.length === 1 ? par : el;
      const i = [...node.parentElement.children].indexOf(node);
      el.style.setProperty("--d", Math.min(i, 5) * 0.08 + "s");
      el.classList.add("reveal");
      io.observe(el);
    });
}

// Hitung angka statistik
const cio = new IntersectionObserver(
  (es) =>
    es.forEach((en) => {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target,
        end = +el.dataset.count,
        suf = el.dataset.suffix || "";
      if (reduce) return;
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / 1600, 1),
          e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e).toLocaleString("id-ID") + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }),
  { threshold: 0.6 },
);
document.querySelectorAll("[data-count]").forEach((el) => {
  if (!reduce) el.textContent = "0" + (el.dataset.suffix || "");
  cio.observe(el);
});

// Filter kategori berita (bekerja bersama kolom pencarian)
window.kat = "Semua";
document.querySelectorAll(".chip").forEach((c) =>
  c.addEventListener("click", () => {
    document
      .querySelectorAll(".chip")
      .forEach((x) => x.classList.remove("active"));
    c.classList.add("active");
    window.kat = c.dataset.kat;
    cari.dispatchEvent(new Event("input"));
  }),
);

// Lightbox galeri: tombol sebelumnya/berikutnya dan panah keyboard
const gItems = [...document.querySelectorAll(".gallery-item")];
const mImg = document.getElementById("modalImg"),
  mCap = document.getElementById("modalCap");
let gi = 0;
function showG(n) {
  gi = (n + gItems.length) % gItems.length;
  const b = gItems[gi];
  mImg.src = b.dataset.src;
  mImg.alt = b.dataset.cap;
  mCap.textContent = gi + 1 + " / " + gItems.length + " - " + b.dataset.cap;
}
const modalG = document.getElementById("modalGaleri");
modalG.addEventListener("show.bs.modal", (e) =>
  showG(gItems.indexOf(e.relatedTarget)),
);
document.getElementById("gPrev").addEventListener("click", () => showG(gi - 1));
document.getElementById("gNext").addEventListener("click", () => showG(gi + 1));
document.addEventListener("keydown", (e) => {
  if (!modalG.classList.contains("show")) return;
  if (e.key === "ArrowLeft") showG(gi - 1);
  if (e.key === "ArrowRight") showG(gi + 1);
});

// Registrasi & kontak: validasi dasar. Sambungkan ke backend Anda untuk pengiriman nyata.
function tanganiForm(idForm, idInfo, pesan) {
  document.getElementById(idForm).addEventListener("submit", (e) => {
    e.preventDefault();
    const info = document.getElementById(idInfo);
    if (!e.target.checkValidity()) {
      info.innerHTML =
        '<div class="alert alert-warning mb-0">Lengkapi semua kolom yang wajib diisi.</div>';
      return;
    }
    info.innerHTML = `<div class="alert alert-success mb-0">${pesan}</div>`;
    e.target.reset();
  });
}
tanganiForm(
  "formRegistrasi",
  "regInfo",
  "Pendaftaran terkirim. Kami akan menghubungi Anda segera.",
);
tanganiForm(
  "formKontak",
  "kInfo",
  "Pesan terkirim. Terima kasih telah menghubungi kami.",
);
