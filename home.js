/* Homepage: reveal the method diagram's units in order when it scrolls into view. ES5, no libraries. */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  var figs=document.querySelectorAll('.pfd');
  if(!figs.length) return;
  var io=new IntersectionObserver(function(entries){
    for(var i=0;i<entries.length;i++){
      if(entries[i].isIntersecting){ entries[i].target.classList.add('on'); io.unobserve(entries[i].target); }
    }
  },{threshold:.25});
  for(var i=0;i<figs.length;i++){ figs[i].classList.add('arm'); io.observe(figs[i]); }
})();

/* teaching records: a "your turn" quiz reveals the boxes and the key on tap */
(function(){
  document.documentElement.classList.add('js');
  var ASK='Your turn: what’s wrong with this record? Look, then tap to check';
  var ANS='Answer: the year and the town are false. Her parents are right. Tap to hide';
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.trec-go'); if(!b) return;
    var f=b.closest('.trec'), on=!f.classList.contains('shown');
    f.classList.toggle('shown',on); b.setAttribute('aria-expanded',on?'true':'false');
    b.textContent=on?ANS:ASK;
  });
})();

/* method page tabs: one part at a time; links to anything inside a tab open that tab */
(function(){
  var bar=document.querySelector('.mtabs'); if(!bar) return;
  var tabs=bar.querySelectorAll('[role="tab"]');
  function show(id,focusEl){
    for(var i=0;i<tabs.length;i++){
      var t=tabs[i], on=t.getAttribute('aria-controls')===id, pnl=document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected',on?'true':'false'); if(pnl) pnl.classList.toggle('on',on);
    }
    if(focusEl) setTimeout(function(){ focusEl.scrollIntoView(); },0);
  }
  bar.addEventListener('click',function(e){
    var t=e.target.closest('[role="tab"]'); if(!t) return;
    show(t.getAttribute('aria-controls'));
    if(history.replaceState) history.replaceState(null,'','#'+t.getAttribute('aria-controls'));
    var top=bar.getBoundingClientRect().top+window.pageYOffset-8;
    if(window.pageYOffset>top) window.scrollTo(0,top);
  });
  function fromHash(){
    var id=location.hash.slice(1); if(!id) return;
    var el=document.getElementById(id); if(!el) return;
    var pnl=el.classList.contains('mpanel')?el:el.closest('.mpanel'); if(pnl) show(pnl.id,el);
  }
  window.addEventListener('hashchange',fromHash); fromHash();
})();

/* the road card: its words are exactly as tall as Helen's portrait, so the label sits level with the photo's top and the button with its bottom (Sam, 9 Oct 2026) */
(function(){
  var card=document.querySelector('.hhero.solo .roadcard'); if(!card) return;
  var img=card.querySelector('.rcpor img'), txt=card.querySelector('.rctext'); if(!img||!txt) return;
  function fit(){
    var h=img.getBoundingClientRect().height; if(h) card.style.setProperty('--porH',h+'px'); }
  if(img.complete) fit(); img.addEventListener('load',fit); window.addEventListener('resize',fit);
})();

/* method examples on laptops: each label sits above or below its box, never on another label and never past the record's edges (Sam, 10 Oct 2026) */
(function(){
  var docs=document.querySelectorAll('.stepex .exdoc'); if(!docs.length) return;
  function ov(a,b){ return a.left<b.right+3&&a.right>b.left-3&&a.top<b.bottom+3&&a.bottom>b.top-3; }
  function place(){
    if(innerWidth<=1100) return;
    [].forEach.call(docs,function(d){
      var box=d.getBoundingClientRect(), done=[];
      [].forEach.call(d.querySelectorAll('.exmk'),function(m){
        var l=m.querySelector('.exl'); if(!l) return;
        var tries=[['',0],['below',0],['',-1],['below',1],['',-2],['below',2],['',-3],['below',3]];
        for(var i=0;i<tries.length;i++){
          m.classList.toggle('below',tries[i][0]==='below'); l.style.marginTop=''; l.style.transform='';
          var shift=tries[i][1]; if(shift) l.style.transform='translateY('+(shift*(l.offsetHeight+4))+'px)';
          l.style.left=''; l.style.right='';
          var r=l.getBoundingClientRect(), mr=m.getBoundingClientRect();
          if(r.right>box.right){ l.style.left='auto'; l.style.right='-2px'; r=l.getBoundingClientRect(); }
          if(r.left<box.left){ l.style.right='auto'; l.style.left=(box.left-mr.left)+'px'; r=l.getBoundingClientRect(); }
          if(!done.some(function(o){ return ov(r,o); })) break;
        }
        done.push(l.getBoundingClientRect());
      });
    });
  }
  window.addEventListener('load',place); window.addEventListener('resize',function(){ clearTimeout(place.t); place.t=setTimeout(place,150); });
  setTimeout(place,300);
})();
