var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0x000000,
  scene: [dextgameWelcomeScreen]
};

var text;
var graphics;
var timeoutID;

var game = new Phaser.Game(config);
