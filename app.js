// ============================================================================
// Bang Times — Complete Application Logic (app.js)
// ============================================================================

// ١. ڕێگریکردن لە زوومبوونی شاشە لەسەر مۆبایل و ڕێگەدان بە سکرۆڵ لە کاتی پێویستدا
document.addEventListener('touchmove', function (e) {
  if (e.touches.length > 1) {
    e.preventDefault();
    return;
  }
  const needsScroll = document.documentElement.scrollHeight > window.innerHeight;
  if (!needsScroll && !e.target.closest('.menu-dropdown-panel')) {
    e.preventDefault();
  }
}, { passive: false });

// ٢. جێگیرکردنی دەمژمێر لەسەر کاتی فەرمیی کوردستان (UTC+3 / Asia/Baghdad)
function getKurdistanDate() {
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcMs + (3 * 3600000));
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toKurdishDigits(str) {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/\d/g, (d) => map[Number(d)]);
}

// ============================================================================
// ٣. دروستکردنی تەونی جاڵجاڵۆکەی باکگراوند (Background Spiderweb)
// ============================================================================
(function buildBackgroundSpiderweb() {
  const baseGroup = document.getElementById('bg-web-base');
  const glowGroup = document.getElementById('bg-web-glow');
  if (!baseGroup || !glowGroup) return;

  const NS = 'http://www.w3.org/2000/svg';
  const cx = 500;
  const cy = 300;
  const spokes = 16;
  const rings = 14;
  const maxR = 1350;

  const angles = [];
  for (let i = 0; i < spokes; i++) {
    angles.push((i * 2 * Math.PI) / spokes);
  }

  angles.forEach((ang) => {
    const x2 = cx + Math.cos(ang) * maxR;
    const y2 = cy + Math.sin(ang) * maxR;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', x2.toFixed(1));
    line.setAttribute('y2', y2.toFixed(1));
    baseGroup.appendChild(line);
  });

  const glowPaths = [];
  for (let r = 1; r <= rings; r++) {
    const radius = 55 * Math.pow(r, 1.18);
    let d = '';

    for (let i = 0; i < spokes; i++) {
      const a1 = angles[i];
      const a2 = angles[(i + 1) % spokes];
      const midA = (a1 + a2) / 2 + (i === spokes - 1 ? Math.PI : 0);

      const x1 = cx + Math.cos(a1) * radius;
      const y1 = cy + Math.sin(a1) * radius;
      const x2 = cx + Math.cos(a2) * radius;
      const y2 = cy + Math.sin(a2) * radius;

      const sagRadius = radius * 0.93;
      const qx = cx + Math.cos(midA) * sagRadius;
      const qy = cy + Math.sin(midA) * sagRadius;

      if (i === 0) {
        d += `M ${x1.toFixed(1)} ${y1.toFixed(1)} `;
      }
      d += `Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
    }

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    baseGroup.appendChild(path);

    if (r % 2 === 0 && r <= 10) {
      const glowPath = document.createElementNS(NS, 'path');
      glowPath.setAttribute('d', d);
      glowPath.setAttribute('stroke-dasharray', '140 900');
      glowPath.setAttribute('stroke-dashoffset', String(r * 110));
      glowGroup.appendChild(glowPath);
      glowPaths.push(glowPath);
    }
  }

  if (window.gsap && glowPaths.length) {
    glowPaths.forEach((p, idx) => {
      gsap.to(p, {
        strokeDashoffset: `-=${1040}`,
        duration: 18 + idx * 4,
        repeat: -1,
        ease: 'none'
      });
    });
  }
})();

// ============================================================================
// ٤. دروستکردنی چەرخ و ژمارەکانی دەمژمێری ئەنالۆگ (Gears & Numerals)
// ============================================================================
(function buildClockDial() {
  const gearsGroup = document.getElementById('gears');
  const numeralsGroup = document.getElementById('numerals');
  const NS = 'http://www.w3.org/2000/svg';

  if (gearsGroup) {
    const gearSpecs = [
      { cx: -46, cy: -42, r: 28, teeth: 14, dur: 36, dir: 1 },
      { cx: 52,  cy: -36, r: 24, teeth: 12, dur: 28, dir: -1 },
      { cx: -38, cy: 48,  r: 22, teeth: 12, dur: 32, dir: -1 },
      { cx: 46,  cy: 44,  r: 26, teeth: 14, dur: 40, dir: 1 }
    ];

    gearSpecs.forEach((spec) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${spec.cx}, ${spec.cy})`);

      const inner = document.createElementNS(NS, 'g');

      const ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('r', String(spec.r));
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', 'rgba(212, 155, 67, 0.16)');
      ring.setAttribute('stroke-width', '3.5');
      ring.setAttribute('stroke-dasharray', '3.2 4.2');
      inner.appendChild(ring);

      const hub = document.createElementNS(NS, 'circle');
      hub.setAttribute('r', String(spec.r * 0.42));
      hub.setAttribute('fill', 'none');
      hub.setAttribute('stroke', 'rgba(246, 230, 193, 0.12)');
      hub.setAttribute('stroke-width', '1.2');
      inner.appendChild(hub);

      for (let s = 0; s < 4; s++) {
        const ang = (s * Math.PI) / 2;
        const spoke = document.createElementNS(NS, 'line');
        spoke.setAttribute('x1', '0');
        spoke.setAttribute('y1', '0');
        spoke.setAttribute('x2', (Math.cos(ang) * spec.r * 0.9).toFixed(1));
        spoke.setAttribute('y2', (Math.sin(ang) * spec.r * 0.9).toFixed(1));
        spoke.setAttribute('stroke', 'rgba(246, 230, 193, 0.11)');
        spoke.setAttribute('stroke-width', '1.1');
        inner.appendChild(spoke);
      }

      g.appendChild(inner);
      gearsGroup.appendChild(g);

      if (window.gsap) {
        gsap.to(inner, {
          rotation: 360 * spec.dir,
          svgOrigin: '0 0',
          duration: spec.dur,
          repeat: -1,
          ease: 'none'
        });
      }
    });
  }

  if (numeralsGroup) {
    const radius = 192;
    for (let n = 1; n <= 12; n++) {
      const angleDeg = n * 30 - 90;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius;

      const txt = document.createElementNS(NS, 'text');
      txt.setAttribute('x', x.toFixed(1));
      txt.setAttribute('y', y.toFixed(1));
      txt.setAttribute('font-size', n % 3 === 0 ? '40' : '32');
      txt.textContent = String(n);
      numeralsGroup.appendChild(txt);
    }
  }
})();

// ============================================================================
// ٥. جووڵاندنی میلەکانی دەمژمێر بە شێوەیەکی نەرم و دروست (Analog Hands)
// ============================================================================
const hourEl = document.getElementById('hour');
const minEl  = document.getElementById('min');
const secEl  = document.getElementById('sec');

function forwardOf(el, target) {
  const now = window.gsap ? Number(gsap.getProperty(el, 'rotation')) || 0 : (el._rot || 0);
  const lifted = target + 360 * Math.round((now - target) / 360);
  return lifted < now - 0.1 ? lifted + 360 : lifted;
}

function rotateHand(el, deg, dur, ease) {
  if (!el) return;
  const nextDeg = forwardOf(el, deg);
  el._rot = nextDeg;
  if (window.gsap) {
    gsap.to(el, {
      rotation: nextDeg,
      svgOrigin: '0 0',
      duration: dur,
      ease: ease,
      overwrite: 'auto'
    });
  } else {
    el.setAttribute('transform', `rotate(${nextDeg})`);
  }
}

// ============================================================================
// ٦. سیستەمی ئەزکارەکانی بەیانیان و ئێواران و بەرواری کۆچی
// ============================================================================
const MORNING_AZKAR = [
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ : عَدَدَ خَلْقِهِ ، وَرِضَا نَفْسِهِ ، وَزِنَةَ عَرْشِهِ ، وَمِدَادَ كَلِمَاتِهِ",
  "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ",
  "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
  "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
  "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
  "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
];

const EVENING_AZKAR = [
  "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
  "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
  "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ",
  "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
];

const KU_WEEKDAYS = [
  "ئێکشەمب",
  "دووشەمب",
  "سێشەمب",
  "چارشەمب",
  "پێنجشەمب",
  "هەینی",
  "شەمب"
];

const HIJRI_MONTHS_KU = [
  "موحەڕەم",
  "سەفەر",
  "ڕەبیعولئەووەل",
  "ڕەبیعولئاخیر",
  "جومادەلئوولا",
  "جومادەلئاخیرە",
  "ڕەجەب",
  "شەعبان",
  "ڕەمەزان",
  "شەووآل",
  "زولقەعدە",
  "زولحیججە"
];

function getKurdishHijriString(dateObj) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = fmt.formatToParts(dateObj);
    let d = '1', m = '1', y = '1447';
    parts.forEach((p) => {
      if (p.type === 'day') d = p.value;
      if (p.type === 'month') m = p.value;
      if (p.type === 'year') y = p.value.replace(/\D/g, '');
    });
    const monthName = HIJRI_MONTHS_KU[Math.max(0, Math.min(11, Number(m) - 1))];
    return `${toKurdishDigits(d)}ی ${monthName} ${toKurdishDigits(y)} کۆچی`;
  } catch (e) {
    return "١٤٤٧ کۆچی";
  }
}

let isMorningMode = null;
let currentIdx = 0;
let azkarTimer = null;
const AZKAR_DURATION = 9;

function getActiveAzkarList() {
  return isMorningMode === false ? EVENING_AZKAR : MORNING_AZKAR;
}

function animateProgress() {
  const bar = document.getElementById('azkar-progress-bar');
  if (azkarTimer) clearTimeout(azkarTimer);

  if (window.gsap && bar) {
    gsap.killTweensOf(bar);
    gsap.fromTo(bar,
      { width: '0%' },
      {
        width: '100%',
        duration: AZKAR_DURATION,
        ease: 'none',
        onComplete: nextZikr
      }
    );
  } else {
    azkarTimer = setTimeout(nextZikr, AZKAR_DURATION * 1000);
  }
}

function nextZikr() {
  const list = getActiveAzkarList();
  currentIdx = (currentIdx + 1) % list.length;
  const zikrArabic = list[currentIdx];

  const textEl = document.getElementById('azkar-text');
  const orbEl  = document.querySelector('.azkar-glow-orb');

  if (window.gsap && textEl) {
    gsap.killTweensOf([textEl, orbEl]);

    if (orbEl) {
      gsap.fromTo(orbEl,
        { scale: 0.8, opacity: 0.3 },
        { scale: 1.3, opacity: 0.85, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }
      );
    }

    const tl = gsap.timeline();
    tl.to(textEl, {
      opacity: 0,
      y: -10,
      scale: 0.96,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        textEl.textContent = zikrArabic;
        textEl.classList.toggle('is-long', zikrArabic.length > 52);
      }
    })
    .fromTo(textEl,
      { opacity: 0, y: 10, scale: 1.03 },
      { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.4)', immediateRender: false }
    );
  } else if (textEl) {
    textEl.textContent = zikrArabic;
    textEl.classList.toggle('is-long', zikrArabic.length > 52);
  }

  animateProgress();
}

// ============================================================================
// ٧. مینیۆی هەڵبژاردنی شارەکان و سیستەمی کاتەکانی بانگ
// ============================================================================
let currentCityKey = localStorage.getItem('selected_prayer_city') || 'duhok';
if (!window.PRAYER_CITIES || !window.PRAYER_CITIES[currentCityKey]) {
  currentCityKey = 'duhok';
}

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const menuDropdown  = document.getElementById('corner-menu-dropdown');
const citySelectEl  = document.getElementById('city-select');

let collapseSoundSection = null;

if (menuToggleBtn && menuDropdown) {
  menuToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuDropdown.classList.toggle('open');
    menuToggleBtn.classList.toggle('active', isOpen);
    menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen && typeof collapseSoundSection === 'function') {
      collapseSoundSection();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.corner-menu-wrapper')) {
      menuDropdown.classList.remove('open');
      menuToggleBtn.classList.remove('active');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
      if (typeof collapseSoundSection === 'function') {
        collapseSoundSection();
      }
    }
  });
}

if (citySelectEl) {
  citySelectEl.value = currentCityKey;

  const customWrap = document.createElement('div');
  customWrap.className = 'custom-city-select';

  const triggerBtn = document.createElement('button');
  triggerBtn.type = 'button';
  triggerBtn.className = 'custom-city-trigger';

  const triggerText = document.createElement('span');
  const triggerArrow = document.createElement('span');
  triggerArrow.className = 'custom-city-arrow';
  triggerArrow.textContent = '▼';

  triggerBtn.appendChild(triggerText);
  triggerBtn.appendChild(triggerArrow);

  const listContainer = document.createElement('div');
  listContainer.className = 'custom-city-list';

  function renderCustomOptions() {
    listContainer.innerHTML = '';
    Array.from(citySelectEl.options).forEach((opt) => {
      if (opt.value === currentCityKey) {
        triggerText.textContent = opt.textContent;
      }

      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'custom-city-option' + (opt.value === currentCityKey ? ' selected' : '');

      const contentDiv = document.createElement('div');
      contentDiv.className = 'option-content';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = opt.textContent;
      contentDiv.appendChild(nameSpan);

      const checkSpan = document.createElement('span');
      checkSpan.className = 'custom-city-check';
      checkSpan.textContent = '✓';

      itemBtn.appendChild(contentDiv);
      itemBtn.appendChild(checkSpan);

      itemBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        currentCityKey = opt.value;
        citySelectEl.value = currentCityKey;
        localStorage.setItem('selected_prayer_city', currentCityKey);
        renderCustomOptions();
        customWrap.classList.remove('open');
        updatePrayerDashboard(getKurdistanDate());

        if (menuDropdown && menuToggleBtn) {
          menuDropdown.classList.remove('open');
          menuToggleBtn.classList.remove('active');
          menuToggleBtn.setAttribute('aria-expanded', 'false');
        }
      });

      listContainer.appendChild(itemBtn);
    });
  }

  triggerBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    customWrap.classList.toggle('open');
  });

  renderCustomOptions();
  customWrap.appendChild(triggerBtn);
  customWrap.appendChild(listContainer);
  citySelectEl.parentNode.insertBefore(customWrap, citySelectEl.nextSibling);
}

// ============================================================================
// ٧.١ سیستەمی هەڵبژاردنی دەنگی بانگ و تاقیکردنەوەی دەنگ (Play / Stop SVG)
// ============================================================================
const PLAY_SVG_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l11-6.86a1 1 0 0 0 0-1.66l-11-6.86A1 1 0 0 0 8 5.14z"></path>
  </svg>
`;

const STOP_SVG_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2.2"></rect>
  </svg>
`;

const DEFAULT_SOUNDS = [
  { id: "mute",   nameKu: "١- بێ دەنگ", src: "" },
  { id: "athan1", nameKu: "٢- دەنگێ على ابراهيم رسول پور", src: "./athan1.mp3" },
  { id: "athan2", nameKu: "٣- دەنگێ عبدالمجيد السريحي", src: "./athan2.mp3" },
  { id: "athan3", nameKu: "٤- دەنگێ بيشوا قادر الكردي", src: "./athan3.mp3" },
  { id: "athan4", nameKu: "٥- دەنگێ رعد الكوردي", src: "./athan4.mp3" },
  { id: "athan5", nameKu: "٦- دەنگێ اسلام صبحي", src: "./athan5.mp3" }
];

const SOUND_LIST = (window.ATHAN_SOUNDS && window.ATHAN_SOUNDS.length)
  ? window.ATHAN_SOUNDS
  : DEFAULT_SOUNDS;

let currentSoundId = localStorage.getItem('selected_athan_sound') || 'mute';
if (!SOUND_LIST.some((s) => s.id === currentSoundId)) {
  currentSoundId = 'mute';
}

let enabledAthanPrayers = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true
};

try {
  const savedPrayers = JSON.parse(localStorage.getItem('enabled_athan_prayers'));
  if (savedPrayers && typeof savedPrayers === 'object') {
    enabledAthanPrayers = { ...enabledAthanPrayers, ...savedPrayers };
  }
} catch (e) {}

const athanAudio = new Audio();
athanAudio.preload = 'none';

const previewAudio = new Audio();
previewAudio.preload = 'none';
let activePreviewSoundId = null;
let lastPlayedAthanKey = '';

function stopAthanAudio() {
  try {
    athanAudio.pause();
    athanAudio.currentTime = 0;
  } catch (e) {}
}

function updatePreviewButtonsUI() {
  const buttons = document.querySelectorAll('.sound-preview-btn');
  buttons.forEach((btn) => {
    const sndId = btn.getAttribute('data-sound-id');
    const isPlaying = (activePreviewSoundId === sndId);
    btn.classList.toggle('playing', isPlaying);
    btn.innerHTML = isPlaying ? STOP_SVG_ICON : PLAY_SVG_ICON;
  });
}

function stopPreviewAudio() {
  try {
    previewAudio.pause();
    previewAudio.currentTime = 0;
  } catch (e) {}
  activePreviewSoundId = null;
  updatePreviewButtonsUI();
}

previewAudio.addEventListener('ended', () => {
  activePreviewSoundId = null;
  updatePreviewButtonsUI();
});

const soundContainer      = document.getElementById('custom-sound-container');
const athanPrayersWrapper = document.getElementById('athan-prayers-wrapper');
const athanPrayersListEl  = document.getElementById('athan-prayers-list');

if (soundContainer) {
  const soundWrap = document.createElement('div');
  soundWrap.className = 'custom-city-select';

  const sTriggerBtn = document.createElement('button');
  sTriggerBtn.type = 'button';
  sTriggerBtn.className = 'custom-city-trigger';

  const sTriggerText = document.createElement('span');
  const sTriggerArrow = document.createElement('span');
  sTriggerArrow.className = 'custom-city-arrow';
  sTriggerArrow.textContent = '▼';

  sTriggerBtn.appendChild(sTriggerText);
  sTriggerBtn.appendChild(sTriggerArrow);

  const sListContainer = document.createElement('div');
  sListContainer.className = 'custom-city-list';

  collapseSoundSection = function () {
    stopPreviewAudio();
    soundWrap.classList.remove('open');
    if (athanPrayersWrapper) {
      athanPrayersWrapper.classList.remove('visible');
    }
  };

  function renderPrayerToggles() {
    if (!athanPrayersWrapper || !athanPrayersListEl) return;

    const isExpanded = soundWrap.classList.contains('open');
    if (currentSoundId === 'mute' || !isExpanded) {
      athanPrayersWrapper.classList.remove('visible');
      return;
    }

    athanPrayersWrapper.classList.add('visible');
    athanPrayersListEl.innerHTML = '';

    const prayersList = [
      { id: 'fajr',    label: 'بانگێ سپێدێ' },
      { id: 'dhuhr',   label: 'بانگێ نیڤرۆ' },
      { id: 'asr',     label: 'بانگێ ئێڤاری' },
      { id: 'maghrib', label: 'بانگێ مەغرەب' },
      { id: 'isha',    label: 'بانگێ عەیشا' }
    ];

    prayersList.forEach((p) => {
      const isEnabled = !!enabledAthanPrayers[p.id];
      const pBtn = document.createElement('button');
      pBtn.type = 'button';
      pBtn.className = 'custom-city-option' + (isEnabled ? ' selected' : '');

      const contentDiv = document.createElement('div');
      contentDiv.className = 'option-content';

      const pName = document.createElement('span');
      pName.textContent = p.label;
      contentDiv.appendChild(pName);

      const pCheck = document.createElement('span');
      pCheck.className = 'custom-city-check';
      pCheck.textContent = '✓';

      pBtn.appendChild(contentDiv);
      pBtn.appendChild(pCheck);

      pBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        enabledAthanPrayers[p.id] = !enabledAthanPrayers[p.id];
        localStorage.setItem('enabled_athan_prayers', JSON.stringify(enabledAthanPrayers));
        renderPrayerToggles();
      });

      athanPrayersListEl.appendChild(pBtn);
    });
  }

  function renderSoundOptions() {
    sListContainer.innerHTML = '';
    SOUND_LIST.forEach((snd) => {
      if (snd.id === currentSoundId) {
        sTriggerText.textContent = snd.nameKu;
      }

      // بەکارهێنانی div لەجیاتی button بۆ ڕیزەکە تا دوگمەی Play لەناویدا ١٠٠٪ کار بکات
      const itemRow = document.createElement('div');
      itemRow.className = 'custom-city-option' + (snd.id === currentSoundId ? ' selected' : '');
      itemRow.setAttribute('role', 'option');
      itemRow.setAttribute('aria-selected', String(snd.id === currentSoundId));

      const contentDiv = document.createElement('div');
      contentDiv.className = 'option-content';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = snd.nameKu;
      contentDiv.appendChild(nameSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'option-actions';

      // دوگمەی زێڕینی Play / Stop بە ئایکۆنی SVG لە تەنیشت نیشانەی (✓)
      if (snd.src) {
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'sound-preview-btn' + (activePreviewSoundId === snd.id ? ' playing' : '');
        previewBtn.setAttribute('data-sound-id', snd.id);
        previewBtn.setAttribute('aria-label', 'گوێگرتن لە دەنگی بانگ');
        previewBtn.innerHTML = (activePreviewSoundId === snd.id) ? STOP_SVG_ICON : PLAY_SVG_ICON;

        previewBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          ev.preventDefault();

          if (activePreviewSoundId === snd.id) {
            stopPreviewAudio();
          } else {
            stopAthanAudio();
            try {
              previewAudio.pause();
            } catch (e) {}

            activePreviewSoundId = snd.id;
            updatePreviewButtonsUI();

            previewAudio.src = snd.src;
            const playPromise = previewAudio.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.warn('Preview audio play failed:', err);
                activePreviewSoundId = null;
                updatePreviewButtonsUI();
              });
            }
          }
        });

        actionsDiv.appendChild(previewBtn);
      }

      const checkSpan = document.createElement('span');
      checkSpan.className = 'custom-city-check';
      checkSpan.textContent = '✓';
      actionsDiv.appendChild(checkSpan);

      itemRow.appendChild(contentDiv);
      itemRow.appendChild(actionsDiv);

      itemRow.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (ev.target.closest('.sound-preview-btn')) return;

        currentSoundId = snd.id;
        localStorage.setItem('selected_athan_sound', currentSoundId);

        if (currentSoundId === 'mute') {
          stopAthanAudio();
          stopPreviewAudio();
          soundWrap.classList.remove('open');
        } else {
          soundWrap.classList.add('open');
        }

        renderSoundOptions();
        renderPrayerToggles();
      });

      sListContainer.appendChild(itemRow);
    });
  }

  // کردنەوە و مینیمایزکردنی هاوکاتی لیستی دەنگەکان و کاتی بانگەکان بەیەکەوە
  sTriggerBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const isNowOpen = soundWrap.classList.toggle('open');
    if (!isNowOpen) {
      stopPreviewAudio();
    }
    renderSoundOptions();
    renderPrayerToggles();
  });

  renderSoundOptions();
  renderPrayerToggles();
  soundWrap.appendChild(sTriggerBtn);
  soundWrap.appendChild(sListContainer);
  soundContainer.appendChild(soundWrap);
}

const PRAYER_META = [
  { id: 'fajr',    name: 'سپێدێ',  cellId: 'cell-fajr',    isPM: false },
  { id: 'dhuhr',   name: 'نیڤرۆ',  cellId: 'cell-dhuhr',   isPM: false },
  { id: 'asr',     name: 'ئێڤاری', cellId: 'cell-asr',     isPM: true  },
  { id: 'maghrib', name: 'مەغرەب', cellId: 'cell-maghrib', isPM: true  },
  { id: 'isha',    name: 'عەیشا',  cellId: 'cell-isha',    isPM: true  }
];

function getActiveCityObject() {
  const cities = window.PRAYER_CITIES || {};
  return cities[currentCityKey] || cities['duhok'] || Object.values(cities)[0] || null;
}

function getDayPrayers(dateObj) {
  const cityObj = getActiveCityObject();
  if (!cityObj || !cityObj.timetable) {
    return ["05:00", "12:15", "03:30", "06:00", "07:15"];
  }
  const mStr = pad2(dateObj.getMonth() + 1);
  const dStr = pad2(dateObj.getDate());
  const key = `${mStr}-${dStr}`;
  return cityObj.timetable[key] || cityObj.timetable["01-01"] || ["05:00", "12:15", "03:30", "06:00", "07:15"];
}

function prayerTimeToSeconds(timeStr, isPM) {
  const [rawH, rawM] = timeStr.split(':').map(Number);
  let h24 = rawH;
  if ((isPM && rawH < 12) || rawH === 1) {
    h24 += 12;
  }
  return h24 * 3600 + rawM * 60;
}

function formatDuration(totalSec) {
  const safe = Math.max(0, Math.floor(totalSec));
  const hh = Math.floor(safe / 3600);
  const mm = Math.floor((safe % 3600) / 60);
  const ss = safe % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

// ============================================================================
// ٨. نوێکردنەوەی داشبۆردی کاتەکانی بانگ و ژماردنی پاشەکشە (Countdown)
// ============================================================================
function updatePrayerDashboard(now) {
  const cityObj = getActiveCityObject();
  const mStr = pad2(now.getMonth() + 1);
  const dStr = pad2(now.getDate());

  const weekdayEl = document.getElementById('weekday-display');
  const hijriEl   = document.getElementById('hijri-display');
  if (weekdayEl) weekdayEl.textContent = KU_WEEKDAYS[now.getDay()];
  if (hijriEl)   hijriEl.textContent   = getKurdishHijriString(now);

  const monthTitleEl = document.getElementById('month-title');
  if (monthTitleEl && cityObj) {
    monthTitleEl.textContent = cityObj.titlePrefix;
  }

  const dateBadgeEl = document.getElementById('today-date-badge');
  if (dateBadgeEl) {
    dateBadgeEl.textContent = `${mStr}/${dStr}`;
  }

  const todayTimes = getDayPrayers(now);
  PRAYER_META.forEach((p, idx) => {
    const cell = document.getElementById(p.cellId);
    if (!cell) return;
    cell.classList.remove('active-next', 'calling-now');
    const span = cell.querySelector('.p-time');
    if (span) span.textContent = todayTimes[idx];
  });

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const fajrSec = prayerTimeToSeconds(todayTimes[0], false);
  const asrSec  = prayerTimeToSeconds(todayTimes[2], true);

  const shouldBeMorning = (nowSec >= fajrSec && nowSec < asrSec);
  const azkarBadgeEl = document.querySelector('.azkar-badge');

  if (shouldBeMorning !== isMorningMode) {
    const isFirstRun = (isMorningMode === null);
    isMorningMode = shouldBeMorning;
    if (azkarBadgeEl) {
      azkarBadgeEl.textContent = isMorningMode ? "✦ أَذْكَارُ الصَّبَاحِ ✦" : "✦ أَذْكَارُ الْمَسَاءِ ✦";
    }
    if (isFirstRun) {
      currentIdx = 0;
      const textEl = document.getElementById('azkar-text');
      if (textEl) {
        const firstZikr = getActiveAzkarList()[0];
        textEl.textContent = firstZikr;
        textEl.classList.toggle('is-long', firstZikr.length > 52);
      }
      animateProgress();
    } else {
      currentIdx = -1;
      nextZikr();
    }
  }

  const statusBox   = document.getElementById('prayer-status-box');
  const statusTitle = document.getElementById('status-title');
  const statusMain  = document.getElementById('status-main');
  const timerEl     = document.getElementById('countdown-timer');
  const nextLabelEl = document.getElementById('next-prayer-label');

  let activeCallingIndex = -1;
  for (let i = 0; i < PRAYER_META.length; i++) {
    const pSec = prayerTimeToSeconds(todayTimes[i], PRAYER_META[i].isPM);
    if (nowSec >= pSec && (nowSec - pSec) <= 59) {
      activeCallingIndex = i;
      break;
    }
  }

  if (activeCallingIndex !== -1) {
    const currentPrayer = PRAYER_META[activeCallingIndex];
    const pSec = prayerTimeToSeconds(todayTimes[activeCallingIndex], currentPrayer.isPM);
    const remain59 = 59 - (nowSec - pSec);

    if (statusBox) statusBox.classList.add('athan-now');
    if (statusMain) statusMain.setAttribute('dir', 'rtl');
    if (statusTitle) statusTitle.textContent = `بانگێ شاری ${cityObj ? cityObj.nameKu : 'دهۆک'} · (${remain59} چرکە)`;
    if (timerEl) timerEl.textContent         = `نوکە دەمێ بانگێ ${currentPrayer.name} یە`;
    if (nextLabelEl) nextLabelEl.textContent = `کاتی بانگ: ${todayTimes[activeCallingIndex]}`;

    const activeCell = document.getElementById(currentPrayer.cellId);
    if (activeCell) activeCell.classList.add('calling-now');

    const athanKey = `${mStr}-${dStr}-${currentPrayer.id}`;
    if (
      currentSoundId !== 'mute' &&
      enabledAthanPrayers[currentPrayer.id] &&
      lastPlayedAthanKey !== athanKey
    ) {
      const selectedSoundObj = SOUND_LIST.find((s) => s.id === currentSoundId);
      if (selectedSoundObj && selectedSoundObj.src) {
        stopPreviewAudio();
        lastPlayedAthanKey = athanKey;
        athanAudio.src = selectedSoundObj.src;
        athanAudio.play().catch(() => {});
      }
    }

    return;
  }

  if (statusBox) statusBox.classList.remove('athan-now');
  if (statusMain) statusMain.setAttribute('dir', 'ltr');

  let nextIdx = -1;
  let targetSec = 0;

  for (let i = 0; i < PRAYER_META.length; i++) {
    const pSec = prayerTimeToSeconds(todayTimes[i], PRAYER_META[i].isPM);
    if (pSec > nowSec) {
      nextIdx = i;
      targetSec = pSec;
      break;
    }
  }

  let nextPrayerObj;
  let nextPrayerTimeStr;
  let diffSeconds;

  if (nextIdx !== -1) {
    nextPrayerObj     = PRAYER_META[nextIdx];
    nextPrayerTimeStr = todayTimes[nextIdx];
    diffSeconds       = targetSec - nowSec;
    const nextCell = document.getElementById(nextPrayerObj.cellId);
    if (nextCell) nextCell.classList.add('active-next');
  } else {
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowTimes = getDayPrayers(tomorrow);
    nextPrayerObj     = PRAYER_META[0];
    nextPrayerTimeStr = tomorrowTimes[0];
    const fajrTomorrowSec = prayerTimeToSeconds(nextPrayerTimeStr, false);
    diffSeconds = (86400 - nowSec) + fajrTomorrowSec;

    const fajrCell = document.getElementById(nextPrayerObj.cellId);
    if (fajrCell) {
      fajrCell.classList.add('active-next');
      const timeSpan = fajrCell.querySelector('.p-time');
      if (timeSpan) timeSpan.textContent = nextPrayerTimeStr;
    }
  }

  if (statusTitle) statusTitle.textContent = "دەمێ مایی بۆ بانگێ داهاتوو";
  if (timerEl)     timerEl.textContent     = formatDuration(diffSeconds);
  if (nextLabelEl) nextLabelEl.textContent = `بانگێ داهاتوو: ${nextPrayerObj.name} (${nextPrayerTimeStr})`;
}

// ============================================================================
// ٩. خولی چرکەیی دەمژمێر (Main Clock Tick)
// ============================================================================
function tick() {
  const now = getKurdistanDate();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const secDeg  = s * 6;
  const minDeg  = m * 6 + s * 0.1;
  const hourDeg = (h % 12) * 30 + m * 0.5;

  rotateHand(secEl,  secDeg,  0.42, 'elastic.out(1, 0.55)');
  rotateHand(minEl,  minDeg,  0.5,  'power2.out');
  rotateHand(hourEl, hourDeg, 0.6,  'power2.out');

  const dayNumEl = document.getElementById('analog-day-number');
  if (dayNumEl) {
    dayNumEl.textContent = pad2(now.getDate());
  }

  const readoutEl = document.getElementById('readout');
  if (readoutEl) {
    const h12 = h % 12 || 12;
    readoutEl.textContent = `${pad2(h12)}:${pad2(m)}:${pad2(s)}`;
  }

  updatePrayerDashboard(now);
}

tick();
setInterval(tick, 1000);

// ============================================================================
// ١٠. تۆمارکردنی Service Worker بۆ کارکردنی بێ ئینتەرنێت (Offline PWA)
// ============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service Worker failed:', err);
    });
  });
}
