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
