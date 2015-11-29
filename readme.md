##Usage

`npm install --save clappy`

```javascript
var clappy = require('clappy');

// Initialize AudioContext
var context = new AudioContext();

// Create clap audio node (one time use only)
var clapNode = clappy(context);

// Connect to target node
clapNode.connect(context.destination);

// Start
clapNode.start(context.currentTime);
```
