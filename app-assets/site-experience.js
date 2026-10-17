/* Shared interaction patterns; each site retains its catalog, identity and page routes. */
(() => {
'use strict';
if(window.__siteExperience)return;window.__siteExperience=true;
const cfg=window.__siteExperienceConfig;if(!cfg)return;
const base=new URL('./',document.currentScript.src), asset=n=>new URL(n,base).href;
const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function action(text,fn,cls=''){const b=el('button','x-action '+cls,text);b.type='button';b.onclick=fn;return b;}
const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>';
function dialog(type,title){const d=el('dialog',type),head=el('div','x-dialog-heading'),img=el('img');img.src=asset('icon-192.png');img.alt='';const copy=el('div');copy.append(el('small','',cfg.name),el('h2','',title));const close=action('×',()=>d.close());close.setAttribute('aria-label','Close '+title);head.append(img,copy,close);d.append(head);d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});document.body.append(d);return d;}
function divider(index=0){const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('class','x-divider');n.setAttribute('viewBox','0 0 420 20');n.setAttribute('aria-hidden','true');const designs=['M0 10H100Q130 -5 160 10T220 10T280 10H420','M0 10H140C165 10 160 -6 180 4S170 25 200 10H420','M0 10Q70 2 140 10T280 10T420 10','M0 10H90L110 5L130 15L150 10H280Q300 0 320 10H420'];const start=65+index*11,bend=start+32;const unique='M0 10H'+start+'C'+bend+' 10 '+bend+' '+(1+index%4)+' '+(bend+18)+' '+(1+index%4)+'S'+(bend+7)+' '+(19-index%4)+' '+(bend+40)+' 10H420';n.innerHTML='<path d="M0 10H420" opacity=".3"/><path class="x-flow" d="'+unique+'"/>';n.querySelector('.x-flow').style.animationDuration=(10+index)+'s';n.style.setProperty('--x-divider-speed',(10+index)+'s');return n;}
function addMenu(){
 if(cfg.slug==='perennial-home-and-gardens')return;
 if(cfg.slug==='ie')return; // i.e. already uses the approved compact dropdown.
 const sources=all(cfg.navSources).filter(n=>!n.closest('.x-menu'));
 if(!sources.length)return;
 const host=$(cfg.header)||sources[0].parentElement;
 const menu=dialog('x-menu','Menu'),items=el('nav','x-menu-items');items.setAttribute('aria-label',cfg.name+' navigation');menu.append(items);menu.addEventListener('close',()=>{all('.x-menu-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));});
 if(cfg.slug==='MentalHealthDiscussions'){
   const head=menu.querySelector('.x-dialog-heading'),img=head?.querySelector('img'),copy=head?.querySelector('div'),close=head?.querySelector('button:last-child');
   img?.remove();
   if(copy){
     copy.replaceChildren(el('div','x-mhd-menu-wordmark','Mental Health Discussions'),el('h2','','Menu'));
   }
   if(close){
     close.classList.add('x-mhd-menu-close');
     close.textContent='×';
   }
 }
 function refresh(){
  items.replaceChildren();const seen=new Set(),members=[];
  if(cfg.slug==='MentalHealthDiscussions'){
   const icons={
    guide:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>',
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/></svg>',
    understand:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4M8.5 14.5C6.9 13.3 6 11.5 6 9.5A6 6 0 0 1 18 9.5c0 2-.9 3.8-2.5 5-1 .8-1.5 1.6-1.5 2.5h-4c0-.9-.5-1.7-1.5-2.5z"/></svg>',
    tools:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="8" cy="5" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="19" r="2"/></svg>',
    care:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10z"/></svg>',
    family:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 21c.4-4.2 2.3-6.5 5.5-6.5S13.1 16.8 13.5 21M14 21c.2-3 1.4-4.8 3.8-4.8 2.2 0 3.5 1.6 3.7 4.8"/></svg>',
    life:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M6 20V9h12v11M9 9V5h6v4M9 14h2M13 14h2"/></svg>',
    discuss:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H4z"/><path d="M20 4h-6a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h6z"/></svg>',
    med:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v16H8z"/><path d="M10 8h4M12 6v4"/></svg>',
    treatment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="9"/></svg>',
    appointment:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3M13 15h3"/></svg>',
    crisis:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17h.01"/></svg>',
    law:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-4 7h8zM17 7l-4 7h8zM7 21h10"/></svg>',
    change:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17 17 4l3 3L7 20H4z"/><path d="M14 7l3 3"/></svg>',
    contact:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3z"/><path d="m3 6 9 7 9-7"/></svg>',
    install:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m-4-4 4 4 4-4M5 15v5h14v-5"/></svg>'
   };
   const add=(label,href,key,handler)=>{
    const b=el(href?'a':'button','x-menu-item');if(href)b.href=href;else b.type='button';
    b.innerHTML=(icons[key]||icons.tools)+'<span>'+label+'</span>';
    b.addEventListener('click',e=>{if(handler){e.preventDefault();menu.close();handler();}else menu.close();});
    items.append(b);
   };
   add('Guide Me',null,'guide',()=>{if(typeof window.restartGuide==='function')window.restartGuide();else location.href='index.html?guide=1';});
   add('Start Here','index.html#start','home');
   add('Understand','index.html#understand','understand');
   add('Research & Tools','tools.html','tools');
   add('Find Care','find-care.html','care');
   add('Conditions & Symptoms','condition-guide.html','understand');
   add('Glossary','glossary.html','book');
   add('Medication','medication-guide.html','med');
   add('Treatment & Therapy','treatment-guide.html','treatment');
   add('Appointment Prep','appointment-builder.html','appointment');
   add('Family & Caregivers','family-caregiver.html','family');
   add('Life & Daily Living','life-guide.html','life');
   add('Crisis, Hospital & Legal','crisis-legal.html','crisis');
   add('State Law','state-law.html','law');
   add('Change & Advocacy','advocacy-guide.html','change');
   add('Discuss & Evidence','discuss-evidence.html','discuss');
   add('Contact','index.html#contact','contact');
   add('Install Web App',null,'install',()=>window.siteInstallApp?.());
   return;
  }
  for(const source of sources)for(const n of source.querySelectorAll('a[href],button')){
   if(n.closest('.site-app-button')||n.matches('.site-app-button,.x-menu-toggle,.drop-toggle')||n.matches(cfg.mediaTrigger||'[data-no-media]')||/theme|sound|music|light|announcement/i.test(n.id+' '+n.getAttribute('data-etp-action')))continue;
   const label=n.getAttribute('data-label')||n.querySelector('.label,.nav-label,.wdw-sr-only')?.textContent||n.closest('.etp-nav-item')?.querySelector('.etp-tip')?.textContent||n.getAttribute('aria-label')||n.querySelector('span:last-child')?.textContent||n.textContent;
   const contextLabel=cfg.slug==='ie-casino-games'&&n.dataset.rule?(n.dataset.rule==='time'?'Time Travel Slots':'Casa 21')+' · House Rules':label;
   const text=String(contextLabel||'').replace(/\s+/g,' ').trim();if(!text||/^(close|close menu|close navigation)$/i.test(text)||text==='Install App'||seen.has(text))continue;seen.add(text);
   const b=el(n.tagName==='A'?'a':'button','x-menu-item');if(n.tagName==='A')b.href=n.href;else{b.type='button';b.disabled=n.disabled;}b.innerHTML=icon;const span=el('span','',text);b.append(span);
   b.addEventListener('click',e=>{e.preventDefault();menu.close();n.click();});
   if(/membership|members only|join|subscribe/i.test(text)){b.classList.add('x-membership');members.push(b);}else items.append(b);
  }
  if(cfg.slug==='basketball-brilliance'&&!items.children.length){for(const role of ['coach','player','parent']){const b=el('button','x-menu-item',role[0].toUpperCase()+role.slice(1));b.type='button';b.onclick=()=>{menu.close();document.querySelector('.hs-'+role)?.click();};items.append(b);}}
  members.forEach(n=>items.append(n));
  const install=el('button','x-menu-item','Install App');install.type='button';install.onclick=()=>{menu.close();window.siteInstallApp?.();};items.insertBefore(install,members[0]||null);
 }
 all(cfg.preserve||'[data-no-preserve]').forEach(n=>{if(sources.some(s=>s.contains(n)))host.append(n);});
 sources.forEach(n=>{n.classList.add('x-hidden-nav');n.style.setProperty('display','none','important');new MutationObserver(refresh).observe(n,{childList:true,subtree:true});});refresh();
 all(cfg.oldMenuTriggers||'[data-no-old-menu]').forEach(n=>{n.classList.add('x-hidden-nav');n.style.setProperty('display','none','important');});
 function toggle(){const b=el('button','x-menu-toggle');b.type='button';b.setAttribute('aria-label','Open '+cfg.name+' navigation');b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','site-experience-menu');b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M17 4v16"/></svg>';if(cfg.slug==='MentalHealthDiscussions'){b.dataset.tip='Main Menu';b.title='Main Menu';}b.onclick=()=>{refresh();menu.showModal();b.setAttribute('aria-expanded','true');};return b;}
 menu.id='site-experience-menu';host.append(toggle());
 // The Basketball Brilliance entry screen intentionally has no header.
 if(cfg.slug==='basketball-brilliance'&&$('#entryStage')){const dock=el('div','x-entry-menu');dock.style.cssText='position:absolute;left:12px;top:12px;z-index:6';dock.append(toggle());$('#entryStage').append(dock);}
 // Keep install access outside the navigation containers that were collapsed.
 const top=$('.site-app-desktop');if(top&&cfg.slug!=='MentalHealthDiscussions'&&!host.contains(top))host.insertBefore(top,host.lastElementChild);
}
function brandNative(){
 const panel=$(cfg.nativePanel||'[data-no-native]');if(!panel)return;
 panel.classList.add('x-native-panel');
 if(cfg.slug==='ie'){
  const identity=panel.querySelector('.music-identity');if(identity&&!identity.querySelector('.x-brand-name')){const small=el('small','x-brand-name','InAct Entertainment');small.style.cssText='display:block;font:11px Georgia,serif';identity.insertBefore(small,identity.lastElementChild);}
  return;
 }
 const heading=panel.querySelector('.jb-heading,.cb-music-heading,.etp-jukebox-brand');
 if(heading&&!panel.querySelector('.x-divider')){const old=panel.querySelector('.jb-divider,.cb-juke-divider,.etp-jukebox-divider');if(old)old.replaceWith(divider(cfg.divider));else heading.after(divider(cfg.divider));}
 if(cfg.slug==='divine-shades-of-brown'&&heading&&!heading.querySelector('.x-brand-name')){const small=el('small','x-brand-name',cfg.name);heading.querySelector('h2')?.before(small);}
 if(cfg.slug==='examine-the-past-home'){const copy=heading?.querySelector('div');if(copy){const h=copy.querySelector('h2'),s=copy.querySelector('span');if(h&&s){h.textContent='Jukebox';s.textContent=cfg.name;copy.prepend(s);}}}
 const summary=panel.querySelector('.jb-personal summary,.cb-favorites summary');if(summary){summary.textContent='› My playlists';}
 if(!panel.querySelector('.x-explore-footer')){const link=el('a','x-action x-wide x-explore-footer','Explore '+cfg.name);link.href=new URL('../',base).href;panel.append(link);}
}
async function genericPlayer(){
 if(!cfg.generic)return;
 const catalog=await fetch(asset('media-library.json?v=20261017-mhd')).then(r=>{if(!r.ok)throw Error();return r.json();}).catch(()=>({music:[],motivation:[],movies:[],meditation:[],podcasts:[],quiet:[],failed:true}));
 const panel=dialog('x-jukebox','Jukebox');panel.id='site-shared-jukebox';
 if(cfg.slug==='MentalHealthDiscussions'){
   panel.classList.add('x-mhd-jukebox');
   const head=panel.querySelector('.x-dialog-heading'),copy=head?.querySelector('div'),img=head?.querySelector('img'),close=head?.querySelector('button:last-child');
   img?.remove();
   if(copy){copy.replaceChildren(el('h2','','Mental Health Discussions Jukebox'));}
   if(head&&close){const minimize=action('—',()=>panel.close());minimize.classList.add('x-minimize');minimize.setAttribute('aria-label','Minimize player');minimize.title='Minimize player';head.insertBefore(minimize,close);}
 }
 panel.insertBefore(divider(cfg.divider),panel.children[1]||null);
 const back=action('‹ Back',()=>goBack());back.hidden=true;const view=el('div','x-player-view');panel.append(back,view);
 const mini=el('div','x-mini');mini.hidden=true;document.body.append(mini);
 const key='ie-'+cfg.slug+'-jukebox-v1';let saved=[];try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(parsed))saved=parsed.filter(t=>t&&(/^[\w-]{11}$/.test(t.videoId||'')||/^[\w-]{10,100}$/.test(t.listId||'')));}catch{}
 let stack=[],screen={type:'root'},queue=[],current=null,index=-1,yt=null,ready=false,epoch=0,shuffle=false,repeat=false,audio=null,playing=false,apiPromise=null,local=[],timer;
 const status=el('p','x-status');status.setAttribute('role','status');
 function stopOther(){all('audio').forEach(a=>{if(a!==audio&&!a.paused)a.pause();});all('iframe[src*="youtube"]').forEach(f=>{if(!panel.contains(f))f.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),'*');});}
 function persist(){try{localStorage.setItem(key,JSON.stringify(saved.filter(t=>!t.local)));}catch{status.textContent='Saved for this visit; browser storage is unavailable.';}}
 function navigate(next){stack.push(screen);screen=next;render();}
 function goBack(){if(screen.type==='player')pause();screen=stack.pop()||{type:'root'};render();}
 function rootPlaylists(){const details=el('details','x-playlists'),summary=el('summary','','My playlists');details.append(summary,action('Open my playlist',()=>navigate({type:'list',title:'My playlist',items:[...saved,...local]})));
  const form=el('form'),label=el('label','','Add a YouTube video or playlist URL'),url=el('input');url.type='url';url.required=true;url.placeholder='https://www.youtube.com/watch?v=…';label.append(url);const add=action('Add to playlist',()=>{});add.type='submit';form.append(label,add);form.onsubmit=e=>{e.preventDefault();let parsed;try{parsed=new URL(url.value);}catch{status.textContent='Enter a YouTube URL.';return;}const host=parsed.hostname.replace(/^www\./,'');if(!['youtube.com','youtu.be','m.youtube.com','music.youtube.com'].includes(host)){status.textContent='Use a YouTube video or playlist link.';return;}const id=host==='youtu.be'?parsed.pathname.slice(1):parsed.searchParams.get('v'),listId=parsed.searchParams.get('list');if(!/^[\w-]{11}$/.test(id||'')&&!/^[\w-]{10,100}$/.test(listId||'')){status.textContent='That link needs a video or playlist ID.';return;}const t={title:'My YouTube selection',artist:'My playlist',...(id?{videoId:id}:{listId})};if(!saved.some(x=>(id&&x.videoId===id)||(listId&&x.listId===listId)))saved.push(t);persist();url.value='';status.textContent='Added to My playlist.';};details.append(form);
  const files=el('input');files.type='file';files.accept='audio/*';files.multiple=true;const fileLabel=el('label','','Add audio from this device');fileLabel.append(files);files.onchange=()=>{for(const f of files.files){if(!f.type.startsWith('audio/'))continue;local.push({title:f.name,artist:'Local audio',src:URL.createObjectURL(f),local:true});}status.textContent='Local audio added for this visit.';};details.append(fileLabel,el('p','','Your saved selections stay in this browser. Local files must be re-added on a future visit.'));return details;
 }
 function nativeTracks(){return all(cfg.audioSources||'[data-no-audio]').map((a,i)=>({title:a.dataset.trackTitle||a.id?.replace(/Track$/,'').replace(/([A-Z])/g,' $1')||'Site soundtrack',artist:cfg.name,audioId:a.id,id:'site-audio-'+i}));}
 function render(){view.replaceChildren();back.hidden=screen.type==='root';status.textContent='';
  if(screen.type==='root'){
   const grid=el('div','x-root-grid');const siteTracks=nativeTracks();
   if(cfg.slug==='MentalHealthDiscussions'){
     grid.append(
       action('Music',()=>navigate({type:'genres'})),
       action('Motivation',()=>navigate({type:'list',title:'Mental Health Motivation',items:catalog.motivation||[]})),
       action('Movies',()=>navigate({type:'list',title:'Mental Health Films & Trailers',items:catalog.movies||[]})),
       action('Meditation',()=>navigate({type:'list',title:'Meditation · Mindfulness · Grounding',items:catalog.meditation||[]}))
     );
     if(catalog.failed)status.textContent='The media collection could not load. Refresh to try again.';
     view.append(grid,rootPlaylists());
     const podcasts=action('Mental Health Podcasts',()=>navigate({type:'list',title:'Mental Health Podcasts',items:catalog.podcasts||[]}));
     podcasts.classList.add('x-wide','x-podcasts');
     view.append(podcasts,status);return;
   }
   if(siteTracks.length)grid.append(action(cfg.slug==='ie-casino-games'?'Casino Tunes':'Site soundtrack',()=>navigate({type:'list',title:cfg.name+' music',items:siteTracks})));
   if(cfg.slug==='livefit-info'){grid.append(action('Workout Music',()=>navigate({type:'genres'})),action('Recovery Music',()=>navigate({type:'list',title:'Recovery Music',items:catalog.quiet})),action('Quiet Listening',()=>navigate({type:'list',title:'Quiet Listening',items:catalog.quiet})));}else{grid.append(action('Music',()=>navigate({type:'genres'})),action('Motivation',()=>navigate({type:'list',title:'Motivation',items:catalog.motivation})),action('Movies',()=>navigate({type:'list',title:'Movie trailers',items:catalog.movies})));}
   if(catalog.failed)status.textContent='The media collection could not load. Refresh to try again, or use a site soundtrack or your own audio.';view.append(grid,rootPlaylists());const explore=el('a','x-action x-wide','Explore '+cfg.name);explore.href=new URL('../',base).href;view.append(explore,status);return;
  }
  if(screen.type==='genres'){
   view.append(el('h3','','Choose a genre'));const grid=el('div','x-root-grid');for(const genre of [...new Set(catalog.music.map(t=>t.genre||'Music'))])grid.append(action(genre,()=>navigate({type:'list',title:genre,items:catalog.music.filter(t=>(t.genre||'Music')===genre)})));view.append(grid);return;
  }
  if(screen.type==='list'){
   view.append(el('h3','',screen.title));if(!screen.items.length)view.append(el('p','','Save a selection or add local audio in My playlists.'));
   screen.items.forEach((t,i)=>{const row=el('div','x-row');
     const label=(t.artist?t.artist+' · ':'')+t.title;
     const track=action(label,()=>{if(t.externalUrl){window.open(t.externalUrl,'_blank','noopener');return;}queue=screen.items.filter(x=>!x.externalUrl);index=queue.indexOf(t);navigate({type:'player'});play(t);},'x-track');
     if(t.externalUrl)track.title='Opens trusted resource or YouTube collection in a new tab';
     row.append(track);
     if(t.videoId){const exists=saved.some(x=>x.videoId===t.videoId);const save=action(exists?'✓':'+',()=>{saved=exists?saved.filter(x=>x.videoId!==t.videoId):[...saved,t];persist();render();},'x-save');save.setAttribute('aria-label',(exists?'Remove from':'Save to')+' My playlist');row.append(save);}
     view.append(row);
   });view.append(status);return;
  }
  if(screen.type==='player'){drawPlayer();}
 }
 function api(){if(window.YT?.Player)return Promise.resolve(window.YT);if(apiPromise)return apiPromise;apiPromise=new Promise((resolve,reject)=>{const old=window.onYouTubeIframeAPIReady;const timeout=setTimeout(()=>{apiPromise=null;reject(Error('Video controls could not connect. Try again.'));},12000);window.onYouTubeIframeAPIReady=()=>{old?.();clearTimeout(timeout);resolve(window.YT);};if(!document.querySelector('script[src*="youtube.com/iframe_api"]')){const s=el('script');s.src='https://www.youtube.com/iframe_api';document.head.append(s);}});return apiPromise;}
 function pause(){if(audio)audio.pause();try{yt?.pauseVideo();}catch{}playing=false;sync();}
 function stop(){pause();if(audio)try{audio.currentTime=0;}catch{}try{yt?.stopVideo();}catch{}sync();}
 function sync(){const b=panel.querySelector('[data-x-play]');if(b)b.textContent=playing?'Pause':'Play';mini.hidden=panel.open||!playing;
   const now=current?el('span','x-mini-title',current.title):null;
   mini.replaceChildren(...(now?[now]:[]),action('Pause',pause),action('Open',()=>{if(!panel.open)panel.showModal();mini.hidden=true;}),action('Stop',stop));}
 function drawPlayer(){
  view.append(el('h3','',current?current.artist+' · '+current.title:'Loading selection…'));
  const video=el('div','x-video');video.id='x-media-video';view.append(video);
  const controls=el('div','x-transport');const playButton=action('Play',()=>{if(playing)pause();else if(audio){stopOther();audio.play().catch(()=>{status.textContent='Tap Play again to allow audio.';});}else if(yt&&ready)yt.playVideo();else if(current)play(current);});playButton.dataset.xPlay='';
  const sh=action('Shuffle',()=>{shuffle=!shuffle;sh.setAttribute('aria-pressed',String(shuffle));});sh.setAttribute('aria-pressed',String(shuffle));const rp=action('Repeat',()=>{repeat=!repeat;rp.setAttribute('aria-pressed',String(repeat));if(audio)audio.loop=repeat;});rp.setAttribute('aria-pressed',String(repeat));
  controls.append(action('‹',()=>step(-1)),playButton,action('Stop',stop),sh,rp,action('›',()=>step(1)));controls.firstChild.setAttribute('aria-label','Previous track');controls.lastChild.setAttribute('aria-label','Next track');view.append(controls);
  const seek=el('input');seek.type='range';seek.min=0;seek.max=1;seek.value=0;seek.disabled=true;seek.setAttribute('aria-label','Track position');seek.dataset.xSeek='';seek.onchange=()=>{if(audio)audio.currentTime=Number(seek.value);else if(ready)yt.seekTo(Number(seek.value),true);};const vol=el('input');vol.type='range';vol.min=0;vol.max=100;vol.value=70;vol.setAttribute('aria-label','Volume');vol.oninput=()=>{if(audio)audio.volume=Number(vol.value)/100;if(ready)yt.setVolume(Number(vol.value));};const l=el('label','x-slider','Volume');l.append(vol);view.append(seek,l,status);
  view.append(action('Expand player ↗',()=>{const f=video.querySelector('iframe');f?.requestFullscreen?.().catch(()=>{status.textContent='Use the video fullscreen control.';});}));
 }
 async function play(t){
  const token=++epoch;try{yt?.destroy();}catch{}yt=null;ready=false;if(audio)audio.pause();audio=null;current=t;playing=false;view.replaceChildren();drawPlayer();stopOther();const video=$('#x-media-video');
  if(t.src||t.audioId){audio=t.audioId?document.getElementById(t.audioId):new Audio(t.src);if(!audio){status.textContent='The site soundtrack is unavailable on this page.';return;}audio.loop=repeat;audio.volume=.7;const img=el('img');img.src=asset('icon-192.png');img.alt=cfg.name;video.append(img);audio.onplay=()=>{playing=true;sync();};audio.onpause=()=>{playing=false;sync();};audio.onended=()=>repeat?audio.play():step(1);audio.onerror=()=>{status.textContent='Audio could not load. Choose another selection.';};try{await audio.play();}catch{status.textContent='Tap Play to start audio.';}return;}
  try{const YT=await api();if(token!==epoch)return;const target=el('div');video.append(target);yt=new YT.Player(target,{host:'https://www.youtube-nocookie.com',...(t.videoId?{videoId:t.videoId}:{}),playerVars:{autoplay:1,playsinline:1,rel:0,...(t.listId?{listType:'playlist',list:t.listId}:{})},events:{onReady:e=>{if(token!==epoch)return;ready=true;e.target.setVolume(70);e.target.playVideo();},onStateChange:e=>{if(token!==epoch)return;playing=e.data===1;if(e.data===0){if(repeat){yt.seekTo(0,true);yt.playVideo();}else step(1);}sync();},onError:()=>{status.textContent='This video cannot play here. Choose another selection or use its YouTube source.';const link=el('a','x-action','Open on YouTube');link.href=t.videoId?'https://www.youtube.com/watch?v='+t.videoId:'https://www.youtube.com/playlist?list='+t.listId;link.target='_blank';link.rel='noopener';status.append(link);}}});}catch(e){status.textContent=e.message;const source=el('a','x-action','Open on YouTube');source.href=t.videoId?'https://www.youtube.com/watch?v='+t.videoId:'https://www.youtube.com/playlist?list='+t.listId;source.target='_blank';source.rel='noopener';status.append(source);}
 }
 function step(direction){if(!queue.length)return;index=shuffle&&queue.length>1?(index+1+Math.floor(Math.random()*(queue.length-1)))%queue.length:(index+direction+queue.length)%queue.length;screen={type:'player'};render();play(queue[index]);}
 panel.addEventListener('close',sync);const updateClock=()=>{const seek=panel.querySelector('[data-x-seek]');if(!seek)return;let duration=0,time=0;try{duration=audio?audio.duration:ready?yt.getDuration():0;time=audio?audio.currentTime:ready?yt.getCurrentTime():0;}catch{}seek.disabled=!Number.isFinite(duration)||duration<=0;seek.max=String(Number.isFinite(duration)?duration:1);if(document.activeElement!==seek)seek.value=String(time||0);};timer=setInterval(updateClock,750);
 function open(){if(current&&playing&&screen.type==='player'){if(!panel.open)panel.showModal();mini.hidden=true;return;}stack=[];screen={type:'root'};render();if(!panel.open)panel.showModal();mini.hidden=true;}
 document.addEventListener('click',e=>{const trigger=e.target.closest?.(cfg.mediaTrigger||'[data-no-media]');if(trigger){e.preventDefault();e.stopImmediatePropagation();open();}},true);
 if(!$(cfg.mediaTrigger||'[data-no-media]')){
  const b=action('',open);b.setAttribute('aria-label','Open '+cfg.name+' Jukebox');b.title='Jukebox';
  if(cfg.slug==='MentalHealthDiscussions'){
   b.classList.add('x-mhd-soundbars');b.innerHTML='<span></span><span></span><span></span>';b.dataset.tip='Jukebox';b.title='Jukebox';
  }else b.textContent='♫';
  const mediaHost=$(cfg.header)||$('header')||document.body;
  const menuToggle=cfg.slug==='MentalHealthDiscussions'?mediaHost.querySelector('.x-menu-toggle'):null;
  if(menuToggle)mediaHost.insertBefore(b,menuToggle);else mediaHost.append(b);
 }
 all(cfg.replacePanel||'[data-no-panel]').forEach(n=>{n.classList.add('x-hidden-nav');n.style.setProperty('display','none','important');});
 window.addEventListener('pagehide',()=>{clearInterval(timer);stop();epoch++;try{yt?.destroy();}catch{}yt=null;ready=false;local.forEach(t=>URL.revokeObjectURL(t.src));local=[];});
 window.addEventListener('pageshow',e=>{if(e.persisted){stack=[];screen={type:'root'};queue=queue.filter(t=>!t.local);if(current?.local)current=null;render();timer=setInterval(updateClock,750);}});
 document.addEventListener('play',e=>{if(playing&&e.target!==audio&&e.target.matches?.('audio,video'))pause();},true);render();
}
function init(){
 const body=document.body;body.dataset.siteSlug=cfg.slug;for(const [key,value] of Object.entries({high:cfg.high,mid:cfg.mid,low:cfg.low,ink:cfg.ink}))body.style.setProperty('--x-'+key,value);
 const link=el('link');link.rel='stylesheet';link.href=asset('site-experience.css?v=20261015-quiet');document.head.append(link);
 function syncTheme(){const m=getComputedStyle(document.body).color.match(/[\d.]+/g)||[240,240,240];const light=cfg.slug!=='ie'&&(+m[0]*.2126 + +m[1]*.7152 + +m[2]*.0722)<145;body.style.setProperty('--x-panel',light?'#f1eee7':'#0c100f');body.style.setProperty('--x-text',light?'#262923':'#eee');}
 syncTheme();for(const n of [document.body,document.documentElement])new MutationObserver(syncTheme).observe(n,{attributes:true,attributeFilter:['class','data-theme']});
 addMenu();brandNative();genericPlayer();
 // ETP creates its jukebox on demand, so apply the same branding when it appears.
 if(cfg.slug==='examine-the-past-home')new MutationObserver(()=>{if($('.etp-jukebox-card:not(.x-native-panel)'))brandNative();}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();
