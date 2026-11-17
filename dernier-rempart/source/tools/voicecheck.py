# Growl check: dogs (and the old synth) have strong fast amplitude flutter (15-60 Hz); human moans are smooth (energy < 10 Hz).
# Also reports pitch (autocorrelation) and the two strongest spectral peaks below 3 kHz (rough formants).
import sys, subprocess, numpy as np
def load(f):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
for f in sys.argv[1:]:
    x = load(f); sr = 16000
    if len(x) < sr // 4: print(f, 'empty'); continue
    a = np.abs(x); k = int(sr / 200); env = np.convolve(a, np.ones(k) / k, mode='same')[::40]; esr = sr / 40
    on = env > env.max() * 0.15; env = env[on] if on.sum() > 40 else env
    env = env - env.mean(); sp = np.abs(np.fft.rfft(env * np.hanning(len(env)))) ** 2; fr = np.fft.rfftfreq(len(env), 1 / esr)
    fast = sp[(fr > 15) & (fr < 60)].sum(); slow = sp[(fr > 0.5) & (fr < 10)].sum()
    seg = x[np.argmax(np.abs(x) > np.abs(x).max() * 0.3):][: sr // 4]
    ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]; lo, hi = sr // 400, sr // 50; lag = lo + np.argmax(ac[lo:hi])
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); F = np.fft.rfftfreq(len(seg), 1 / sr); m = (F > 200) & (F < 3000)
    Sm = np.convolve(S[m], np.ones(25) / 25, 'same'); idx = np.argsort(Sm)[::-1]; peaks = []
    for i in idx:
        fq = F[m][i]
        if all(abs(fq - p) > 250 for p in peaks): peaks.append(fq)
        if len(peaks) == 2: break
    print(f"{f.split('/')[-1]:24s} flutter/smooth={fast / max(slow, 1e-12):6.3f}  pitch~{sr / lag:5.0f} Hz  peaks {sorted(int(p) for p in peaks)}")
