import numpy as np
import wave
from pathlib import Path
sr=48000; dur=24.; n=int(sr*dur); t=np.arange(n)/sr
L=np.zeros(n); R=np.zeros(n)
rng=np.random.default_rng(2309)
def add(x, start, length, pan=0, gain=1):
    a=max(0,int(start*sr)); b=min(n,a+len(x));
    if b<=a:return
    p=np.clip(pan,-1,1); L[a:b]+=x[:b-a]*gain*np.sqrt((1-p)*.5); R[a:b]+=x[:b-a]*gain*np.sqrt((1+p)*.5)
def env(length,a=.01,r=.1):
    z=np.ones(length); aa=min(int(a*sr),length//3); rr=min(int(r*sr),length//2)
    z[:aa]=np.linspace(0,1,aa,endpoint=False); z[-rr:]=np.linspace(1,0,rr,endpoint=False);return z
def osc(freq,length,kind='sine'):
    q=np.arange(int(length*sr))/sr
    if kind=='saw': return 2*((q*freq)%1)-1
    if kind=='tri': return 2*np.abs(2*((q*freq)%1)-1)-1
    return np.sin(2*np.pi*freq*q)
def note(midi,start,length,g=.15,pan=0,kind='tri'):
    f=440*2**((midi-69)/12); q=np.arange(int(length*sr))/sr
    x=(.72*osc(f,length,kind)+.22*osc(f*2,length,'sine')+.06*osc(f*.5,length,'sine'))*env(len(q),.008,min(.22,length*.55))
    add(x,start,length,pan,g)
def kick(start):
    q=np.arange(int(.22*sr))/sr; f=130*np.exp(-q*18)+42; x=np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-q*18)+rng.normal(0,.025,len(q))*np.exp(-q*38); add(x,start,.22,0,.48)
def snare(start):
    q=np.arange(int(.16*sr))/sr; x=(rng.normal(0,1,len(q))*.72+np.sin(2*np.pi*185*q)*.18)*np.exp(-q*27); add(x,start,.16,.08,.2)
def hat(start,open_=False):
    q=np.arange(int((.12 if open_ else .045)*sr))/sr; x=rng.normal(0,1,len(q))*np.exp(-q*(25 if open_ else 80)); add(x,start,len(q)/sr,-.18,.10)
bpm=154; beat=60/bpm; bar=beat*4
# warm side-chain-like pad chords, 12 bars: intro -> beat drop -> lift -> resolve
chords=[[50,57,62,66],[47,54,59,62],[43,50,57,62],[45,52,57,64]]
melody=[74,76,78,81,78,76,74,71,74,76,78,83,81,78,76,74]
for b in range(12):
    st=b*bar; chord=chords[b%4]
    for m in chord:
        q=np.arange(int(bar*1.08*sr))/sr; f=440*2**((m-69)/12); x=(np.sin(2*np.pi*f*q)+.35*np.sin(2*np.pi*f*2*q))*env(len(q),.22,.35)*.075
        # pulsed amplitude for motion
        x*=.55+.45*(np.sin(2*np.pi*q/beat)+1)/2
        add(x,st,bar*1.08,(m-chord[0])*.08,.9)
    for s in range(8):
        at=st+s*beat/2
        note(chord[0]-12,at,beat*.42,.17,-.25,'sine')
        if b>=2:
            if s%2==0:kick(at)
            else: snare(at)
            hat(at+beat*.25,s%4==3)
        if b>=4:
            mm=melody[(b*3+s)%len(melody)] + (12 if b>=8 else 0)
            note(mm,at,beat*.32,.105,.28,'tri')
            if s%2: note(mm-12,at,beat*.18,.042,-.08,'sine')
# final filtered tail and soft impact
for st in [22.7,23.1]: note(81 if st<23 else 86,st,.6,.10,.1,'sine')
# safety normalise and gentle saturation
peak=max(np.max(np.abs(L)),np.max(np.abs(R))); L=np.tanh(L/peak*1.12)*.82; R=np.tanh(R/peak*1.12)*.82
out=Path('assets/afterglow-drift-preview.wav');
with wave.open(str(out),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.column_stack((L,R)).clip(-1,1)*32767).astype('<i2').tobytes())
