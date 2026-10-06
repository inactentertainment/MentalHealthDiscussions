(function(){
  var root=document.documentElement;
  var STORE={theme:"mhd-theme",mode:"mhd-mode",motion:"mhd-motion",volume:"mhd-audio-volume"};
  function get(k,f){try{return localStorage.getItem(k)||f}catch(e){return f}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  var state={
    theme:get(STORE.theme,"sage"),
    mode:get(STORE.mode,window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"low":"on"),
    motion:get(STORE.motion,"quiet"),
    volume:Number(get(STORE.volume,"0.28"))
  };
  if(!["sage","mist","linen","slate","contrast"].includes(state.theme))state.theme="sage";
  if(!["on","low","off"].includes(state.mode))state.mode="on";
  if(!["quiet","subtle"].includes(state.motion))state.motion="quiet";
  if(!Number.isFinite(state.volume)||state.volume<0||state.volume>1)state.volume=.28;

  function apply(){
    root.dataset.mhdTheme=state.theme;
    root.dataset.mhdMode=state.mode;
    root.dataset.mhdMotion=state.motion;
    document.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdThemeChoice===state.theme))});
    document.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdModeChoice===state.mode))});
    document.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.mhdMotionChoice===state.motion))});
  }
  apply();

  function build(){
    if(document.getElementById("mhdComfortDock"))return;
    var dock=document.createElement("div");dock.id="mhdComfortDock";
    dock.innerHTML=
      '<button id="mhdComfortToggle" aria-expanded="false" aria-controls="mhdComfortPanel">Comfort</button>'+
      '<section id="mhdComfortPanel" hidden aria-label="Comfort and sound settings">'+
        '<div class="mhd-comfort-head"><div><strong>Comfort settings</strong><span>Your display and sound, your choice.</span></div><button class="mhd-comfort-close" aria-label="Close comfort settings">×</button></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Lighting</div><div class="mhd-segment">'+
          '<button data-mhd-mode-choice="on">Lights On</button><button data-mhd-mode-choice="low">Lights Low</button><button data-mhd-mode-choice="off">Lights Off</button>'+
        '</div></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Calm color</div><div class="mhd-segment five">'+
          '<button data-mhd-theme-choice="sage">Sage</button><button data-mhd-theme-choice="mist">Mist</button><button data-mhd-theme-choice="linen">Linen</button><button data-mhd-theme-choice="slate">Slate</button><button data-mhd-theme-choice="contrast">Clear</button>'+
        '</div><p class="mhd-comfort-note">These are comfort choices, not diagnosis-specific colors.</p></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Motion</div><div class="mhd-segment">'+
          '<button data-mhd-motion-choice="quiet">Quiet</button><button data-mhd-motion-choice="subtle">Subtle</button><button type="button" id="mhdNoMotionInfo" disabled>Controls only</button>'+
        '</div><p class="mhd-comfort-note">MHD defaults to quiet motion. Your operating-system Reduce Motion setting is also respected.</p></div>'+
        '<div class="mhd-control-group"><div class="mhd-control-label">Calm audio</div>'+
          '<div class="mhd-audio-row"><label for="mhdAudioFile">Choose audio</label><input class="mhd-audio-file" id="mhdAudioFile" type="file" accept="audio/*"><button id="mhdAudioPlay" type="button">Play</button><button id="mhdAudioStop" type="button">Stop</button><label>Volume <input id="mhdAudioVolume" type="range" min="0" max="1" step=".01" value="'+state.volume+'"></label></div>'+
          '<div class="mhd-audio-name" id="mhdAudioName">No site audio selected. Audio never starts automatically.</div><audio id="mhdAudio" controls preload="metadata"></audio>'+
          '<div class="mhd-radio-list">'+
            '<a href="https://live365.com/station/The-Movement-a29060" target="_blank" rel="noopener"><span>The Movement<small>Music + wellness talk</small></span><span>Open</span></a>'+
            '<a href="https://live365.com/station/Purrple-Cat-LoFi-No-Ads-a30440" target="_blank" rel="noopener"><span>Purrple Cat<small>Ad-free Lo-Fi / meditation</small></span><span>Open</span></a>'+
            '<a href="https://tunein.com/radio/Radio-Art---Sleep-s187594/" target="_blank" rel="noopener"><span>Radio Art — Sleep<small>Relaxing music + natural sounds</small></span><span>Open</span></a>'+
          '</div><p class="mhd-comfort-note">Radio links are independent third-party services, not treatment recommendations. MHD keeps all background audio off by default.</p>'+
        '</div>'+
      '</section>';
    document.body.appendChild(dock);

    var toggle=document.getElementById("mhdComfortToggle"), panel=document.getElementById("mhdComfortPanel");
    function open(v){panel.hidden=!v;toggle.setAttribute("aria-expanded",String(v))}
    toggle.addEventListener("click",function(){open(panel.hidden)});
    dock.querySelector(".mhd-comfort-close").addEventListener("click",function(){open(false)});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!panel.hidden)open(false)});

    dock.querySelectorAll("[data-mhd-mode-choice]").forEach(function(b){b.addEventListener("click",function(){state.mode=b.dataset.mhdModeChoice;set(STORE.mode,state.mode);apply()})});
    dock.querySelectorAll("[data-mhd-theme-choice]").forEach(function(b){b.addEventListener("click",function(){state.theme=b.dataset.mhdThemeChoice;set(STORE.theme,state.theme);apply()})});
    dock.querySelectorAll("[data-mhd-motion-choice]").forEach(function(b){b.addEventListener("click",function(){state.motion=b.dataset.mhdMotionChoice;set(STORE.motion,state.motion);apply()})});

    var audio=document.getElementById("mhdAudio"),file=document.getElementById("mhdAudioFile"),name=document.getElementById("mhdAudioName"),vol=document.getElementById("mhdAudioVolume");
    var objectURL=null;
    audio.volume=state.volume;
    file.addEventListener("change",function(){
      var f=file.files&&file.files[0];if(!f)return;
      if(objectURL)URL.revokeObjectURL(objectURL);
      objectURL=URL.createObjectURL(f);audio.src=objectURL;name.textContent=f.name+" — selected only in this browser session.";audio.play().catch(function(){});
    });
    document.getElementById("mhdAudioPlay").addEventListener("click",function(){
      if(!audio.src){name.textContent="Choose an audio file first, or open one of the calm radio choices below.";return}
      audio.play().catch(function(){});
    });
    document.getElementById("mhdAudioStop").addEventListener("click",function(){audio.pause();audio.currentTime=0});
    vol.addEventListener("input",function(){state.volume=Number(vol.value);audio.volume=state.volume;set(STORE.volume,String(state.volume))});
    apply();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();