var context = new AudioContext();
var clappy = require('./index');
document.getElementById('clap').addEventListener('click', function(e) {
  var clap = clappy(context);
  clap.start(context.currentTime);
});
