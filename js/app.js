var lbar=document.getElementById('lbar'),lpct=document.getElementById('lpct'),
    lmsg=document.getElementById('lmsg'),lAnnounce=document.getElementById('loader-announce'),
    loaderBarWrap=document.getElementById('loader-bar-wrap');
var msgs=['Initialising','Warping spacetime','Approaching singularity','Crossing event horizon','Spaghettifying','Almost through'];
var pct=0,mi=0,done=false;

function setMsg(m){
  lmsg.style.opacity='0';lAnnounce.textContent=m;
  setTimeout(function(){lmsg.textContent=m;lmsg.style.transition='opacity .4s';lmsg.style.opacity='1';},250);
}

function tick(){
  if(done)return;
  pct+=Math.random()*4.5+1.8;
  if(pct>100)pct=100;
  lbar.style.width=pct+'%';
  lpct.textContent=Math.floor(pct)+'%';
  loaderBarWrap.setAttribute('aria-valuenow',Math.floor(pct));
  window.BH.journey=(pct/100)*0.5;
  var nmi=Math.min(Math.floor((pct/100)*msgs.length),msgs.length-1);
  if(nmi!==mi){mi=nmi;setMsg(msgs[mi]);}
  if(pct>=100){
    done=true;
    lmsg.textContent='Entering hyperspace...';
    lAnnounce.textContent='Entering hyperspace';
    setTimeout(function(){
      if(window.glFailed){revealPortfolio();}
      else{startWarp();}
    },400);
  }else{
    setTimeout(tick,100+Math.random()*180);
  }
}

function startWarp(){
  var start=performance.now();
  var duration=3000;
  function warpLoop(now){
    var elapsed=now-start;
    var progress=Math.min(elapsed/duration,1);
    var eased=progress*progress*progress;
    window.BH.journey=0.5+eased*0.5;
    if(progress>.82){
      var f=((progress-.82)/.18);
      window.BH.flash=f*f;
    }
    if(progress>=1){
      window.BH.flash=1;
      setTimeout(function(){
        stopBlackhole();
        revealPortfolio();
      },350);
      return;
    }
    requestAnimationFrame(warpLoop);
  }
  requestAnimationFrame(warpLoop);
}

function revealPortfolio(){
  var loader=document.getElementById('loader');
  loader.classList.add('fade-out');
  document.getElementById('portfolio').classList.add('show');
  setTimeout(function(){loader.style.display='none';startPortfolio();},1300);
}

function cdnAv(id,h){return h?'https://cdn.discordapp.com/avatars/'+id+'/'+h+'.'+(String(h).startsWith('a_')?'gif':'webp')+'?size=256&_='+Date.now():null;}
function cdnBn(id,h){return h?'https://cdn.discordapp.com/banners/'+id+'/'+h+'.'+(String(h).startsWith('a_')?'gif':'webp')+'?size=600&_='+Date.now():null;}

function fetchProfile(id){
  return fetch('https://japi.rest/discord/v1/user/'+id,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){var u=d.data||d;var av=cdnAv(id,u.avatar)||u.avatarURL||null,bn=cdnBn(id,u.banner)||u.bannerURL||null;if(av||bn)return{av:av,bn:bn};throw 0;}).catch(function(){return fetch('https://discordlookup.mevuta.com/v1/user/'+id,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(u){var av=(u.avatar&&(cdnAv(id,u.avatar.id)||u.avatar.link))||null,bn=(u.banner&&(cdnBn(id,u.banner.id)||u.banner.link))||null;if(av||bn)return{av:av,bn:bn};throw 0;}).catch(function(){return fetch('https://api.lanyard.rest/v1/users/'+id,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){var u=d.data&&d.data.discord_user;return u?{av:cdnAv(id,u.avatar),bn:null}:null;}).catch(function(){return null;});});});
}

function fetchDiscord(){
  var DID='920476461406748672';
  var avImg=document.getElementById('discord-avatar-img'),fb=document.getElementById('avatar-fallback'),
      bnEl=document.getElementById('discord-banner'),sName=document.getElementById('sidebar-name'),
      dsC=document.getElementById('discord-stats');
  fetchProfile(DID).then(function(prof){
    return fetch('https://api.lanyard.rest/v1/users/'+DID,{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){return{prof:prof,status:j&&j.success?j.data:null};});
  }).then(function(data){
    var prof=data.prof,statusData=data.status;
    var user=statusData&&statusData.discord_user||{};
    var dn=user.global_name||user.username||'6t0a';sName.textContent=dn;
    if(prof&&prof.av){avImg.src=prof.av;avImg.style.display='block';fb.style.display='none';}
    else if(user.avatar){avImg.src='https://cdn.discordapp.com/avatars/'+DID+'/'+user.avatar+'.png?size=256';avImg.style.display='block';fb.style.display='none';}
    if(prof&&prof.bn)bnEl.style.backgroundImage='url('+prof.bn+')';
    else if(user.banner)bnEl.style.backgroundImage='url(https://cdn.discordapp.com/banners/'+DID+'/'+user.banner+'.png?size=600)';
    else if(user.accent_color)bnEl.style.backgroundColor='#'+user.accent_color.toString(16).padStart(6,'0');
    var avSm=prof&&prof.av?prof.av.replace('size=256','size=64'):(user.avatar?'https://cdn.discordapp.com/avatars/'+DID+'/'+user.avatar+'.png?size=64':'https://cdn.discordapp.com/embed/avatars/0.png?size=64');
    var actDesc='';
    if(statusData&&statusData.activities&&statusData.activities.length){var a=statusData.activities[0];if(a.name){var det='';if(a.state)det+=a.state;if(a.details)det+=(det?' · ':'')+a.details;actDesc=a.name+(det?' — '+det:'');}}
    dsC.innerHTML='<div class="stats-card-inner"><img class="stats-avatar" src="'+avSm+'" alt="Discord avatar" loading="lazy"><div class="stats-info"><div class="stats-username">'+dn+'</div><div class="activity-text">'+actDesc+'</div></div></div>';
  }).catch(function(){});
}

function fetchGitHubData(){
  var sc=document.getElementById('github-stats'),grid=document.getElementById('grid');
  fetch('https://api.github.com/users/iamyakay').then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(user){
    return fetch('https://api.github.com/users/iamyakay/repos?per_page=100&sort=updated').then(function(r){return r.json();}).then(function(repos){
      var ts=repos.reduce(function(s,r){return s+r.stargazers_count;},0);
      sc.innerHTML='<div class="stats-card-inner"><img class="stats-avatar" src="'+user.avatar_url+'&s=88" alt="GitHub avatar" loading="lazy"><div class="stats-info"><div class="stats-username">@'+user.login+'</div><div class="stats-row"><div class="stat-item">Repos <span>'+user.public_repos+'</span></div><div class="stat-item">Stars <span>'+ts+'</span></div><div class="stat-item">Followers <span>'+user.followers+'</span></div></div></div></div>';
      sc.style.display='block';
      grid.innerHTML='';
      var icons=['fa-code','fa-code-branch','fa-terminal','fa-cubes','fa-layer-group','fa-box','fa-robot','fa-bolt'];
      repos.forEach(function(r,i){
        var c=document.createElement('div');c.className='project-card';
        var tags=[];if(r.language)tags.push(r.language);if(r.topics&&r.topics.length)tags.push.apply(tags,r.topics.slice(0,3));
        c.innerHTML='<div class="card-icon"><i class="fas '+icons[i%icons.length]+'" aria-hidden="true"></i></div><div class="card-title">'+r.name+'</div><div class="card-desc">'+(r.description||'No description')+'</div><div class="tech-stack">'+tags.map(function(t){return '<span class="tech-tag">'+t+'</span>';}).join('')+'</div>';
        c.addEventListener('click',function(){window.open(r.html_url,'_blank');});
        grid.appendChild(c);initCardTilt(c);
      });
      observeCards();
    });
  }).catch(function(e){console.error('GitHub fetch failed:',e);});
}

function initCardTilt(card){
  card.addEventListener('mousemove',function(e){
    var r=card.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,
        cx=r.width/2,cy=r.height/2,
        rx=((y-cy)/cy)*-6,ry=((x-cx)/cx)*6;
    card.style.transition='transform .08s ease-out';
    card.style.transform='perspective(800px) rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-6px) scale(1.02)';
    card.style.setProperty('--mx',(x/r.width*100)+'%');
    card.style.setProperty('--my',(y/r.height*100)+'%');
  });
  card.addEventListener('mouseleave',function(){
    card.style.transition='transform .5s cubic-bezier(.23,1,.32,1)';
    card.style.transform='';
  });
}

function observeCards(){
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        var idx=Array.from(document.getElementById('grid').children).indexOf(e.target);
        setTimeout(function(){e.target.classList.add('visible');},idx*80);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.1});
  document.querySelectorAll('.project-card').forEach(function(c){obs.observe(c);});
}

function startPortfolio(){
  setTimeout(function(){document.getElementById('sidebar').classList.add('loaded');},100);
  var phrases=['in progress.','never done.','speaks for itself.'];
  var pi=0,ci=0,deleting=false;var tel=document.getElementById('typed-line');
  function typeLoop(){
    var ph=phrases[pi];
    if(!deleting){tel.textContent=ph.slice(0,++ci);if(ci===ph.length){deleting=true;setTimeout(typeLoop,2200);return;}setTimeout(typeLoop,90+Math.random()*40);}
    else{tel.textContent=ph.slice(0,--ci);if(ci===0){deleting=false;pi=(pi+1)%phrases.length;setTimeout(typeLoop,400);return;}setTimeout(typeLoop,45);}
  }
  setTimeout(typeLoop,400);

  var ICONS=['fa-chart-line','fa-cookie-bite','fa-search','fa-robot','fa-bolt','fa-layer-group'];
  var staticProjects=[
    {title:'LTC Monitor',desc:'Real-time Litecoin transaction monitoring with WebSocket integration and predictive analytics.',tech:['Python','FastAPI','WebSocket','Chart.js']},
    {title:'Cookie Checker',desc:'Advanced cookie analysis with security scanning, session hijacking detection, and compliance reporting.',tech:['Node.js','Puppeteer','Express','MongoDB']},
    {title:'Vanity Checker',desc:'High-performance Discord member status checker with rate limiting and proxy rotation.',tech:['Python','aiohttp','Redis','Docker']},
    {title:'SMM Bot',desc:'Social media automation platform with AI content generation and detailed analytics.',tech:['Node.js','Puppeteer','TensorFlow.js','PostgreSQL']},
    {title:'Gen Bot',desc:'Multi-functional Discord generator bot with account creation and automation.',tech:['Python','discord.py','Selenium','Tor']},
    {title:'NFT Marketplace',desc:'Decentralised NFT trading platform with smart contract integration and real-time bidding.',tech:['React','Web3.js','Solidity','IPFS']}
  ];
  var grid=document.getElementById('grid');
  staticProjects.forEach(function(p,i){
    var c=document.createElement('div');c.className='project-card';
    c.innerHTML='<div class="card-icon"><i class="fas '+ICONS[i]+'" aria-hidden="true"></i></div><div class="card-title">'+p.title+'</div><div class="card-desc">'+p.desc+'</div><div class="tech-stack">'+p.tech.map(function(t){return '<span class="tech-tag">'+t+'</span>';}).join('')+'</div>';
    c.addEventListener('click',function(){c.style.transform='scale(.97)';setTimeout(function(){c.style.transform='';},150);});
    grid.appendChild(c);initCardTilt(c);
  });
  observeCards();

  var st=document.getElementById('scroll-top');var ticking=false;
  addEventListener('scroll',function(){if(!ticking){requestAnimationFrame(function(){st.classList.toggle('show',scrollY>300);ticking=false;});ticking=true;}},{passive:true});
  st.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
  document.getElementById('hero-heading').focus();

  fetchDiscord();fetchGitHubData();
  setInterval(fetchDiscord,60000);
}

setTimeout(tick,1000);
