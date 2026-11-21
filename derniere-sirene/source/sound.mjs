const notes=[48,51,55,58,46,50,53,57];

export class Audio {
  async wake() {
    try {
      if(!this.ctx) {
        this.ctx=new (window.AudioContext||window.webkitAudioContext)();
        this.noise=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);
        const values=this.noise.getChannelData(0);
        for(let i=0;i<values.length;i++) values[i]=Math.random()*2-1;
      }
      if(this.ctx.state==='suspended') await this.ctx.resume();
    } catch { /* Play remains available in browsers that disable audio. */ }
  }
  voice(from,to,len,volume,type='sine',when=0) {
    if(this.ctx?.state!=='running') return;
    const now=this.ctx.currentTime+when;
    const osc=this.ctx.createOscillator(), gain=this.ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(from,now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(18,to),now+len);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(volume,now+Math.min(.035,len*.4));
    gain.gain.exponentialRampToValueAtTime(.0001,now+len);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now+len+.02);
  }
  rustle(freq,len,volume) {
    if(this.ctx?.state!=='running') return;
    const t=this.ctx.currentTime;
    const src=this.ctx.createBufferSource(), filter=this.ctx.createBiquadFilter(), gain=this.ctx.createGain();
    src.buffer=this.noise;
    filter.type='lowpass';
    filter.frequency.setValueAtTime(freq,t);
    filter.frequency.exponentialRampToValueAtTime(57,t+len);
    gain.gain.setValueAtTime(volume,t);
    gain.gain.exponentialRampToValueAtTime(.0001,t+len);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t);
    src.stop(t+len+.02);
  }
  tick(events,opts,live,active) {
    if(this.ctx?.state!=='running') return;
    const time=this.ctx.currentTime, types=new Set(events.map(e=>e.type));
    if(opts.sound) {
      if(types.has('shot')&&time>(this.lastShot||0)) {
        this.rustle(1600,.11,.034); this.lastShot=time+.085;
      }
      if(types.has('blast')||types.has('collapse')) {
        this.rustle(550,.66,.08);this.voice(83,25,.49,.066,'triangle');
      }
      if(types.has('flame')) this.rustle(2100,.34,.031);
      if(types.has('infect')&&time>(this.lastGrowl||0)) {
        this.voice(89,46,.31,.032,'sawtooth');this.lastGrowl=time+.31;
      }
      if(types.has('siren')||types.has('boss')||types.has('wave')||types.has('breach')) {
        this.voice(280,490,.42,.041,'triangle');this.voice(490,260,.63,.042,'triangle',.37);
      }
      if(types.has('support')&&events.some(e=>e.id==='heli'||e.id==='air')) {
        for(let n=0;n<12;n++) this.voice(70-n*2,37,.18,.027,'triangle',n*.11);
      }
      if(types.has('build')||types.has('level')) this.voice(520,680,.14,.029,'triangle');
      if(types.has('rescue')&&time>(this.lastRescue||0)) {
        this.voice(482,660,.20,.019);this.lastRescue=time+.37;
      }
    }
    if(!opts.music||!active||time<(this.next||0)) return;
    const n=this.note||0, pitch=440*2**((notes[n%8]-(live?14:0)-69)/12);
    this.voice(pitch,pitch*(live?.985:1),live?.57:1.68,.027,live?'triangle':'sine');
    if(n%4===0) this.voice(pitch*.5,pitch*.5,live?1.32:2.55,.046);
    this.next=time+(live?.36:1.13);
    this.note=n+1;
  }
}
