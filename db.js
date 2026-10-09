/* Databases page: search box, cost filter, live count. ES5, no libraries. */
(function(){
  var q=document.getElementById('dbq'); if(!q) return;
  var dbs=document.querySelectorAll('.db');
  var heads=document.querySelectorAll('h2.dbh');
  var count=document.getElementById('dbcount'), none=document.getElementById('dbnone');
  var btns=document.querySelectorAll('.dbcost button');
  var cost='all', total=dbs.length;
  function costOf(d){ var t=d.querySelector('.tag'); return t&&t.classList.contains('part')?'part':'free'; }
  function run(){
    var words=q.value.toLowerCase().replace(/^\s+|\s+$/g,'').split(/\s+/), shown=0, i, j;
    for(i=0;i<dbs.length;i++){
      var d=dbs[i], text=d.textContent.toLowerCase(), ok=(cost==='all'||costOf(d)===cost);
      for(j=0;ok&&j<words.length;j++){ if(words[j]&&text.indexOf(words[j])<0) ok=false; }
      d.hidden=!ok; if(ok) shown++;
    }
    for(i=0;i<heads.length;i++){
      var grid=heads[i].nextElementSibling; while(grid&&!grid.classList.contains('dbgrid')) grid=grid.nextElementSibling;
      var any=grid&&grid.querySelector('.db:not([hidden])'); heads[i].hidden=!any; if(grid) grid.hidden=!any;
    }
    count.textContent=(shown===total)?total+' databases':'Showing '+shown+' of '+total;
    none.hidden=shown>0;
  }
  q.addEventListener('input',run);
  for(var i=0;i<btns.length;i++){ btns[i].addEventListener('click',function(){
    cost=this.getAttribute('data-cost');
    for(var k=0;k<btns.length;k++) btns[k].setAttribute('aria-pressed',btns[k]===this?'true':'false');
    run();
  }); }
  run();
})();
