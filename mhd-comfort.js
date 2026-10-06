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

  var audio=null, objectURL=null;

  function animateThemeChange(){
    root.classList.add("mhd-theme-changing");
    clearTimeout(animateThemeChange._t);
    animateThemeChange._t=setTimeout(function(){root.classList.remove("mhd-theme-changing")},450);
  }
  function apply(){
    animateThemeChange();
    root.dataset.mhdTheme=state.theme;
    root.dataset.mhdMode=state.mode;
    root.dataset.mhdMotion=state.motion;
    document.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){
      b.setAttribute("aria-pressed",String(b.dataset.mhdThemeChoice===state.theme));
    });
    document.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){
      b.setAttribute("aria-pressed",String(b.dataset.mhdModeChoice===state.mode));
    });
    document.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){
      b.setAttribute("aria-pressed",String(b.dataset.mhdMotionChoice===state.motion));
    });
  }

  function selectMode(v){state.mode=v;set(STORE.mode,v);apply()}
  function selectTheme(v){state.theme=v;set(STORE.theme,v);apply()}
  function selectMotion(v){state.motion=v;set(STORE.motion,v);apply()}

  function ensureAudio(){
    if(audio)return audio;
    audio=document.createElement("audio");
    audio.id="mhdSharedAudio";
    audio.preload="metadata";
    audio.volume=state.volume;
    document.body.appendChild(audio);
    return audio;
  }

  function chooseAudio(file){
    if(!file)return;
    var a=ensureAudio();
    if(objectURL)URL.revokeObjectURL(objectURL);
    objectURL=URL.createObjectURL(file);
    a.src=objectURL;
    a.volume=state.volume;
    updateTrackName(file.name+" · session only");
    a.play().catch(function(){});
  }
  function updateTrackName(text){
    document.querySelectorAll("[data-mhd-track-name]").forEach(function(n){n.textContent=text});
  }
  function playAudio(){
    var a=ensureAudio();
    if(!a.src){updateTrackName("Choose a calm track first");return}
    a.play().catch(function(){});
  }
  function stopAudio(){
    var a=ensureAudio();a.pause();try{a.currentTime=0}catch(e){}
  }
  function setVolume(v){
    state.volume=Number(v);if(audio)audio.volume=state.volume;set(STORE.volume,String(state.volume));
    document.querySelectorAll("[data-mhd-volume]").forEach(function(x){x.value=String(state.volume)});
  }

  function buildRail(){
    if(document.getElementById("mhdComfortRail"))return;
    var rail=document.createElement("div");
    rail.id="mhdComfortRail";
    rail.setAttribute("aria-label","Display comfort and calm sound controls");
    rail.innerHTML=
      '<span class="mhd-rail-title">Comfort View</span>'+
      '<div class="mhd-rail-group"><span class="mhd-rail-label">Light</span>'+
        '<button data-mhd-mode-choice="on" type="button">Lights On</button>'+
        '<button data-mhd-mode-choice="low" type="button">Lights Low</button>'+
        '<button data-mhd-mode-choice="off" type="button">Turn Out Lights</button>'+
      '</div>'+
      '<div class="mhd-rail-group"><span class="mhd-rail-label">Color</span>'+
        '<button data-mhd-theme-choice="sage" type="button">Sage</button>'+
        '<button data-mhd-theme-choice="mist" type="button">Soft Blue</button>'+
        '<button data-mhd-theme-choice="linen" type="button">Warm Beige</button>'+
        '<button data-mhd-theme-choice="slate" type="button">Soft Slate</button>'+
      '</div>'+
      '<div class="mhd-rail-group"><span class="mhd-rail-label">Sound</span>'+
        '<label for="mhdRailFile">Choose Track</label><input id="mhdRailFile" type="file" accept="audio/*">'+
        '<button id="mhdRailPlay" type="button">Play</button><button id="mhdRailStop" type="button">Stop</button>'+
        '<input data-mhd-volume id="mhdRailVolume" aria-label="Sound volume" type="range" min="0" max="1" step=".01" value="'+state.volume+'">'+
        '<span id="mhdRailTrack" data-mhd-track-name>Sound off</span>'+
      '</div>'+
      '<button class="mhd-more" id="mhdMoreComfort" type="button">More</button>';
    document.body.appendChild(rail);

    rail.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.addEventListener("click",function(){selectMode(b.dataset.mhdModeChoice)})});
    rail.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.addEventListener("click",function(){selectTheme(b.dataset.mhdThemeChoice)})});
    document.getElementById("mhdRailFile").addEventListener("change",function(e){chooseAudio(e.target.files&&e.target.files[0])});
    document.getElementById("mhdRailPlay").addEventListener("click",playAudio);
    document.getElementById("mhdRailStop").addEventListener("click",stopAudio);
    document.getElementById("mhdRailVolume").addEventListener("input",function(){setVolume(this.value)});
    document.getElementById("mhdMoreComfort").addEventListener("click",function(){
      var panel=document.getElementById("mhdComfortPanel"),toggle=document.getElementById("mhdComfortToggle");
      if(panel){panel.hidden=false;if(toggle)toggle.setAttribute("aria-expanded","true")}
    });
  }

  function buildPanel(){
    if(document.getElementById("mhdComfortDock"))return;
    var dock=document.createElement("div");dock.id="mhdComfortDock";
    dock.innerHTML=
      '<button id="mhdComfortToggle" aria-expanded="false" aria-controls="mhdComfortPanel">Comfort</button>'+
      '<section id="mhdComfortPanel" hidden aria-label="Comfort and sound settings">'+
        '<div class="mhd-comfort-head"><div><strong>Comfort settings</strong><span>Change the page to what feels easiest to read.</span></div><button class="mhd-comfort-close" aria-label="Close comfort settings">×</button></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Lighting</div><div class="mhd-segment">'+
          '<button data-mhd-mode-choice="on">Lights On</button><button data-mhd-mode-choice="low">Lights Low</button><button data-mhd-mode-choice="off">Turn Out Lights</button>'+
        '</div></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Soft color</div><div class="mhd-segment five">'+
          '<button data-mhd-theme-choice="sage">Sage</button><button data-mhd-theme-choice="mist">Soft Blue</button><button data-mhd-theme-choice="linen">Warm Beige</button><button data-mhd-theme-choice="slate">Soft Slate</button><button data-mhd-theme-choice="contrast">Clear</button>'+
        '</div><p class="mhd-comfort-note">Comfort choices only — MHD does not assign colors by diagnosis.</p></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Motion</div><div class="mhd-segment">'+
          '<button data-mhd-motion-choice="quiet">Quiet</button><button data-mhd-motion-choice="subtle">Subtle</button><button disabled>OS Reduce Motion</button>'+
        '</div></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Calm sound</div>'+
          '<div class="mhd-audio-row"><label for="mhdPanelFile">Choose Track</label><input class="mhd-audio-file" id="mhdPanelFile" type="file" accept="audio/*"><button id="mhdPanelPlay" type="button">Play</button><button id="mhdPanelStop" type="button">Stop</button><label>Volume <input data-mhd-volume id="mhdPanelVolume" type="range" min="0" max="1" step=".01" value="'+state.volume+'"></label></div>'+
          '<div class="mhd-audio-name" data-mhd-track-name>Sound off</div>'+
          '<div class="mhd-radio-list">'+
            '<a href="https://live365.com/station/The-Movement-a29060" target="_blank" rel="noopener"><span>The Movement<small>Wellness talk + music</small></span><span>Open</span></a>'+
            '<a href="https://live365.com/station/Purrple-Cat-LoFi-No-Ads-a30440" target="_blank" rel="noopener"><span>Purrple Cat<small>Lo-Fi / meditation</small></span><span>Open</span></a>'+
            '<a href="https://tunein.com/radio/Radio-Art---Sleep-s187594/" target="_blank" rel="noopener"><span>Radio Art — Sleep<small>Relaxing music + natural sounds</small></span><span>Open</span></a>'+
          '</div><p class="mhd-comfort-note">Third-party stations are optional listening, not medical treatment recommendations. MHD never starts sound automatically.</p>'+
        '</div>'+
      '</section>';
    document.body.appendChild(dock);

    var toggle=document.getElementById("mhdComfortToggle"),panel=document.getElementById("mhdComfortPanel");
    function open(v){panel.hidden=!v;toggle.setAttribute("aria-expanded",String(v))}
    toggle.addEventListener("click",function(){open(panel.hidden)});
    dock.querySelector(".mhd-comfort-close").addEventListener("click",function(){open(false)});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!panel.hidden)open(false)});
    dock.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.addEventListener("click",function(){selectMode(b.dataset.mhdModeChoice)})});
    dock.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.addEventListener("click",function(){selectTheme(b.dataset.mhdThemeChoice)})});
    dock.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){b.addEventListener("click",function(){selectMotion(b.dataset.mhdMotionChoice)})});
    document.getElementById("mhdPanelFile").addEventListener("change",function(e){chooseAudio(e.target.files&&e.target.files[0])});
    document.getElementById("mhdPanelPlay").addEventListener("click",playAudio);
    document.getElementById("mhdPanelStop").addEventListener("click",stopAudio);
    document.getElementById("mhdPanelVolume").addEventListener("input",function(){setVolume(this.value)});
  }

  function build(){
    buildRail();
    buildPanel();
    apply();
    setVolume(state.volume);
  }
  apply();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();