/* Databases page: search box, cost filter, live count. ES5, no libraries. */
(function(){
  var q=document.getElementById('dbq'); if(!q) return;
  var dbs=document.querySelectorAll('.db');
  var heads=document.querySelectorAll('h2.dbh');
  var count=document.getElementById('dbcount'), none=document.getElementById('dbnone');
  var btns=document.querySelectorAll('.dbcost button');
  var cost='all', total=dbs.length;
  function costOf(d){ var t=d.querySelector('.tag'); return t&&t.classList.contains('part')?'part':'free'; }
  function fold(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  function keysOf(d){ return [].map.call(d.querySelectorAll('[data-keys]'),function(e){ return e.getAttribute('data-keys'); }).join(' '); }

  // names people type for the same place (Sam, 16 Oct 2026): a search for any one finds the others
  var GROUPS=[
    'poland polish','hungary hungarian','romania romanian rumania','ukraine ukrainian','germany german','austria austrian',
    'slovakia slovak','czech czechia czechoslovakia','lithuania lithuanian','latvia latvian','estonia estonian',
    'russia russian ussr soviet','belarus belarusian byelorussia belorussia','moldova moldavia moldovan','serbia serbian',
    'croatia croatian','italy italian','france french','greece greek','netherlands dutch holland','belgium belgian',
    'bulgaria bulgarian','yugoslavia yugoslav','bukovina bukowina','maramaros maramures marmaros',
    'subcarpathia subcarpathian zakarpattia ruthenia transcarpathia','britain british england uk','usa america american',
    'israel palestine'
  ];
  var PHRASES={'czech republic':'czech','united states':'usa','united kingdom':'britain','great britain':'britain',
    'soviet union':'russia','south africa':'southafrica','pale of settlement':'pale','sub-carpathia':'subcarpathia','sub carpathia':'subcarpathia'};
  // places under Nazi rule or occupation: the worldwide collections cover them, so they always show
  var PERSECUTED=' poland hungary romania ukraine germany austria slovakia czech lithuania latvia estonia russia belarus moldova serbia croatia italy france greece netherlands belgium bulgaria yugoslavia bukovina maramaros subcarpathia galicia bessarabia transylvania volhynia podolia silesia moravia bohemia bavaria vojvodina pale montenegro kosovo albania bosnia slovenia macedonia denmark norway luxembourg europe ';
  // places survivors went to after the war
  var SETTLED=' usa britain canada israel argentina brazil australia southafrica mexico cuba shanghai china ';
  var GROUP={};
  for(var g=0;g<GROUPS.length;g++){ var ws=GROUPS[g].split(' '); for(var k=0;k<ws.length;k++) GROUP[ws[k]]=ws; }
  GROUP.us=GROUP.usa; // "us" alone is too common a word to search for

  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  // whole words: short words must match exactly ("uk" is not "ukraine"), longer ones may be the start of a word ("camp" finds "camps")
  function hit1(text,w){ return new RegExp('(^|[^a-z0-9])'+esc(w)+(w.length<=3?'([^a-z0-9]|$)':'')).test(text); }
  function hit(text,w){ return hit1(text,w)||(w.length>4&&/s$/.test(w)&&hit1(text,w.slice(0,-1))); } // "camps" also finds "camp"

  // a real search (Sam, 16 Oct 2026): send what was typed to the archives' own search pages.
  // Each link was tested by hand on 16 Oct 2026; FamilySearch and JewishGen need a sign-in, so they can't take a link.
  var GO=[
    ['Yad Vashem names, as a surname',function(v){ return 'https://collections.yadvashem.org/en/names/search-results-names?page=1&gn_last_name='+v+'&gnt_last_name=yvSynonym'; }],
    ['Yad Vashem names, as a place',function(v){ return 'https://collections.yadvashem.org/en/names/search-results-names?page=1&gn_place='+v+'&gnt_place=yvSynonym'; }],
    ['USHMM collections',function(v){ return 'https://collections.ushmm.org/search/?q='+v; }],
    ['Arolsen Archives <small>(then press Search)</small>',function(v){ return 'https://collections.arolsen-archives.org/en/search?s='+v; }],
    ['Hungaricana',function(v){ return 'https://library.hungaricana.hu/en/search/results/?query='+v; }],
    ['Geni, as a surname',function(v){ return 'https://www.geni.com/search?search_type=people&names='+v; }],
    ['Find a Grave, as a surname',function(v){ return 'https://www.findagrave.com/memorial/search?lastname='+v; }]
  ];
  var go=document.createElement('nav');
  go.className='dbgo'; go.setAttribute('aria-label','Search the archives directly'); go.hidden=true;
  count.parentNode.insertBefore(go,count.nextSibling);
  function esch(s){ return s.replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function paintGo(raw){
    if(raw.length<3){ go.hidden=true; go.innerHTML=''; return; }
    var v=encodeURIComponent(raw), h='<span>Search “'+esch(raw)+'” in the archives themselves:</span>';
    for(var i=0;i<GO.length;i++) h+='<a href="'+GO[i][1](v)+'" target="_blank" rel="noopener">'+GO[i][0]+'</a>';
    go.innerHTML=h; go.hidden=false;
  }

  var wide=document.createElement('p');
  wide.className='dbnone dbwide'; wide.hidden=true; none.parentNode.insertBefore(wide,none.nextSibling);
  var texts=[].map.call(dbs,function(d){ return fold(d.textContent+' '+keysOf(d)); });
  var worldwide=[].map.call(dbs,function(d){ return /\bworldwide\b/.test(keysOf(d)); });

  function matches(words,c){
    var out=[], i, j, k;
    for(i=0;i<dbs.length;i++){
      var ok=(c==='all'||costOf(dbs[i])===c);
      for(j=0;ok&&j<words.length;j++){
        var alts=GROUP[words[j]]||[words[j]], any=false;
        for(k=0;!any&&k<alts.length;k++) any=hit(texts[i],alts[k]);
        if(!any) ok=false;
      }
      out.push(ok);
    }
    return out;
  }
  function canon(w){ return (GROUP[w]||[w])[0]; }

  function run(){
    var raw=q.value.replace(/^\s+|\s+$/g,''), s=fold(raw), p, i, j, shown=0;
    for(p in PHRASES){ if(PHRASES.hasOwnProperty(p)) s=s.split(p).join(PHRASES[p]); }
    var words=s?s.split(/\s+/):[], persecuted=false, settled=false;
    for(j=0;j<words.length;j++){ var c=canon(words[j]); if(PERSECUTED.indexOf(' '+c+' ')>=0) persecuted=true; if(SETTLED.indexOf(' '+c+' ')>=0) settled=true; }
    var show=matches(words,cost), n=0;
    for(i=0;i<show.length;i++) if(show[i]) n++;
    var place=persecuted||settled;
    // a place search always includes the collections that are not limited to one country (Sam, 16 Oct 2026)
    if(place){ for(i=0;i<dbs.length;i++) if(worldwide[i]&&(cost==='all'||costOf(dbs[i])===cost)) show[i]=true; }
    var after=0; for(i=0;i<show.length;i++) if(show[i]) after++;
    wide.hidden=true;
    if(raw&&place&&n===0&&after>0){
      wide.textContent=persecuted
        ? 'Nothing here is specific to “'+raw+'” yet. These collections are not limited to one country, so start with them, and search for the town inside each one.'
        : 'Nothing here is specific to “'+raw+'” yet. For a family who settled there after the war, start with these collections, which follow people across borders, then that country’s own immigration, naturalization and cemetery records.';
      wide.hidden=false;
    } else if(raw&&after===0&&cost!=='all'){
      // the cost filter emptied it: say so
      var all=matches(words,'all'), m=0; for(i=0;i<all.length;i++) if(all[i]||(place&&worldwide[i])) m++;
      if(m>0){ wide.textContent=(cost==='free'?'No free databases':'No databases under Some cost')+' match “'+raw+'”. '+m+(m===1?' does':' do')+' under All.'; wide.hidden=false; }
    }
    for(i=0;i<dbs.length;i++){ dbs[i].hidden=!show[i]; if(show[i]) shown++; }
    for(i=0;i<heads.length;i++){
      var grid=heads[i].nextElementSibling; while(grid&&!grid.classList.contains('dbgrid')) grid=grid.nextElementSibling;
      var any=grid&&grid.querySelector('.db:not([hidden])'); heads[i].hidden=!any; if(grid) grid.hidden=!any;
    }
    paintGo(raw);
    count.textContent=(shown===total)?total+' databases':'Showing '+shown+' of '+total;
    none.hidden=shown>0||!wide.hidden;
  }
  q.addEventListener('input',run);
  for(var i=0;i<btns.length;i++){ btns[i].addEventListener('click',function(){
    cost=this.getAttribute('data-cost');
    for(var k=0;k<btns.length;k++) btns[k].setAttribute('aria-pressed',btns[k]===this?'true':'false');
    run();
  }); }
  run();
})();
