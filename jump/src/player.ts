export default class Player {
  readonly dudeAnimLeft: string = 'dudeAnimLeft';
  readonly dudeAnimTurn: string = 'dudeAnimTurn';
  readonly dudeAnimRight: string = 'dudeAnimRight';
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  readonly dude: string = 'dude';

  public get sprite(): Phaser.Physics.Arcade.Sprite { return this.player; }

  public preload(scene: Phaser.Scene) {
    scene.load.spritesheet(this.dude, "./assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  public create(scene: Phaser.Scene) {
    this.player = scene.physics.add.sprite(100, 450, this.dude);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    scene.anims.create({
      key: this.dudeAnimLeft,
      frames: scene.anims.generateFrameNumbers(this.dude, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: this.dudeAnimTurn,
      frames: [{ key: this.dude, frame: 4 }],
      frameRate: 20,
    });
    scene.anims.create({
      key: this.dudeAnimRight,
      frames: scene.anims.generateFrameNumbers(this.dude, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  public update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play(this.dudeAnimLeft, true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play(this.dudeAnimRight, true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play(this.dudeAnimTurn);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  public dieAnim() {
    this.player.anims.play(this.dudeAnimTurn);
  }
}

