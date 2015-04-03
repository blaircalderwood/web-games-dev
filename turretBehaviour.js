var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Turnip Wars',
    {
        preload: preload,
        create: create,
        update: update});

function preload() {

    game.load.image('blueTurret', 'assets/blueTurret.png');
    game.load.image('blueBullet', 'assets/blueBullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.image('player', 'assets/ship.png');
    game.load.image('player2', 'assets/tank1.png');
    //game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    game.load.image('redTurret', 'assets/redTurret.png');
    game.load.image('redBullet', 'assets/redBullet.png');
}

var land, cursors;//, player, player2;//shadow explosions
var fireRate = 1000;

var blueTurret;
var redTurret;
var player;
var player2;
var funds = 1000;
var scoreText;
var interval;




var Turret = function (team, x, y) {

    this.nextFire = 0;

    this.bullets = new BulletPool(team);


    if (team == "blue") {
        this.sprite = game.add.sprite(x, y, "blueTurret");
    }
    else {
        this.sprite = game.add.sprite(x, y, "redTurret");
    }

    this.sprite.anchor.setTo(0.3, 0.5);

    return this;

}


Turret.prototype.fire = function (target) {

    if (game.time.now > this.nextFire && this.bullets.countDead() > 0) {

        this.nextFire = game.time.now + fireRate;

        var bullet = this.bullets.getFirstExists(false);

        bullet.reset(this.sprite.x, this.sprite.y);

        bullet.rotation = game.physics.arcade.moveToObject(bullet, target, 500);

    }
};


var BulletPool = function (team) {

    var bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    if (team == "blue"){
        bullets.createMultiple(30, 'blueBullet', 0, false);
    } else {
        bullets.createMultiple(30, 'redBullet', 0, false);
    }


    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    return bullets;
};

/*
var EnemiesPool = function(team, x, y)
{

     var enemies = game.add.group();
     enemies.enableBody = true;
     enemies.physicsBodyType = Phaser.Physics.ARCADE;

    if (team == "blue"){
        enemies.createMultiple(30, 'player', 0, false);
    } else {
        enemies.createMultiple(30, 'player2', 0, false);
    }

    enemies.setAll('anchor.x', 0.5);
    enemies.setAll('anchor.y', 0.5);
    enemies.setAll('outOfBoundsKill', true);
    enemies.setAll('checkWorldBounds', true);

    return enemies;
}
  */



function create() {

    //background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');

    addPlayer();
    addPlayer2();

    blueTurret = new Turret("blue", 100, 150);
    redTurret = new Turret("red", 200, 300);

    var style = {font: "40px Arial", fill: "#19cb65", align: "center"};
    scoreText = game.add.text(game.world.centerX, game.world.centerY/8, "Funds: " + funds + " Cts", style);
    scoreText.anchor.set(0.5);

    /*
     //  Explosion pool
     explosions = game.add.group();

     for (var i = 0; i < 10; i++)
     {
     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
     explosionAnimation.anchor.setTo(0.5, 0.5);
     explosionAnimation.animations.add('kaboom');
     }
     */


    blueTurret.sprite.bringToTop();
    redTurret.sprite.bringToTop();

    player.bringToTop();
    player2.bringToTop();


    cursors = game.input.keyboard.createCursorKeys();

}

     setInterval(function()
     {
      funds += 100;
      scoreText.text = "Funds: " + funds + " Cts";
     },3000);


function update() {

    if (game.physics.arcade.distanceBetween(blueTurret.sprite, player) < 300) {
        blueTurret.sprite.rotation = game.physics.arcade.angleBetween(blueTurret.sprite, player);
        blueTurret.fire(player);
    }

    if (game.physics.arcade.distanceBetween(redTurret.sprite, player2) < 300) {
        redTurret.sprite.rotation = game.physics.arcade.angleBetween(redTurret.sprite, player2);
        redTurret.fire(player2);
    }




    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    checkKeys();

}



function addPlayer() {

    player = game.add.sprite(100, 100, 'player');
    game.physics.arcade.enable(player);

}

function addPlayer2() {

    player2 = game.add.sprite(200, 500, 'player2');
    game.physics.arcade.enable(player2);

}


function checkKeys() {

    if (cursors.left.isDown) {
        player.body.velocity.x = -100;
    }
    if (cursors.right.isDown) {
        player.body.velocity.x = 100;
    }
    if (cursors.up.isDown) {
        player.body.velocity.y = -100;
    }
    if (cursors.down.isDown) {
        player.body.velocity.y = 100;
    }

}