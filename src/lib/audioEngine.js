// --------------------------------------------------------------------------
// Zero-asset ambient soundscape generator built on the Web Audio API.
// Generating audio procedurally means the Soundscape Player works instantly
// offline with no audio files to host, license, or download — it also means
// every preset below is built from several *layered* signals (a steady bed
// plus small randomized "events") rather than a single filtered noise
// buffer, which is what makes them read as rain / lofi / white noise
// instead of generic static.
// --------------------------------------------------------------------------

let ctx = null
function getContext() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    ctx = new AudioContextClass()
  }
  return ctx
}

// Builds a mono noise buffer of the requested "color" (spectral tilt) and
// blends a short window at the tail into the head so the loop point is
// inaudible instead of clicking every N seconds.
function makeLoopableNoiseBuffer(context, seconds, color = 'white') {
  const sampleRate = context.sampleRate
  const length = Math.floor(sampleRate * seconds)
  const buffer = context.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Paul Kellet's refined pink-noise filter, plus a simple brownian
  // integrator for "brown" — both sound far smoother/less fatiguing than
  // raw white noise.
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  let brown = 0

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      b6 = white * 0.115926
      data[i] = pink * 0.11
    } else if (color === 'brown') {
      brown = (brown + 0.02 * white) / 1.02
      data[i] = brown * 3.2
    } else {
      // gently tilted white: gone through one light integrator step so
      // it isn't fatiguing, but keeps far more top end than pink/brown
      brown = (brown + 0.35 * white) / 1.35
      data[i] = brown * 1.6 + white * 0.15
    }
  }

  const fadeLen = Math.min(Math.floor(sampleRate * 0.75), Math.floor(length / 4))
  for (let i = 0; i < fadeLen; i++) {
    const t = i / fadeLen
    const headIdx = i
    const tailIdx = length - fadeLen + i
    const mixed = data[headIdx] * t + data[tailIdx] * (1 - t)
    data[headIdx] = mixed
    data[tailIdx] = mixed
  }

  return buffer
}

// A single short, randomized "tick" — a droplet, a vinyl pop, whatever —
// rendered as its own tiny buffer with a fast attack / exponential decay.
function playImpulse(context, destination, { durationSec, filterType, freq, q, peak }) {
  const now = context.currentTime
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * durationSec), context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }

  const source = context.createBufferSource()
  source.buffer = buffer

  const filter = context.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = freq
  filter.Q.value = q

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0, now)
  envelope.gain.linearRampToValueAtTime(peak, now + 0.002)
  envelope.gain.exponentialRampToValueAtTime(0.0008, now + durationSec)

  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(destination)
  source.start(now)
  source.stop(now + durationSec + 0.02)
}

// Repeatedly calls `fn` on a randomized interval between [minMs, maxMs]
// until `.stop()` is called. Returns a disposer.
function startRandomTicker(fn, minMs, maxMs) {
  let stopped = false
  let timeoutId = null
  const tick = () => {
    if (stopped) return
    fn()
    timeoutId = setTimeout(tick, minMs + Math.random() * (maxMs - minMs))
  }
  timeoutId = setTimeout(tick, minMs + Math.random() * (maxMs - minMs))
  return () => {
    stopped = true
    if (timeoutId) clearTimeout(timeoutId)
  }
}

// ---------------------------------------------------------------------------
// File-backed loop: used for the Rain and Sunset presets, which play real
// recorded audio (public/audio/*.mp3) instead of synthesized noise. Decoded
// buffers are cached per URL so switching tracks back and forth doesn't
// re-fetch/re-decode. Loops seamlessly via the Web Audio API's native
// `loop` support (no crossfade needed for a full-length recording).
// ---------------------------------------------------------------------------
const audioBufferCache = new Map()

function loadAudioBuffer(context, url) {
  if (!audioBufferCache.has(url)) {
    audioBufferCache.set(
      url,
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Soundscape file not found: ${url} (${res.status})`)
          return res.arrayBuffer()
        })
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .catch((err) => {
          audioBufferCache.delete(url) // allow retry next time instead of caching a rejected promise
          throw err
        }),
    )
  }
  return audioBufferCache.get(url)
}

function buildFileLoop(context, destination, url) {
  let stopped = false
  let source = null

  const gain = context.createGain()
  gain.connect(destination)

  loadAudioBuffer(context, url)
    .then((buffer) => {
      if (stopped) return
      source = context.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gain)
      source.start(0)
    })
    .catch((err) => {
      console.error('Soundscape: failed to load', url, err)
    })

  return {
    stop() {
      stopped = true
      if (source) {
        try { source.stop() } catch { /* already stopped */ }
        source.disconnect()
      }
      gain.disconnect()
    },
  }
}

// ---------------------------------------------------------------------------
// Lofi: a slow four-chord pad loop (Am7 - Fmaj7 - Cmaj7 - G7) through a warm,
// LFO-modulated low-pass filter, layered with quiet vinyl crackle and a very
// soft, laid-back beat pulse — evokes "lofi hip hop radio" instead of noise.
// ---------------------------------------------------------------------------
const LOFI_CHORDS = [
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
]

function buildLofi(context, destination) {
  const warmthFilter = context.createBiquadFilter()
  warmthFilter.type = 'lowpass'
  warmthFilter.frequency.value = 1600
  warmthFilter.Q.value = 0.4
  warmthFilter.connect(destination)

  const filterLfo = context.createOscillator()
  filterLfo.frequency.value = 0.045
  const filterLfoDepth = context.createGain()
  filterLfoDepth.gain.value = 260
  filterLfo.connect(filterLfoDepth)
  filterLfoDepth.connect(warmthFilter.frequency)
  filterLfo.start()

  const padGain = context.createGain()
  padGain.gain.value = 0.55
  padGain.connect(warmthFilter)

  let chordIndex = 0
  let stopped = false
  const activeOscillators = []
  const CHORD_DURATION = 4.2 // seconds per chord, with overlap for a smooth crossfade

  function playChord(freqs) {
    const now = context.currentTime
    const chordGain = context.createGain()
    chordGain.gain.setValueAtTime(0, now)
    chordGain.gain.linearRampToValueAtTime(0.22, now + 1.4)
    chordGain.gain.setValueAtTime(0.22, now + CHORD_DURATION - 1.6)
    chordGain.gain.linearRampToValueAtTime(0, now + CHORD_DURATION)
    chordGain.connect(padGain)

    freqs.forEach((freq, idx) => {
      const osc = context.createOscillator()
      osc.type = idx === 0 ? 'triangle' : 'sine'
      osc.frequency.value = freq
      osc.detune.value = (Math.random() - 0.5) * 8
      osc.connect(chordGain)
      osc.start(now)
      osc.stop(now + CHORD_DURATION + 0.1)
      activeOscillators.push(osc)
    })
  }

  function scheduleNextChord() {
    if (stopped) return
    playChord(LOFI_CHORDS[chordIndex % LOFI_CHORDS.length])
    chordIndex += 1
    setTimeout(scheduleNextChord, CHORD_DURATION * 1000 * 0.82)
  }
  scheduleNextChord()

  // Quiet vinyl crackle bed + sparse pops
  const crackleBuffer = makeLoopableNoiseBuffer(context, 6, 'white')
  const crackleSource = context.createBufferSource()
  crackleSource.buffer = crackleBuffer
  crackleSource.loop = true
  const crackleFilter = context.createBiquadFilter()
  crackleFilter.type = 'highpass'
  crackleFilter.frequency.value = 4000
  const crackleGain = context.createGain()
  crackleGain.gain.value = 0.045
  crackleSource.connect(crackleFilter)
  crackleFilter.connect(crackleGain)
  crackleGain.connect(destination)
  crackleSource.start(0)

  const cracklePopBus = context.createGain()
  cracklePopBus.gain.value = 1
  cracklePopBus.connect(destination)
  const stopPops = startRandomTicker(
    () =>
      playImpulse(context, cracklePopBus, {
        durationSec: 0.03,
        filterType: 'highpass',
        freq: 3500,
        q: 1,
        peak: 0.05 + Math.random() * 0.06,
      }),
    180,
    650,
  )

  // Soft, laid-back beat: a mellow low "thump" roughly every other beat at
  // ~84bpm, skipped occasionally so it doesn't feel mechanical.
  const beatMs = 60000 / 84
  const beatBus = context.createGain()
  beatBus.gain.value = 1
  beatBus.connect(destination)
  let beatCount = 0
  const stopBeat = startRandomTicker(
    () => {
      beatCount += 1
      const isDownbeat = beatCount % 2 === 1
      if (!isDownbeat && Math.random() < 0.5) return // laid-back swing, skip some off-beats
      const now = context.currentTime
      const osc = context.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(isDownbeat ? 95 : 70, now)
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18)
      const env = context.createGain()
      env.gain.setValueAtTime(0.001, now)
      env.gain.linearRampToValueAtTime(isDownbeat ? 0.24 : 0.14, now + 0.008)
      env.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      osc.connect(env)
      env.connect(beatBus)
      osc.start(now)
      osc.stop(now + 0.24)
    },
    beatMs - 4,
    beatMs + 4,
  )

  return {
    stop() {
      stopped = true
      stopPops()
      stopBeat()
      try { crackleSource.stop() } catch { /* already stopped */ }
      try { filterLfo.stop() } catch { /* already stopped */ }
      activeOscillators.forEach((osc) => {
        try { osc.stop() } catch { /* already stopped */ }
      })
      warmthFilter.disconnect()
      filterLfo.disconnect()
      filterLfoDepth.disconnect()
      padGain.disconnect()
      crackleSource.disconnect()
      crackleFilter.disconnect()
      crackleGain.disconnect()
      cracklePopBus.disconnect()
      beatBus.disconnect()
    },
  }
}

const BUILDERS = {
  lofi: buildLofi,
  rain: (context, destination) => buildFileLoop(context, destination, '/audio/rain.mp3'),
  sunset: (context, destination) => buildFileLoop(context, destination, '/audio/sunset.mp3'),
}

export class Soundscape {
  constructor(presetKey) {
    this.presetKey = presetKey
    this.instance = null
    this.masterGain = null
  }

  start(volume = 0.5) {
    const context = getContext()
    if (context.state === 'suspended') context.resume()

    this.masterGain = context.createGain()
    this.masterGain.gain.value = volume
    this.masterGain.connect(context.destination)

    const builder = BUILDERS[this.presetKey] || BUILDERS.rain
    this.instance = builder(context, this.masterGain)
  }

  setVolume(volume) {
    if (!this.masterGain) return
    const now = this.masterGain.context.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 0.05)
  }

  stop() {
    this.instance?.stop()
    this.instance = null
    if (this.masterGain) {
      try {
        this.masterGain.disconnect()
      } catch {
        // already disconnected
      }
    }
    this.masterGain = null
  }
}

// Short two-tone chime played when a Pomodoro phase completes. Also built
// with oscillators so there is zero network dependency at runtime.
export function playPhaseCompleteChime() {
  const context = getContext()
  if (context.state === 'suspended') context.resume()
  const now = context.currentTime
  const notes = [880, 1174.66]
  notes.forEach((freq, i) => {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.18)
    gain.gain.linearRampToValueAtTime(0.3, now + i * 0.18 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.4)
    osc.connect(gain)
    gain.connect(context.destination)
    osc.start(now + i * 0.18)
    osc.stop(now + i * 0.18 + 0.42)
  })
}
