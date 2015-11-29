var context = new AudioContext();
var Clappy = require('./index');
var clap = Clappy(context);
document.getElementById('clap').addEventListener('click', function(e) {
  var node = clap();
  node.connect(context.destination);
  node.start(context.currentTime);
});
