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
