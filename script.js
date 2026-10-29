/* Colca Aventuras · script.js (vanilla) */

// ⚠️ Pon aquí el WhatsApp oficial (formato internacional, sin "+" ni espacios). Ej: "51987654321"
// Mientras tenga "X", los botones de reserva abren el correo info@colcaaventuras.com con el mensaje ya escrito.
const WHATSAPP = "51XXXXXXXXX";
const EMAIL = "info@colcaaventuras.com";

const MSG_BY_LANG = {
  es: "Hola Colca Aventuras, quiero reservar el tour Laguna de Salinas 4x4.",
  en: "Hi Colca Aventuras, I'd like to book the Salinas Lagoon 4x4 tour.",
  fr: "Bonjour Colca Aventuras, je souhaite réserver le tour Lagune de Salinas en 4x4.",
  de: "Hallo Colca Aventuras, ich möchte die Salinas-Lagune-4x4-Tour buchen."
};

const I18N = {
  es: { slide: n => `Ir a la diapositiva ${n}`, pause: "Pausar carrusel", resume: "Reanudar carrusel" },
  en: { slide: n => `Go to slide ${n}`, pause: "Pause carousel", resume: "Resume carousel" },
  fr: { slide: n => `Aller à la diapositive ${n}`, pause: "Mettre le carrousel en pause", resume: "Reprendre le carrousel" },
  de: { slide: n => `Zu Folie ${n}`, pause: "Karussell anhalten", resume: "Karussell fortsetzen" }
};

const lang = (document.documentElement.lang || "es").slice(0, 2);
const MSG = MSG_BY_LANG[lang] || MSG_BY_LANG.es;
const T = I18N[lang] || I18N.es;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== 0. BOTONES DE RESERVA =====
document.querySelectorAll("[data-wa]").forEach(a => {
  if (!WHATSAPP.includes("X")) {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MSG)}`;
    a.target = "_blank";
    a.rel = "noopener";
  } else {
    a.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Salinas 4x4")}&body=${encodeURIComponent(MSG)}`;
  }
});

// ===== 1. SELECTOR DE IDIOMA =====
(function () {
  const sw = document.querySelector(".lang-switcher");
  if (!sw) return;
  const btn = sw.querySelector(".lang-btn");
  const menu = sw.querySelector(".lang-menu");
  if (!btn || !menu) return;

  const close = () => { sw.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };

  btn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    const open = sw.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", e => { if (!sw.contains(e.target)) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  menu.querySelectorAll("a").forEach(l => l.addEventListener("click", close));
})();

// ===== 2. MENÚ MÓVIL =====
(function () {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  if (!burger || !menu) return;

  burger.addEventListener("click", e => {
    e.stopPropagation();
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  menu.addEventListener("click", e => {
    if (e.target.closest("a") && !e.target.closest(".lang-menu")) {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
})();

// ===== 3. HEADER AL HACER SCROLL =====
(function () {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const update = () => nav.classList.toggle("solid", window.scrollY > 40);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// ===== 4. CARRUSEL =====
(function () {
  const slides = [...document.querySelectorAll(".slide")];
  const dots = document.getElementById("dots");
  if (!slides.length || !dots) return;

  let i = 0, timer = null, paused = reduceMotion;

  slides.forEach((_, n) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", T.slide(n + 1));
    b.addEventListener("click", () => { go(n); play(); });
    dots.appendChild(b);
  });

  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle("active", k === i);
      s.setAttribute("aria-hidden", k !== i ? "true" : "false");
    });
    [...dots.children].forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false"));
  }
  function play() {
    clearInterval(timer);
    if (!paused) timer = setInterval(() => go(i + 1), 5500);
  }

  const pauseBtn = document.getElementById("pause");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const setPauseUI = () => {
    if (!pauseBtn) return;
    pauseBtn.textContent = paused ? "▶" : "❚❚";
    pauseBtn.setAttribute("aria-label", paused ? T.resume : T.pause);
  };

  if (prevBtn) prevBtn.addEventListener("click", () => { go(i - 1); play(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { go(i + 1); play(); });
  if (pauseBtn) pauseBtn.addEventListener("click", () => { paused = !paused; setPauseUI(); play(); });

  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("mouseenter", () => clearInterval(timer));
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", () => clearInterval(timer));
    hero.addEventListener("focusout", play);
    hero.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { go(i - 1); play(); }
      if (e.key === "ArrowRight") { go(i + 1); play(); }
    });
  }

  go(0);
  setPauseUI();
  play();
})();

// ===== 5. APARICIÓN SUAVE (REVEAL) =====
(function () {
  const els = document.querySelectorAll(".reveal");
  const showAll = () => els.forEach(e => e.classList.add("in"));

  if (reduceMotion || !("IntersectionObserver" in window)) { showAll(); return; }

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  els.forEach(e => io.observe(e));
})();