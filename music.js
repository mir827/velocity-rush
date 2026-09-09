// "Afterglow Drift" is an original, offline-rendered 24-second electro/breakbeat cue.
// Generated from scripts/render_afterglow_audio.py; no third-party samples, music, or assets.
export class Music {
 constructor(){this.enabled=true;this.volume=.35;this.stage=0;this.notes=0;this.active=false;this.audio=new Audio('./assets/afterglow-drift.ogg');this.audio.loop=true;this.audio.preload='auto';}
 async start(stage=0){this.stage=stage;this.active=true;if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume;this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=2048;this.source=this.ctx.createMediaElementSource(this.audio);this.source.connect(this.master).connect(this.analyser).connect(this.ctx.destination);}
  this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.ctx.currentTime,.04);await this.ctx.resume();if(this.enabled){try{await this.audio.play();this.notes+=8;}catch{this.enabled=false;}}}
 pause(){this.active=false;this.audio.pause();return this.ctx?.suspend();}
 setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(this.enabled?v:0,this.ctx.currentTime,.04);}
 toggle(){this.enabled=!this.enabled;if(this.enabled)this.start(this.stage);else {this.audio.pause();this.setVolume(this.volume);}return this.enabled;}
 signal(){if(!this.analyser)return 0;const a=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(a);return Math.sqrt(a.reduce((s,v)=>s+v*v,0)/a.length);}
}
