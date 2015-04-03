var game = new Phaser.Game(1100, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var tiles, player = {}, tileWidth, tileHeight, blueTurret, redTurret, scoreText, scoreTimer;

var playerSpawnTimer = 0;

var gridCoords = [
    [3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [4, 4, 4, 4, 4]
];

var tileImages = [
    {key: "blueTile", src: "assets/blueGoalTile.jpg"},
    {key: "redTile", src: "assets/redGoalTile.jpg"},
    {key: "canWalkTile", src: "assets/canWalkTile.jpg"},
    {key: "noWalkTile", src: "assets/noWalkTile.png"},
    {key: "neutralTile", src: "assets/neutralTile.jpg"}
];

var Player = function(){

    this.soldiers = [];
    this.turrets = [];
    this.funds = 1000;

};

var Turret = function (team, x, y) {

    this.nextFire = 0;

    this.bullets = new BulletPool(team);

    this.fireRate = 1000;


    if (team == "blue") {
        this.sprite = game.add.sprite(x, y, "blueTurret");
    }
    else {
        this.sprite = game.add.sprite(x, y, "redTurret");
    }

    this.sprite.anchor.setTo(0.3, 0.5);

    return this;

};

Turret.prototype.fire = function (target, targetIndex) {

    if (game.time.now > this.nextFire && this.bullets.countDead() > 0) {

        this.nextFire = game.time.now + this.fireRate;

        var bullet = this.bullets.getFirstExists(false);

        bullet.reset(this.sprite.x, this.sprite.y);

        bullet.rotation = game.physics.arcade.moveToObject(bullet, target, 500);

        if(player.soldiers[targetIndex] !== undefined) this.target = targetIndex;

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

function preload() {

    for (var i = 0; i < tileImages.length; i++) game.load.image(tileImages[i].key, tileImages[i].src);

    game.load.image('player', 'assets/ship.png');

    game.load.image('redTurret', 'assets/redTurret.png');
    game.load.image('redBullet', 'assets/redBullet.png');

    game.load.image('blueTurret', 'assets/blueTurret.png');
    game.load.image('blueBullet', 'assets/blueBullet.png');

}

function create() {

    player = new Player();

    tiles = game.add.group();

    createMap();

    var style = {font: "30px Arial", fill: "#FFFFFF", align: "center"};
    scoreText = game.add.text(game.world.centerX, game.world.centerY/8, "Funds: " + player.funds + " Cts", style);
    scoreText.anchor.set(0.5);

    scoreTimer = setInterval(function()
    {
        player.funds += 100;
        scoreText.text = "Funds: " + player.funds + " Cts";
    },3000);

}

function update() {

    moveSoldiers();
    moveTurrets();

    for(var i = 0; i < player.turrets.length; i++){
        game.physics.arcade.overlap(player.turrets[i].bullets, player.soldiers, collisionHandler, null, this);
    }
}


function collisionHandler(bullet, soldier)
{
     bullet.kill();
     //bullet.splice(i, 1);
     soldier.kill();
     //soldier.splice(i, 1);

    player.funds += 20;
    scoreText.text = "Funds: " + player.funds + " Cts";


}


function moveSoldiers(){

    for (var i = 0; i < player.soldiers.length; i++) {

        if (player.soldiers[i].path.length > 0) {
            var path = player.soldiers[i].path;

            var pathX = path[player.soldiers[i].pointer][0] * tileWidth + (tileWidth / 2);
            var pathY = path[player.soldiers[i].pointer][1] * tileHeight + (tileHeight / 2);

            player.soldiers[i].rotation = game.physics.arcade.moveToXY(player.soldiers[i], pathX, pathY, 50);


            if (Math.round(player.soldiers[i].x) == pathX && Math.round(player.soldiers[i].y) == pathY) {

                if (path[player.soldiers[i].pointer + 2]) {
                    if (path[player.soldiers[i].pointer][0] !== path[player.soldiers[i].pointer + 2][0] && path[player.soldiers[i].pointer][1] !== path[player.soldiers[i].pointer + 2][1]) {
                        player.soldiers[i].pointer++;
                    }
                }

                player.soldiers[i].pointer++;

            }

            if(player.soldiers[i].pointer > path.length - 1){
                player.soldiers[i].kill();
                player.soldiers.splice(i, 1);
            }

        }

    }

}

function moveTurrets(){


    for(var i = 0; i < player.soldiers.length; i ++) {
        for (var j = 0; j < player.turrets.length; j++) {

            if (game.physics.arcade.distanceBetween(player.turrets[j].sprite, player.soldiers[i]) < 300) {
                player.turrets[j].fire(player.soldiers[i], i);
                if (player.turrets[j].target !== undefined) player.turrets[j].sprite.rotation = game.physics.arcade.angleBetween(player.turrets[j].sprite, player.soldiers[player.turrets[j].target]);
            }

            /*if (redTurret && game.physics.arcade.distanceBetween(redTurret.sprite, player2) < 300) {
             redTurret.sprite.rotation = game.physics.arcade.angleBetween(redTurret.sprite, player2);
             redTurret.fire(player2);
             }*/

        }

    }

}

function createMap() {

    game.add.tileSprite(0, 0, game.width, game.height, "canWalkTile");
    var tileName, inputEnabled, listenerFunction;
    tileWidth = game.width / gridCoords.length;
    tileHeight = game.height / gridCoords[0].length;

    for (var i = 0; i < gridCoords.length; i++) {
        for (var j = 0; j < gridCoords[0].length; j++) {

            if (gridCoords[i][j] == 0) {
                tileName = "canWalkTile";
            }
            else {
                tileName = "noWalkTile";
            }

            switch (gridCoords[i][j]) {

                case 0:
                    tileName = "canWalkTile";
                    inputEnabled = true;
                    listenerFunction = spawnPlayerOnObject;
                    break;

                case 1:
                    tileName = "noWalkTile";
                    inputEnabled = true;
                    listenerFunction = spawnTurretOnObject;
                    break;

                case 2:
                    tileName = "neutralTile";
                    inputEnabled = false;
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;

                case 3:
                    tileName = "blueTile";
                    inputEnabled = false;
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;

                case 4:
                    tileName = "redTile";
                    inputEnabled = false;
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;

            }

            var newTile = game.add.sprite(tileWidth * i, tileHeight * j, tileName);
            newTile.width = tileWidth;
            newTile.height = tileHeight;
            newTile.inputEnabled = inputEnabled;

            if (inputEnabled == true) newTile.events.onInputDown.add(listenerFunction, this);

        }
    }

}

spawnPlayerOnObject = function (listener, pointer) {

    var targetTile = getTargetTile(pointer);

    var newSoldier = game.add.sprite(targetTile.x, targetTile.y, 'player');
    game.physics.arcade.enable(newSoldier);
    newSoldier.bringToTop();
    newSoldier.anchor.setTo(0.5, 0.5);

    newSoldier.path = findPath([Math.floor(newSoldier.x / tileWidth), Math.floor(newSoldier.y / tileHeight)], [0, 0]);

    newSoldier.pointer = 0;

    player.soldiers.push(newSoldier);

    player.funds -= 50;
    scoreText.text = "Funds: " + player.funds + " Cts";

};

function spawnTurretOnObject(listener, pointer){

    var targetTile = getTargetTile(pointer);

    var newTurret = new Turret("blue", targetTile.x, targetTile.y);

    player.turrets.push(newTurret);

    player.funds -= 300;
    scoreText.text = "Funds: " + player.funds + " Cts";

}

function getTargetTile(pointer){

    var objX = Math.floor(pointer.x / tileWidth) * tileWidth + (tileWidth / 2);
    var objY = Math.floor(pointer.y / tileHeight) * tileHeight + (tileHeight / 2);

    return{x: objX, y: objY};
}