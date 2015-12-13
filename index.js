var NoiseBuffer = require('noise-buffer');

module.exports = function(context) {

  return function() {

    /*
      All this does is feed white noise
      through two paths: one short burst
      that goes through an envelope mod-
      ified by an LFO at 80hz, simulat-
      ing a few rapid claps, and a long-
      er burst that simulates the rever-
      beration of the claps through the
      room.
    */

    var duration = 1.2;
    var cycles = 3;
    var clapFrequency = 80;
    var clapLength = cycles / clapFrequency;

    var audioNode = context.createGain();

    var noise = context.createBufferSource();
    noise.buffer = NoiseBuffer(duration);

    var clapDryEnvelope = context.createGain();

    var clapDecayEnvelope = context.createGain();

    var lfoCarrier = context.createGain();
    var lfo  = context.createOscillator();
    lfo.type = "sawtooth";
    lfo.frequency.value = -clapFrequency;
    lfo.connect(lfoCarrier.gain);


    var bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    var highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.7;
    highpass.frequency.value = 600;

    noise.connect(clapDryEnvelope);
    clapDryEnvelope.connect(lfoCarrier);
    lfoCarrier.connect(bandpass);

    noise.connect(clapDecayEnvelope);
    clapDecayEnvelope.connect(bandpass);

    bandpass.connect(highpass);
    highpass.connect(audioNode);

    audioNode.start = function(when) {

      clapDryEnvelope.gain.setValueAtTime(0.0001, when);
      clapDryEnvelope.gain.exponentialRampToValueAtTime(1, when + 0.001);
      clapDryEnvelope.gain.linearRampToValueAtTime(1, when + clapLength);
      clapDryEnvelope.gain.exponentialRampToValueAtTime(0.0001, when + clapLength + 0.01);

      clapDecayEnvelope.gain.setValueAtTime(0.0001, when);
      clapDecayEnvelope.gain.setValueAtTime(0.0001, when + clapLength);
      clapDecayEnvelope.gain.exponentialRampToValueAtTime(1, when + clapLength + 0.001);
      clapDecayEnvelope.gain.exponentialRampToValueAtTime(0.2, when + 0.1);
      clapDecayEnvelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);

      lfo.start(when);
      noise.start(when);

      audioNode.stop(when + duration);
    };

    audioNode.stop = function(when) {

      lfo.stop(when);
      noise.stop(when);
    };

    return audioNode;
  };
};
