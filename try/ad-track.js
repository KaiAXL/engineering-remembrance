/* Archive Detective play tracking (GoatCounter events).
   Counts anonymous milestones only: level started, round reached, wrong tries,
   hints, case closed, certificate saved, play again. Never sends names, answers
   typed, or anything personal. Works alongside try.js without touching it. */
(function () {
  var sent = {};
  var level = 'unknown';
  var round = 'intro';

  function send(path, once) {
    if (once) { if (sent[path]) return; sent[path] = 1; }
    var go = function () {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: 'ad/' + path, title: 'Archive Detective', event: true });
        return true;
      }
      return false;
    };
    if (!go()) { var n = 0, t = setInterval(function () { if (go() || ++n > 20) clearInterval(t); }, 500); }
  }

  function levelName(v) { return v === 'beginner' ? 'first-timer' : (v || 'unknown'); }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target : null;
    if (!el) return;
    var b = el.closest('[data-launch]');
    if (b) { level = levelName(b.getAttribute('data-launch')); round = 'intro'; send('start/' + level, true); return; }
    var r = el.closest('[data-launch-restart]');
    if (r) { level = levelName(r.getAttribute('data-launch-restart')); round = 'intro'; sent = {}; send('restart/' + level, false); return; }
    if (el.closest('[data-hintbtn]')) { send('hint/' + level + '/' + round, false); return; }
    if (el.closest('[data-again]')) { send('again/' + level, false); return; }
    if (el.closest('[data-bonus-files]')) { send('bonus/' + level, true); return; }
  }, true);

  document.addEventListener('submit', function (e) {
    if (e.target && e.target.matches && e.target.matches('[data-cert]')) send('certificate/' + level, true);
  }, true);

  function watch() {
    var game = document.getElementById('game');
    if (!game || !window.MutationObserver) return;
    var tried = typeof WeakSet === 'function' ? new WeakSet() : null;
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        var t = m.target;
        if (m.attributeName === 'data-round' && t.getAttribute('data-round') != null) {
          var slug = String(t.getAttribute('data-round')).split(':')[0].replace(/[^a-z0-9-]/gi, '').slice(0, 40);
          if (slug && slug !== round) { round = slug; send('round/' + level + '/' + round, true); }
        } else if (m.attributeName === 'data-view' && t === game) {
          var v = game.getAttribute('data-view');
          if (v === 'final') send('closed/' + level, true);
        } else if (m.attributeName === 'class' && t.classList &&
                   (t.classList.contains('tried') || t.classList.contains('miss'))) {
          if (tried && tried.has(t)) return;
          if (tried) tried.add(t);
          send('wrong/' + level + '/' + round, false);
        }
      });
    }).observe(game, { attributes: true, subtree: true, attributeFilter: ['data-view', 'data-round', 'class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
