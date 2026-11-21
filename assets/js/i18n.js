/* KO / EN language toggle.
   Translations live in i18n-ko.js (English text → Korean).
   Load order: main.js → i18n-ko.js → i18n.js */
(() => {
  // On/off switch: false = button hidden, site always shows English. Set to true to turn it back on.
  const ENABLED = false;
  if (!ENABLED) return;

  const KO = window.I18N_KO || {};
  const TITLES = window.I18N_KO_TITLES || {};
  const STORE = 'skyyoo-lang';
  const SEL = 'p,h1,h2,h3,h4,li,a,figcaption,th,td,summary,small,b,strong,span,button,cite,em';
  const INLINE = new Set(['BR', 'EM', 'I', 'STRONG', 'B']);
  const KEEP = new Set(['svg', 'IMG']);
  const original = new Map(); // element → original innerHTML
  const enTitle = document.title;

  const norm = (s) => s.replace(/[ \t\r\n]+/g, ' ').replace(/ *\n */g, '\n').trim();

  // English key for an element: its text, <br> as "\n", ignoring svg/img
  function keyOf(el) {
    let out = '';
    for (const n of el.childNodes) {
      if (n.nodeType === 3) out += n.nodeValue;
      else if (n.nodeType === 1) {
        if (n.tagName === 'BR') out += '\u0000';
        else if (KEEP.has(n.tagName)) continue;
        else if (INLINE.has(n.tagName)) out += n.textContent;
        else return null; // has a block/complex child → not a leaf
      }
    }
    return norm(out).replace(/ ?\u0000 ?/g, '\n');
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const toHTML = (ko) => (/<em>/.test(ko) ? ko : esc(ko)).replace(/\n/g, '<br>');

  function toKorean() {
    document.querySelectorAll(SEL).forEach((el) => {
      if (!el.isConnected || original.has(el)) return;
      const key = keyOf(el);
      if (!key || !(key in KO)) return;
      const kept = [...el.children].filter((c) => KEEP.has(c.tagName));
      original.set(el, el.innerHTML);
      el.innerHTML = toHTML(KO[key]);
      kept.forEach((c) => { el.append(' ', c); });
    });
    document.title = TITLES[enTitle] || enTitle;
  }

  function toEnglish() {
    original.forEach((html, el) => { el.innerHTML = html; });
    original.clear();
    document.title = enTitle;
  }

  let current = 'en';
  function apply(lang) {
    lang === 'ko' ? toKorean() : toEnglish();
    // Typing headline (About) re-types in the new language
    if (lang !== current && window.typeOn) {
      document.querySelectorAll('.type-on[data-en]').forEach((el) => {
        window.typeOn(el, lang === 'ko' ? (KO[el.dataset.en] || el.dataset.en) : el.dataset.en);
      });
    }
    current = lang;
    document.documentElement.lang = lang;
    btn.setAttribute('aria-label', lang === 'ko' ? 'Switch to English' : '한국어로 보기');
    btn.dataset.lang = lang;
    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  // Toggle button: placed in the header's right side next to Resume
  const inner = document.querySelector('.site-header__inner');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lang-toggle';
  btn.innerHTML = '<span data-l="en">EN</span><span data-l="ko">KO</span>';
  if (inner) {
    const end = document.createElement('div');
    end.className = 'header-end';
    end.append(btn);
    ['.header-cta', '.menu-btn'].forEach((s) => { const n = inner.querySelector(s); if (n) end.append(n); });
    inner.append(end);
  }
  btn.addEventListener('click', () => apply(btn.dataset.lang === 'ko' ? 'en' : 'ko'));

  let saved = 'en';
  try { saved = localStorage.getItem(STORE) || 'en'; } catch (e) {}
  apply(saved === 'ko' ? 'ko' : 'en');
})();
