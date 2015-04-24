var tiles, player, enemy = {}, tileWidth, tileHeight, blueTurret, redTurret, scoreText, scoreTimer, redSoldierPool,
    blueSoldierPool, redTurretPool, blueTurretPool, serverTimer, game;

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
    {key: "blueTile", src: "assets/blueBaseTileTurnip.png"},
    {key: "redTile", src: "assets/redBaseTileTurnip.png"},
    {key: "canWalkTile", src: "assets/grass2TileTurnip.png"},
    {key: "noWalkTile", src: "assets/turretBaseStoneTileTurnip.png"},
    {key: "neutralTile", src: "assets/pathLightTileTurnip.png"}
];

function startGame(){

    game = new Phaser.Game(1100, 500, Phaser.AUTO, '', {preload: preload, create: create, update: update});

}

function preload() {

    game.stage.disableVisibilityChange = true;

    for (var i = 0; i < tileImages.length; i++) game.load.image(tileImages[i].key, tileImages[i].src);

    game.load.spritesheet('player', 'assets/turnipStripBlue.png', 35, 25);
    game.load.spritesheet('player2', 'assets/turnipStripRed.png', 35, 25);

    game.load.image('redTurret', 'assets/redTurret.png');
    game.load.image('redBullet', 'assets/redBullet.png');

    game.load.image('blueTurret', 'assets/blueTurret.png');
    game.load.image('blueBullet', 'assets/blueBullet.png');

    game.load.spritesheet('kaboom', 'assets/turnipExplosion.png', 32, 32, 11);
}

function create() {

    tiles = game.add.group();

    createMap();

    getAjax("https://webgamesdev-blaircalderwood.c9.io/newGame", setPlayerTeams);
    //setPlayerTeams();
}

function setPlayerTeams(playerTeam){

    function animateSoldiers(soldier) {
        soldier.animations.add('walk');
        soldier.animations.play('walk', 5, true);
    }

    redSoldierPool = new SoldierPool("red");
    blueSoldierPool = new SoldierPool("blue");
    redTurretPool = new TurretPool("red");
    blueTurretPool = new TurretPool("blue");

    player = new Player(playerTeam);

    console.log(playerTeam);

    if(playerTeam == "red")enemy = new Player("blue");
    else enemy = new Player("red");

    redSoldierPool.forEach(function (soldier)
    {
        animateSoldiers(soldier);
    });
    blueSoldierPool.forEach(function (soldier)
    {
        animateSoldiers(soldier);
    });

    createText();

    startTimer();

}

function update() {

    if(player) {

        moveSoldiers();
        moveTurrets();

        forEachTurret(function (turret) {

            game.physics.arcade.overlap(turret.bullets, redSoldierPool, collisionHandler, null, this);
            game.physics.arcade.overlap(turret.bullets, blueSoldierPool, collisionHandler, null, this);

        });

        /*redSoldierPool.forEach(function (soldier) {
            soldier.bringToTop();
        });
        
        blueSoldierPool.forEach(function (soldier) {
            soldier.bringToTop();
        });*/
        
        forEachSoldier(function(soldier){
            soldier.bringToTop();
        })

    }

}

function forEachSoldier(targetFunction){

    redSoldierPool.forEach(function (targetVar) {
        targetVar.team = "red";
        targetFunction(targetVar);
    });
    blueSoldierPool.forEach(function (targetVar) {
        targetVar.team = "blue";
        targetFunction(targetVar);
    });

}

function forEachTurret(targetFunction){

    redTurretPool.forEach(function (targetVar) {
        targetVar.team = "red";
        targetFunction(targetVar);
    });
    blueTurretPool.forEach(function (targetVar) {
        targetVar.team = "blue";
        targetFunction(targetVar);
    });

}

function startTimer() {

    serverTimer = setInterval(function () {
        getAjax("https://webgamesdev-blaircalderwood.c9.io/update?name=" + playerName, updateListener);
    }, 200);

}

function updateListener(update) {

    if(update !== "Connection Problem") {

        var team = JSON.parse(update);

        console.log(update);
        for (var i = 0; i < team.length; i++) {

            if (team[i].type == "soldier") {
                spawnPlayerOnObject(team[i].x, team[i].y, team[i].team);
            }
            else if (team[i].type == "turret") {
                spawnTurretOnObject(team[i].x, team[i].y, team[i].team);
            }
        }

    }

}

function collisionHandler(bullet, soldier) {

    console.log(soldier);

    bullet.kill();

    soldier.kill();

    var explosion = player.explosionPool.getFirstExists(false);
    explosion.reset(soldier.body.x, soldier.body.y);


    player.explosionPool.forEach(function (explosion)
    {
        explosion.animations.add('explode');
        explosion.animations.play('explode', 15, false, true);
    });


    player.funds += 20;
    scoreText.text = "Funds: " + player.funds;

    forEachSoldier(function (soldier)
    {
        soldier.animations.add('walk');
        soldier.animations.play('walk', 5, true);
    });
}


function moveSoldiers() {

    forEachSoldier(function (soldier) {

        if (soldier.alive) {

            if (soldier.path.length > 0) {
                var path = soldier.path;

                var pathX = path[soldier.pointer][0] * tileWidth + (tileWidth / 2);
                var pathY = path[soldier.pointer][1] * tileHeight + (tileHeight / 2);

                soldier.rotation = game.physics.arcade.moveToXY(soldier, pathX, pathY, 50);


                if (Math.round(soldier.x) == pathX && Math.round(soldier.y) == pathY) {

                    if (path[soldier.pointer + 2]) {
                        if (path[soldier.pointer][0] !== path[soldier.pointer + 2][0] && path[soldier.pointer][1] !== path[soldier.pointer + 2][1]) {
                            soldier.pointer++;
                        }
                    }

                    soldier.pointer++;

                }

                if (soldier.pointer > path.length - 1) {
                    goalReached(soldier);
                }

            }

        }

    });

}

function goalReached(soldier) {

    soldier.kill();
    enemy.health -= 10;
    updateEnemyHealth();

}

function updateEnemyHealth() {

    //enemy.healthText.text = "Enemy health: " + enemy.health;

}

function moveTurrets() {

    forEachSoldier(function (soldier) {

        if (soldier.alive) {
            forEachTurret(function (turret) {

                if (turret.alive) {
                    console.log(turret);
                    if (game.physics.arcade.distanceBetween(turret, soldier) < 300) {
                        rotate(turret, soldier);

                    }

                }

            });

        }
    });

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
                    listenerFunction = newSoldier;
                    break;

                case 1:
                    tileName = "noWalkTile";
                    inputEnabled = true;
                    listenerFunction = newTurret;
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

function createText() {

    var style = {font: "30px Arial", fill: "#FFFFFF", align: "center"};
    scoreText = game.add.text(game.world.centerX, game.world.centerY / 8, "Funds: " + player.funds + " Cts", style);
    scoreText.anchor.set(0.5);

    //enemy.healthText = game.add.text(game.world.width / 3, game.world.height / 2, "Enemy Health: " + enemy.health, style);

    scoreTimer = setInterval(function () {
        player.funds += 100;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }, 3000);

}

function isInOwnHalf(xCoord){
  return ((xCoord < (game.width / 2) && player.team == "blue") || (xCoord > (game.width / 2) && player.team == "red"))
}

function newSoldier(listener, pointer) {

    var targetTile = getTargetTile(pointer);

    if(isInOwnHalf(targetTile.x)) {
        //spawnPlayerOnObject(targetTile.x, targetTile.y);
        console.log("Player placed");
        getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=soldier&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
    }

}

function itemPlaced(data){
    console.log(data);
}

function getAjax(url, callback) {

    $.ajax({
        type: "GET",
        url: url,
        async: "true",
        contentType: "application/json",
        dataType: 'jsonp',
        success: callback || function () {
            console.log("DONE");
        }
    });

}

function newTurret(listener, pointer) {

    var targetTile = getTargetTile(pointer);

    if(isInOwnHalf(targetTile.x)) {
        //spawnTurretOnObject(targetTile.x, targetTile.y);
        getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=turret&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
    }

}

function spawnPlayerOnObject(x, y, team) {

    if(player.funds >= 50)    //if the funds are above 50 then do the following
    {

        var newSoldier = new Soldier(x, y, team);

        newSoldier.bringToTop();

        player.funds -= 50;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }

}


function spawnTurretOnObject(x, y, team) {

    var newTurret;

    if(player.funds >= 300)    //if the funds are above 300 then do the following
    {

        newTurret = new Turret(team, x, y);

        player.funds -= 300;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }

}



function getTargetTile(pointer) {

    var objX = Math.floor(pointer.x / tileWidth) * tileWidth + (tileWidth / 2);
    var objY = Math.floor(pointer.y / tileHeight) * tileHeight + (tileHeight / 2);

    return {x: objX, y: objY};
}