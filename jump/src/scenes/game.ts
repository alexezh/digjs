export class Player {
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

export default class Game extends Phaser.Scene {
  private player: Player = new Player();
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private stars!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;

  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver: boolean = false;

  readonly sky: string = 'sky';
  readonly platform: string = 'platform';
  readonly star: string = 'star';
  readonly bomb: string = 'bomb';

  constructor() {
    super({
      key: 'Game',
      physics: {
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
    });
  }

  preload() {
    this.load.image(this.sky, "./assets/sky.png");
    this.load.image(this.platform, "./assets/platform.png");
    this.load.image(this.star, "./assets/star.png");
    this.load.image(this.bomb, "./assets/bomb.png");

    this.player.preload(this);
  }

  create() {
    /* Start by resetting any variables that have a default value to their default */
    this.score = 0;
    this.gameOver = false;

    this.add.image(400, 300, this.sky);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, this.platform).setScale(2).refreshBody();
    this.platforms.create(600, 400, this.platform);
    this.platforms.create(50, 250, this.platform);
    this.platforms.create(750, 220, this.platform);

    this.physics.add.collider(this.player.sprite, this.platforms);

    this.player.create(this);

    this.stars = this.physics.add.group({
      key: this.star,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });
    this.stars.children.iterate(function (
      child: Phaser.GameObjects.GameObject
    ) {
      (child as Phaser.Physics.Arcade.Sprite).setBounceY(
        Phaser.Math.FloatBetween(0.4, 0.8)
      );
    });
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player.sprite,
      this.stars,
      this.collectStar,
      function () { },
      this
    );

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player.sprite,
      this.bombs,
      this.hitBomb,
      function () { },
      this
    );

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#000',
    });
  }

  update() {
    if (this.gameOver) {
      return;
    }

    this.player.update();
  }

  collectStar(
    _player: Phaser.GameObjects.GameObject,
    star: Phaser.GameObjects.GameObject
  ): void {
    (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) == 0) {
      this.stars.children.iterate(function (
        child: Phaser.GameObjects.GameObject
      ) {
        (child as Phaser.Physics.Arcade.Sprite).enableBody(
          true,
          (child as Phaser.Physics.Arcade.Sprite).x,
          0,
          true,
          true
        );
      });

      let x =
        this.player.sprite.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);
      let bomb = this.bombs.create(x, 16, this.bomb);
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  hitBomb(
    player: Phaser.GameObjects.GameObject,
    _bomb: Phaser.GameObjects.GameObject
  ): void {
    this.physics.pause();

    (player as Phaser.Physics.Arcade.Sprite).setTint(0xff0000);
    this.gameOver = true;
    this.player.dieAnim();
    this.input.keyboard.on('keydown', () => this.scene.start(this.scene.key));
  }
}
