import Phaser from 'phaser';

import Game from './scenes/game';

let config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [Game],
};

new Phaser.Game(config);
