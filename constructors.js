var Player = function (team) {

    this.explosionPool = new ExplosionPool();

    this.funds = 1000;
    this.health = 100;
    this.team = team;

    if(team == "blue")
    {
        this.healthBar = healthBarBlue;
    }
    else this.healthBar = healthBarRed;

};

var Soldier = function (x, y, team) {

    var newSoldier;

    function posAndPath(targetX, targetY) {

        newSoldier.reset(x, y);

        newSoldier.path = findPath([Math.floor(newSoldier.x / tileWidth), Math.floor(newSoldier.y / tileHeight)], [targetX, targetY]);
        console.log(newSoldier.path);

        newSoldier.pointer = 0;

    }

    if (team == "blue") {

        if (blueSoldierPool.countDead() > 0) {

            newSoldier = blueSoldierPool.getFirstExists(false);

            posAndPath(10, 2);

        }

    }

    else {

        if (redSoldierPool.countDead() > 0) {

            newSoldier = redSoldierPool.getFirstExists(false);
            posAndPath(0, 2);
            console.log(newSoldier);

        }

    }

    newSoldier.team = team;

    return newSoldier;

};

var Turret = function (team, x, y) {

    var newTurret;

    if (team == "blue") newTurret = blueTurretPool.getFirstExists(false);

    else newTurret = redTurretPool.getFirstExists(false);

    newTurret.reset(x, y);

    newTurret.nextFire = 0;

    newTurret.bullets = new BulletPool(team);

    newTurret.fireRate = 2000;
    newTurret.speed = 0.01;

    newTurret.anchor.setTo(0.3, 0.5);

    newTurret.team = team;

    return newTurret;

};

fire = function (turret, target) {

    if (game.time.now > turret.nextFire && turret.bullets.countDead() > 0) {

        turret.nextFire = game.time.now + turret.fireRate;

        var bullet = turret.bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = game.physics.arcade.moveToObject(bullet, target, 500);

        turret.bringToTop();

    }

};

fireBullet = function (turret, target, angle) {

    if (game.time.now > turret.nextFire && turret.bullets.countDead() > 0) {

        turret.nextFire = game.time.now + turret.fireRate;

        var bullet = turret.bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = angle;

        var cosAngle = (Math.cos(angle) * 10) + turret.x;
        var sinAngle = (Math.sin(angle) * 10) + turret.y;

        game.physics.arcade.moveToXY(bullet, cosAngle, sinAngle, 500);

    }

};

rotate = function (turret, target) {

    var totalRotation = game.physics.arcade.angleBetween(turret, target) - turret.rotation;

    if (totalRotation <= -turret.speed)turret.rotation -= turret.speed;
    else if (totalRotation >= turret.speed)turret.rotation += turret.speed;

    fireBullet(turret, target, turret.rotation);

};


var BulletPool = function (team) {

    var bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    if (team == "blue") {
        bullets.createMultiple(30, 'blueBullet', 0, false);
    } else {
        bullets.createMultiple(30, 'redBullet', 0, false);
    }

    bullets.setAll('team', team);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    return bullets;

};

var TurretPool = function (team) {

    var turrets = game.add.group();
    turrets.enableBody = true;
    turrets.physicsBodyType = Phaser.Physics.ARCADE;

    if (team == "blue") {
        turrets.createMultiple(5, 'blueTurret', 0, false);
    } else {
        turrets.createMultiple(5, 'redTurret', 0, false);
    }


    turrets.setAll('anchor.x', 0.5);
    turrets.setAll('anchor.y', 0.5);

    return turrets;

};

var SoldierPool = function (team) {

    var soldiers = game.add.group();
    soldiers.enableBody = true;
    soldiers.physicsBodyType = Phaser.Physics.ARCADE;

    if (team == "blue") {
        soldiers.createMultiple(30, 'player', 0, false);
    }
    else {
        soldiers.createMultiple(30, 'player2', 0, false);
    }

    soldiers.setAll('anchor.x', 0.5);
    soldiers.setAll('anchor.y', 0.5);
    soldiers.setAll('outOfBoundsKill', true);
    soldiers.setAll('checkWorldBounds', true);

    return soldiers;

};


var ExplosionPool = function () {

    var explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;

    explosions.createMultiple(30, 'kaboom', 0, false);

    return explosions;

}
