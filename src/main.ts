import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload(this: Phaser.Scene) {
    this.load.image('tileset', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/map.json');
  }

  create(this: Phaser.Scene) {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tileset', 32, 32);
    map.createLayer('platforms', tileset as Phaser.Tilemaps.Tileset, 0, 0);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  parent: 'app'
};

new Phaser.Game(config);
