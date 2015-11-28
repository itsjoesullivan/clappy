module.exports = function(context) {

  // courtesy of http://noisehack.com/generate-noise-web-audio-api/
  var bufferSize = 2 * context.sampleRate;
  var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  var output = noiseBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  // A few parameters
  // Overall length of the clap
  var length = 1.2;
  // Number of clappers
  var cycles = 3;
  // How closely together the clappers clap
  var clapFrequency = 80;
  // How long a clap lasts
  var clapLength = cycles / clapFrequency;

  // This is what we'll eventually return.
  var audioNode = context.createGain();

  var noise = context.createBufferSource();
  noise.buffer = noiseBuffer;

  var clapsGain = context.createGain();
  var clapDecay = context.createGain();

  noise.connect(clapsGain);
  clapsGain.connect(clapDecay);

  var posGain = context.createGain();
  var negGain = context.createGain();
  var lfoGain = context.createGain();
  negGain.gain.value = 1;
  negGain.connect(lfoGain);

  clapDecay.connect(negGain);

  var longGain = context.createGain();
  noise.connect(longGain);

  var lfo  = context.createOscillator();
  lfo.type = "sawtooth";
  lfo.frequency.value = -clapFrequency;
  lfo.connect(lfoGain.gain);

  var bandpass = context.createBiquadFilter();
  bandpass.type = "bandpass";
  longGain.connect(bandpass);

  lfoGain.connect(bandpass);
  posGain.connect(bandpass);

  var highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  bandpass.connect(highpass);
  highpass.connect(context.destination);

  bandpass.frequency.value = 800;
  bandpass.Q.value = 0.7;
  highpass.frequency.value = 600;

  audioNode.start = function(when) {
    when = when || context.currentTime;
    clapDecay.gain.setValueAtTime(0.0001, when);
    clapDecay.gain.exponentialRampToValueAtTime(1, when + 0.001);
    clapDecay.gain.linearRampToValueAtTime(1, when + clapLength);
    clapDecay.gain.exponentialRampToValueAtTime(0.0001, when + clapLength + 0.01);

    longGain.gain.setValueAtTime(0.0001, when);
    longGain.gain.setValueAtTime(0.0001, when + clapLength);
    longGain.gain.exponentialRampToValueAtTime(1, when + clapLength + 0.001);
    longGain.gain.exponentialRampToValueAtTime(0.2, when + 0.1);
    longGain.gain.exponentialRampToValueAtTime(0.0001, when + length);

    lfo.start(when);
    noise.start(when);
  };

  audioNode.stop = function(when) {
    noise.stop(when);
  }

  return audioNode;
};
