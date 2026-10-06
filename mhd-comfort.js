(function(){
  var root=document.documentElement;
  var STORE={theme:"mhd-theme",mode:"mhd-mode",motion:"mhd-motion",volume:"mhd-audio-volume"};
  function get(k,f){try{return localStorage.getItem(k)||f}catch(e){return f}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  var state={
    theme:get(STORE.theme,"sage"),
    mode:get(STORE.mode,"on"),
    motion:get(STORE.motion,"quiet"),
    volume:Number(get(STORE.volume,"0.24"))
  };
  if(!["sage","mist","linen","slate","contrast"].includes(state.theme))state.theme="sage";
  if(!["on","low","off"].includes(state.mode))state.mode="on";
  if(!["quiet","subtle"].includes(state.motion))state.motion="quiet";
  if(!Number.isFinite(state.volume)||state.volume<0||state.volume>1)state.volume=.24;
  var audio=null,objectURL=null;

  function transition(){root.classList.add("mhd-theme-changing");clearTimeout(transition.t);transition.t=setTimeout(function(){root.classList.remove("mhd-theme-changing")},450)}
  function apply(){
    transition();
    root.dataset.mhdTheme=state.theme;root.dataset.mhdMode=state.mode;root.dataset.mhdMotion=state.motion;
    document.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdThemeChoice===state.theme))});
    document.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdModeChoice===state.mode))});
    document.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdMotionChoice===state.motion))});
  }
  function chooseMode(v){state.mode=v;set(STORE.mode,v);apply()}
  function chooseTheme(v){state.theme=v;set(STORE.theme,v);apply()}
  function chooseMotion(v){state.motion=v;set(STORE.motion,v);apply()}
  function ensureAudio(){if(audio)return audio;audio=document.createElement("audio");audio.preload="metadata";audio.volume=state.volume;document.body.appendChild(audio);return audio}
  function trackName(t){document.querySelectorAll("[data-mhd-track-name]").forEach(function(n){n.textContent=t})}
  function chooseFile(file){if(!file)return;var a=ensureAudio();if(objectURL)URL.revokeObjectURL(objectURL);objectURL=URL.createObjectURL(file);a.src=objectURL;a.volume=state.volume;trackName(file.name+" · session only");a.play().catch(function(){})}
  function playAudio(){var a=ensureAudio();if(!a.src){trackName("Choose a calm track first");return}a.play().catch(function(){})}
  function stopAudio(){var a=ensureAudio();a.pause();try{a.currentTime=0}catch(e){}}
  function setVolume(v){state.volume=Number(v);if(audio)audio.volume=state.volume;set(STORE.volume,String(state.volume));document.querySelectorAll("[data-mhd-volume]").forEach(function(x){x.value=String(state.volume)})}

  function guideMe(){
    if(typeof window.restartGuide==="function"){window.restartGuide();return}
    window.location.href="index.html?guide=1";
  }

  function routeAssistant(q){
    var s=String(q||"").toLowerCase();
    if(!s.trim())return {text:"Tell me what you are trying to find, or choose one of the quick paths above.",href:"tools.html",label:"Open Research & Tools"};
    if(/suicid|kill myself|hurt myself|hurt someone|overdose|immediate danger|can't stay safe|cant stay safe/.test(s))return {text:"This sounds like it may need live crisis support rather than website navigation. In the U.S., call or text 988. For immediate danger or a medical emergency, call 911.",href:"crisis-legal.html",label:"Open Crisis & Hospital Navigation"};
    if(/family|caregiver|son|daughter|spouse|brother|sister|refus|won't take|wont take|doesn't believe|doesnt believe|anosognosia/.test(s))return {text:"The Family / Caregiver Center is the best starting point, especially for treatment refusal, lack of insight, communication, and family information-sharing.",href:"family-caregiver.html",label:"Open Family / Caregiver Center"};
    if(/hospital|hold|commit|302|5150|baker|tdo|eco|involuntary|emergency petition|legal|law/.test(s))return {text:"The Crisis, Hospital & Legal Center explains emergency evaluation, voluntary and involuntary care, discharge, rights, and state-specific law.",href:"crisis-legal.html",label:"Open Crisis, Hospital & Legal Center"};
    if(/state|maryland|virginia|pennsylvania|district of columbia|dc law/.test(s))return {text:"Use State-by-State Law Intelligence to compare verified emergency-evaluation and civil-commitment rules by jurisdiction.",href:"state-law.html",label:"Open State Law Intelligence"};
    if(/appointment|doctor|psychiatrist|what should i tell|prepare|visit tomorrow/.test(s))return {text:"The Appointment Prep Builder can organize symptoms, timeline, medications, treatment history, family observations, questions, and goals into a provider-ready summary.",href:"appointment-builder.html",label:"Open Appointment Prep"};
    if(/medicat|drug|pill|side effect|interaction|zoloft|prozac|lithium|abilify|seroquel|xanax/.test(s))return {text:"The Medication Guide is the best starting point for uses, side effects, monitoring, questions for a prescriber, family watch-points, and comparisons.",href:"medication-guide.html",label:"Open Medication Guide"};
    if(/therapy|treatment|cbt|dbt|emdr|ect|tms|ketamine|esketamine|iop|php/.test(s))return {text:"Treatment & Therapy Intelligence explains what different therapies and higher-level treatments actually involve and lets you compare options.",href:"treatment-guide.html",label:"Open Treatment & Therapy Guide"};
    if(/depress|anxiety|panic|bipolar|mania|psychosis|schizo|ocd|ptsd|adhd|condition|symptom|diagnosis/.test(s))return {text:"The Conditions & Symptoms Intelligence Center is the best place to understand symptom patterns, evaluation, common treatment pathways, and what else clinicians may need to rule out.",href:"condition-guide.html",label:"Open Conditions & Symptoms"};
    return {text:"Research & Tools is the broadest starting point. You can also use Guide Me for a short route to the right section.",href:"tools.html",label:"Open Research & Tools"};
  }

  function assistantResult(q){
    var x=routeAssistant(q),box=document.getElementById("mhdAssistantResult");
    box.innerHTML="";
    var p=document.createElement("p");p.textContent=x.text;box.appendChild(p);
    var a=document.createElement("a");a.href=x.href;a.textContent=x.label;box.appendChild(a);
  }

  function buildAssistant(){
    if(document.getElementById("mhdSiteAssistant"))return;
    var p=document.createElement("section");p.id="mhdSiteAssistant";p.hidden=true;p.setAttribute("aria-label","Site Assistant");
    p.innerHTML='<div class="mhd-assistant-head"><div><strong>Site Assistant</strong><span>Tell me what you need and I’ll point you to the right MHD resource.</span></div><button class="mhd-assistant-close" aria-label="Close Site Assistant">×</button></div>'+
      '<div class="mhd-assistant-quick">'+
      '<button data-route="family">Helping a family member</button><button data-route="appointment">Prepare for an appointment</button>'+
      '<button data-route="medication">Medication question</button><button data-route="therapy">Treatment or therapy</button>'+
      '<button data-route="hospital">Hospital / crisis / legal</button><button data-route="condition">Understand symptoms</button>'+
      '</div>'+
      '<div class="mhd-assistant-box"><textarea id="mhdAssistantQuestion" placeholder="What are you trying to find?"></textarea><button class="mhd-header-action mhd-assistant-send" type="button">Find the right place</button><div id="mhdAssistantResult">Choose a quick path or type a question.</div></div>';
    document.body.appendChild(p);
    p.querySelector(".mhd-assistant-close").addEventListener("click",function(){p.hidden=true});
    p.querySelectorAll("[data-route]").forEach(function(b){b.addEventListener("click",function(){assistantResult(b.dataset.route)})});
    p.querySelector(".mhd-assistant-send").addEventListener("click",function(){assistantResult(document.getElementById("mhdAssistantQuestion").value)});
    document.getElementById("mhdAssistantQuestion").addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();assistantResult(this.value)}});
  }

  function toggleAssistant(){
    var p=document.getElementById("mhdSiteAssistant");if(!p)return;p.hidden=!p.hidden;
    if(!p.hidden)setTimeout(function(){var q=document.getElementById("mhdAssistantQuestion");if(q)q.focus()},50);
  }

  function buildHeader(){
    var target=null,brand=null;
    var topbar=document.querySelector(".topbar .nav");
    if(topbar){target=topbar;brand=topbar.querySelector(".brand")}
    if(!target){var top=document.querySelector(".top .nav");if(top){target=top;brand=top.querySelector(".brand")}}
    if(!target){var hi=document.querySelector(".header .headinner");if(hi){target=hi;brand=hi.querySelector(".wordmark")}}
    if(!target)return;

    if(!target.querySelector(".mhd-header-actions")){
      var actions=document.createElement("div");actions.className="mhd-header-actions";
      actions.innerHTML='<a class="mhd-header-action" href="tools.html">Research & Tools</a><button class="mhd-header-action" type="button" id="mhdGuideButton">Guide Me</button><button class="mhd-header-action" type="button" id="mhdAssistantButton">Site Assistant</button>';
      target.appendChild(actions);
      actions.querySelector("#mhdGuideButton").addEventListener("click",guideMe);
      actions.querySelector("#mhdAssistantButton").addEventListener("click",toggleAssistant);
    }

    if(!target.querySelector(".mhd-page-nav")){
      var pages=document.createElement("div");pages.className="mhd-page-nav";pages.setAttribute("aria-label","Main site pages");
      var links=[
        ["index.html","Home"],
        ["condition-guide.html","Conditions & Symptoms"],
        ["medication-guide.html","Medication"],
        ["treatment-guide.html","Treatment & Therapy"],
        ["appointment-builder.html","Appointment Prep"],
        ["family-caregiver.html","Family / Caregiver"],
        ["crisis-legal.html","Crisis & Legal"],
        ["state-law.html","State Law"]
      ];
      var current=(location.pathname.split("/").pop()||"index.html").toLowerCase();
      pages.innerHTML=links.map(function(x){
        var here=current===x[0].toLowerCase()?' aria-current="page"':'';
        return '<a href="'+x[0]+'"'+here+'>'+x[1]+'</a>';
      }).join("");
      target.appendChild(pages);
    }
    root.classList.add("mhd-universal-header");
  }
  function buildComfort(){
    if(document.getElementById("mhdComfortDock"))return;
    var dock=document.createElement("div");dock.id="mhdComfortDock";
    dock.innerHTML='<button id="mhdComfortToggle" aria-expanded="false" aria-controls="mhdComfortPanel">Comfort</button>'+
      '<section id="mhdComfortPanel" hidden aria-label="Comfort and sound settings">'+
      '<div class="mhd-comfort-head"><div><strong>Comfort settings</strong><span>Change the page to what feels easiest to read.</span></div><button class="mhd-comfort-close" aria-label="Close comfort settings">×</button></div>'+
      '<div class="mhd-control-group"><div class="mhd-control-label">Lighting</div><div class="mhd-segment"><button data-mhd-mode-choice="on">Lights On</button><button data-mhd-mode-choice="low">Lights Low</button><button data-mhd-mode-choice="off">Turn Out Lights</button></div></div>'+
      '<div class="mhd-control-group"><div class="mhd-control-label">Soft color</div><div class="mhd-segment five"><button data-mhd-theme-choice="sage">Sage</button><button data-mhd-theme-choice="mist">Soft Blue</button><button data-mhd-theme-choice="linen">Warm Beige</button><button data-mhd-theme-choice="slate">Soft Slate</button><button data-mhd-theme-choice="contrast">Clear</button></div><p class="mhd-comfort-note">Comfort choices only — MHD does not assign colors by diagnosis.</p></div>'+
      '<div class="mhd-control-group"><div class="mhd-control-label">Motion</div><div class="mhd-segment"><button data-mhd-motion-choice="quiet">Quiet</button><button data-mhd-motion-choice="subtle">Subtle</button><button disabled>OS Reduce Motion</button></div></div>'+
      '<div class="mhd-control-group"><div class="mhd-control-label">Calm sound</div><div class="mhd-audio-row"><label for="mhdPanelFile">Choose Track</label><input class="mhd-audio-file" id="mhdPanelFile" type="file" accept="audio/*"><button id="mhdPanelPlay" type="button">Play</button><button id="mhdPanelStop" type="button">Stop</button><label>Volume <input data-mhd-volume id="mhdPanelVolume" type="range" min="0" max="1" step=".01" value="'+state.volume+'"></label></div><div class="mhd-audio-name" data-mhd-track-name>Sound off</div>'+
      '<div class="mhd-radio-list"><a href="https://live365.com/station/The-Movement-a29060" target="_blank" rel="noopener"><span>The Movement<small>Wellness talk + music</small></span><span>Open</span></a><a href="https://live365.com/station/Purrple-Cat-LoFi-No-Ads-a30440" target="_blank" rel="noopener"><span>Purrple Cat<small>Lo-Fi / meditation</small></span><span>Open</span></a><a href="https://tunein.com/radio/Radio-Art---Sleep-s187594/" target="_blank" rel="noopener"><span>Radio Art — Sleep<small>Relaxing music + natural sounds</small></span><span>Open</span></a></div><p class="mhd-comfort-note">Third-party stations are optional listening, not medical treatment recommendations. Sound never starts automatically.</p></div></section>';
    document.body.appendChild(dock);
    var toggle=document.getElementById("mhdComfortToggle"),panel=document.getElementById("mhdComfortPanel");
    function open(v){panel.hidden=!v;toggle.setAttribute("aria-expanded",String(v))}
    toggle.addEventListener("click",function(){open(panel.hidden)});
    dock.querySelector(".mhd-comfort-close").addEventListener("click",function(){open(false)});
    dock.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.addEventListener("click",function(){chooseMode(b.dataset.mhdModeChoice)})});
    dock.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.addEventListener("click",function(){chooseTheme(b.dataset.mhdThemeChoice)})});
    dock.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){b.addEventListener("click",function(){chooseMotion(b.dataset.mhdMotionChoice)})});
    document.getElementById("mhdPanelFile").addEventListener("change",function(e){chooseFile(e.target.files&&e.target.files[0])});
    document.getElementById("mhdPanelPlay").addEventListener("click",playAudio);
    document.getElementById("mhdPanelStop").addEventListener("click",stopAudio);
    document.getElementById("mhdPanelVolume").addEventListener("input",function(){setVolume(this.value)});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){open(false);var a=document.getElementById("mhdSiteAssistant");if(a)a.hidden=true}});
  }

  function maybeStartGuide(){
    try{var q=new URLSearchParams(location.search);if(q.get("guide")==="1"&&typeof window.restartGuide==="function")setTimeout(function(){window.restartGuide()},80)}catch(e){}
  }

  function build(){buildAssistant();buildHeader();buildComfort();apply();setVolume(state.volume);maybeStartGuide()}
  apply();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();