export const wind = { value: 0 };

const LOW_HZ = [40, 500];
const BAND_HZ = [100, 3000];
const FLOOR_DB = -66;
const CEIL_DB = -34;
const MIN_FLATNESS = 0.18;

let audio = null;

const bins = (analyser, [from, to]) => {
  const hz = analyser.context.sampleRate / analyser.fftSize;
  return [Math.max(1, Math.floor(from / hz)), Math.ceil(to / hz)];
};

const power = (db) => 10 ** (db / 10);

const measure = ({ analyser, data, low, band }) => {
  analyser.getFloatFrequencyData(data);

  let lowSum = 0;
  for (let i = low[0]; i < low[1]; i++) lowSum += power(data[i]);
  const level = 10 * Math.log10(lowSum / (low[1] - low[0]) + 1e-12);

  let logSum = 0;
  let sum = 0;
  for (let i = band[0]; i < band[1]; i++) {
    const p = power(data[i]) + 1e-12;
    logSum += Math.log(p);
    sum += p;
  }
  const n = band[1] - band[0];
  const flatness = Math.exp(logSum / n) / (sum / n);

  const loudness = Math.min(1, Math.max(0, (level - FLOOR_DB) / (CEIL_DB - FLOOR_DB)));
  return flatness > MIN_FLATNESS ? loudness : loudness * 0.15;
};

export const startWind = async () => {
  if (audio) return;
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.5;
  context.createMediaStreamSource(stream).connect(analyser);

  audio = {
    stream,
    context,
    analyser,
    data: new Float32Array(analyser.frequencyBinCount),
    low: bins(analyser, LOW_HZ),
    band: bins(analyser, BAND_HZ),
    frame: 0,
  };

  const tick = () => {
    const target = measure(audio);
    const rate = target > wind.value ? 0.35 : 0.06;
    wind.value += (target - wind.value) * rate;
    audio.frame = requestAnimationFrame(tick);
  };
  tick();
};

export const stopWind = () => {
  if (!audio) return;
  cancelAnimationFrame(audio.frame);
  audio.stream.getTracks().forEach((track) => track.stop());
  audio.context.close();
  audio = null;

  const release = () => {
    wind.value *= 0.9;
    if (wind.value > 0.001) requestAnimationFrame(release);
    else wind.value = 0;
  };
  release();
};
