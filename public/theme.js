document.addEventListener('click', function(e){
  var b = e.target.closest('.themetoggle');
  if(!b) return;
  var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try{ localStorage.setItem('er-theme', next); }catch(err){}
  b.textContent = next === 'light' ? 'Dark mode' : 'Light mode';
});
document.addEventListener('DOMContentLoaded', function(){
  var b = document.querySelector('.themetoggle');
  if(b) b.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? 'Dark mode' : 'Light mode';
});

document.addEventListener('click', function(e){
  if(e.target.closest('.sidehide')){
    document.documentElement.setAttribute('data-side','off');
    try{ localStorage.setItem('er-side','off'); }catch(err){}
  }
  if(e.target.closest('.sidetoggle')){
    document.documentElement.setAttribute('data-side','on');
    try{ localStorage.setItem('er-side','on'); }catch(err){}
  }
});

document.addEventListener('click', function(e){
  var open = e.target.closest('[data-open]');
  if(open){ var d=document.getElementById(open.dataset.open); if(d&&d.showModal) d.showModal(); }
  if(e.target.closest('.hclose')){
    var dl=e.target.closest('dialog'); if(dl){ var a=dl.querySelector('audio'); if(a) a.pause(); dl.close(); }
  }
});
document.addEventListener('click', function(e){
  var d=document.querySelector('dialog[open]');
  if(d && e.target===d){ var a=d.querySelector('audio'); if(a) a.pause(); d.close(); }
});
document.addEventListener('close', function(e){
  var a=e.target.querySelector && e.target.querySelector('audio'); if(a) a.pause();
}, true);

(function(){
  function guard(){
    if (window.matchMedia('(max-width:64rem)').matches){
      document.documentElement.setAttribute('data-side','on');
    }
  }
  guard();
  window.addEventListener('resize', guard);
  document.addEventListener('DOMContentLoaded', guard);
})();

/* ============ the three faces in the hero ============ */
(function(){
  var MEN = {
    lajos: {
      name: 'Lajos Helman',
      who: 'Helen\u2019s first cousin. Nineteen years old.',
      num: 'Board 322 \u00b7 Buchenwald 56906',
      body: [
        'Born 9 December 1924 in Tiszabogd\u00e1ny. A carter, like his uncle.',
        'Arrested 10 April 1944, five weeks before the others on this card.',
        'Auschwitz 24 May. Buchenwald 2 June. Sent on to the synthetic-fuel plant at Rehmsdorf.'
      ],
      fate: 'Survived. Liberated at Terez\u00edn, May 1945.',
      cls: 'lived'
    },
    michal: {
      name: 'Michal Helman',
      who: 'Helen\u2019s first cousin. Eighteen years old.',
      num: 'Board 323 \u00b7 Buchenwald 57103',
      body: [
        'Born 15 October 1925 in Tiszabogd\u00e1ny. A carter.',
        'Auschwitz 26 May. Buchenwald 2 June. Rehmsdorf, then the evacuation and the march.',
        'At Terez\u00edn he was billeted in block C III/257.'
      ],
      fate: 'Survived. In Budapest in June 1945 he and Lajos found Helen and told her what had happened to her family.',
      cls: 'lived'
    },
    zacharias: {
      name: 'Zacharias Helman',
      who: 'Helen\u2019s father.',
      num: 'Board 324 \u00b7 Buchenwald 57101',
      body: [
        'Born 1901 in Tiszabogd\u00e1ny. A carter. Married to Roza Land\u00f3, six children.',
        'Auschwitz 26 May. Buchenwald 2 June. Magdeburg-Rothensee on 23 July.',
        'Worked past use, he was ordered back to Auschwitz that October.'
      ],
      fate: 'Murdered at Auschwitz, about 10 October 1944, on the ground where his wife and children had waited five months before.',
      cls: 'died'
    }
  };
  var card = document.getElementById('facecard');
  if(!card) return;
  function show(key){
    var m = MEN[key]; if(!m) return;
    card.querySelector('.fcname').textContent = m.name;
    card.querySelector('.fcwho').textContent  = m.who;
    card.querySelector('.fcnum').textContent  = m.num;
    card.querySelector('.fcbody').innerHTML   = m.body.map(function(t){return '<p>'+t+'</p>';}).join('');
    var f = card.querySelector('.fcfate');
    f.textContent = m.fate;
    f.className = 'fcfate ' + m.cls;
    card.hidden = false;
    document.querySelectorAll('.face').forEach(function(b){
      b.classList.toggle('on', b.dataset.man === key);
    });
  }
  function hide(){
    card.hidden = true;
    document.querySelectorAll('.face').forEach(function(b){ b.classList.remove('on'); });
  }
  document.addEventListener('click', function(e){
    var f = e.target.closest('.face');
    if(f){ (f.classList.contains('on') ? hide : show)(f.dataset.man); return; }
    if(e.target.closest('.fcclose')) hide();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') hide(); });
})();

/* ============ compact nav on phones ============ */
(function(){
  document.addEventListener('click', function(e){
    var b = e.target.closest('.navtoggle');
    if(!b) return;
    var open = document.documentElement.getAttribute('data-nav') === 'open';
    document.documentElement.setAttribute('data-nav', open ? 'shut' : 'open');
    b.setAttribute('aria-expanded', open ? 'false' : 'true');
    b.textContent = open ? 'Menu' : 'Close';
  });
  document.addEventListener('click', function(e){
    if(e.target.closest('.sidebar nav a')){
      document.documentElement.setAttribute('data-nav','shut');
      var b=document.querySelector('.navtoggle');
      if(b){ b.setAttribute('aria-expanded','false'); b.textContent='Menu'; }
    }
  });
})();

/* ============ restrained reveal on scroll ============ */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var sel = '.hero, .routes, .strip, .panel, .doc, .step, .fields, .pull, .clip, .db, .sig';
  var els = [].slice.call(document.querySelectorAll(sel));
  if (!els.length) return;

  function reveal(el){ el.classList.add('risen'); }
  function revealAll(){ els.forEach(reveal); }

  els.forEach(function(el){ el.classList.add('rise'); });

  // failsafe: whatever happens, everything is visible shortly after load
  var guard = setTimeout(revealAll, 1200);
  window.addEventListener('pagehide', revealAll);

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ reveal(en.target); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
  els.forEach(function(el){ io.observe(el); });

  // anything already on screen appears at once, with no flash
  requestAnimationFrame(function(){
    els.forEach(function(el){
      var b = el.getBoundingClientRect();
      if (b.top < window.innerHeight * 1.05) reveal(el);
    });
  });

  // if the user scrolls before the observer has done anything, reveal regardless
  window.addEventListener('scroll', function once(){
    clearTimeout(guard); revealAll();
    window.removeEventListener('scroll', once);
  }, { passive:true, once:true });
})();
