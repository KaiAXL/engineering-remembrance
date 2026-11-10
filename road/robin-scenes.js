/* Robin's talk on Helen's Road: the one scene the road doesn't have.
   The gravestones: her family's names on two stones over the village as it is today, one name at a time,
   and Helen, 15, in gold below them. Shown while that stop is on screen (road.js says which stop, 'road-stop'). */
(function(){
  var box=document.createElement('div'); box.className='graves'; box.setAttribute('aria-hidden','true'); document.body.appendChild(box);
  var timers=[];
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function clear(){ timers.forEach(clearTimeout); timers=[]; box.classList.remove('on'); document.body.classList.remove('at-graves'); }
  function show(){
    var N=window.ROBIN_NAMES||[];
    var stone=function(g){ return '<ol class="stone">'+g.map(function(n){ return '<li class="n"><b>'+esc(n[0])+'</b><small>'+esc(n[1])+'</small></li>'; }).join('')+'</ol>'; };
    box.innerHTML='<div class="bg"><img src="road/img/robin/bohdan-2019-evening.jpg" alt=""></div><div class="shade"></div>'+
      '<div class="inner"><h3>Murdered at Auschwitz, 1944</h3><div class="stones">'+stone(N.slice(0,4))+stone(N.slice(4))+'</div>'+
      '<div class="last"><b>Helen, 15</b><small>the only one left</small></div></div>'+
      '<div class="gcredit">Tiszabogdány (Bohdan) today. Photo: Ork Tesla, 2019, CC BY-SA 4.0</div>';
    void box.offsetWidth; box.classList.add('on'); document.body.classList.add('at-graves');
    [].forEach.call(box.querySelectorAll('.n'),function(e,i){ timers.push(setTimeout(function(){ e.classList.add('on'); },1400+i*1100)); });
    timers.push(setTimeout(function(){ box.querySelector('.last').classList.add('on'); },1400+N.length*1100+1200));
  }
  window.addEventListener('road-stop',function(e){ clear(); document.body.classList.toggle('big-photos',!!(e.detail&&e.detail.s&&e.detail.s.bigPhotos)); document.body.setAttribute('data-stop',(e.detail&&e.detail.s&&e.detail.s.id)||''); if(e.detail&&e.detail.s&&e.detail.s.scene==='graves') show(); });
})();
