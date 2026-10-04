/* Tomo's Secret Library — shared lock + library button.
   Book N unlocks at 12:00 AM (reader's own clock) on October (2+N), 2026.
   Book 0 is always open. Preview on localhost with ?now=2026-10-05T08:00 */
(function () {
  var m = location.pathname.match(/book-(\d+)\.html$/);
  var day = m ? +m[1] : ((typeof BOOK !== 'undefined' && BOOK.day) || 0);
  window.TOMO_UNLOCK = function (d) { return new Date(2026, 9, 2 + d, 0, 0, 0); };
  window.TOMO_NOW = function () {
    var q = new URLSearchParams(location.search).get('now');
    if (q && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return new Date(q);
    return new Date();
  };
  window.TOMO_ALL = localStorage.getItem('tomoKey') === '1';
  /* Grown-up key: password is checked as a SHA-256 hash (case-insensitive). */
  window.TOMO_KEY = function () {
    if (TOMO_ALL) {
      if (confirm('All books are unlocked on this device. Lock them again?')) { localStorage.removeItem('tomoKey'); location.reload(); }
      return;
    }
    var p = prompt('🔑 Grown-ups only! Password:');
    if (!p) return;
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(p.trim().toLowerCase())).then(function (b) {
      var h = Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
      if (h === '611185778c79c649bbf7db7b33ca79e6e4983b5da64d5dfb6a0ddc4979d49a4a') { localStorage.setItem('tomoKey', '1'); location.reload(); }
      else alert('Pon shakes his head. Very slowly. (Wrong password!)');
    });
  };
  var unlock = TOMO_UNLOCK(day), locked = day > 0 && !TOMO_ALL && TOMO_NOW() < unlock;

  var css = document.createElement('style');
  css.textContent =
    '.tomo-lib{position:fixed;top:10px;left:10px;z-index:50;background:#2f2a26;color:#f2b134;' +
    'font:700 15px "Trebuchet MS",Verdana,sans-serif;text-decoration:none;padding:8px 14px;border-radius:999px;' +
    'box-shadow:3px 4px 0 rgba(0,0,0,.25)}body{padding-top:58px!important}' +
    'html.tomo-locked .book,html.tomo-locked .nav{display:none!important}' +
    '.tomo-lock{width:100%;max-width:620px;background:#fffaf0;border:5px solid #2f2a26;border-radius:24px;' +
    'box-shadow:12px 14px 0 rgba(0,0,0,.22);overflow:hidden;text-align:center;color:#2f2a26;font-family:"Trebuchet MS",Verdana,sans-serif}' +
    '.tomo-lock .pic{position:relative}.tomo-lock img{display:block;width:100%;filter:blur(7px) saturate(.8);transform:scale(1.08)}' +
    '.tomo-lock .padlock{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:96px;text-shadow:0 6px 18px rgba(0,0,0,.35)}' +
    '.tomo-lock .in{padding:20px 22px 26px}.tomo-lock h1{font-family:"Segoe Print","Comic Sans MS",cursive;font-size:1.7rem;margin:.2em 0}' +
    '.tomo-lock p{font-size:1.1rem;line-height:1.5;margin:.6em 0}.tomo-cd{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:14px 0}' +
    '.tomo-cd div{background:#2f2a26;color:#f2b134;border-radius:14px;padding:10px 12px;min-width:74px}' +
    '.tomo-cd b{display:block;font:700 2rem/1 "Segoe Print","Comic Sans MS",cursive}.tomo-cd small{font-size:.72rem;letter-spacing:.12em;color:#ffe9a8}' +
    '.tomo-lock a.go{display:inline-block;margin-top:8px;background:#e0452f;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;box-shadow:0 4px 0 #b32d1c}' +
    '@media print{.tomo-lib{display:none}body{padding-top:18px!important}}';
  document.head.appendChild(css);
  if (locked) document.documentElement.classList.add('tomo-locked');

  var nice = unlock.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  document.addEventListener('DOMContentLoaded', function () {
    var a = document.createElement('a');
    a.className = 'tomo-lib'; a.href = 'index.html'; a.textContent = '📚 Library';
    document.body.prepend(a);
    if (!locked) return;
    var cover = 'images/day-' + String(day).padStart(2, '0') + '-cover.jpg';
    var box = document.createElement('div');
    box.className = 'tomo-lock';
    box.innerHTML =
      '<div class="pic"><img src="' + cover + '" alt=""><div class="padlock">🔒</div></div>' +
      '<div class="in"><h1>Nice try, sneaky reader! 🙈</h1>' +
      '<p>Cousin Pon is guarding this book. It opens at <b>midnight</b> on <b>' + nice + '</b>.</p>' +
      '<div class="tomo-cd" id="tomo-cd"></div>' +
      '<p>Pon has not blinked in 400 years. He is not going to blink now.</p>' +
      '<a class="go" href="index.html">📚 Back to the Library</a>' +
      '<p><a href="#" onclick="TOMO_KEY();return false" style="font-size:.85rem;color:#6a5f54">🔑 Grown-ups</a></p></div>';
    document.body.insertBefore(box, document.getElementById('book'));
    var cd = document.getElementById('tomo-cd');
    (function tick() {
      var ms = unlock - TOMO_NOW();
      if (ms <= 0) { location.reload(); return; }
      var s = Math.floor(ms / 1000), u = [['DAYS', s / 86400], ['HOURS', s / 3600 % 24], ['MINUTES', s / 60 % 60], ['SECONDS', s % 60]];
      cd.innerHTML = u.map(function (x) { return '<div><b>' + Math.floor(x[1]) + '</b><small>' + x[0] + '</small></div>'; }).join('');
      setTimeout(tick, 1000);
    })();
  });
})();
