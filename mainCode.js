var tiles, player, game, enemy = {}, tileWidth, tileHeight, blueTurret, redTurret, scoreText, scoreTimer, soldierGroup, serverTimer;

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

function startGame(){

    game = new Phaser.Game(1100, 500, Phaser.AUTO, '', {preload: preload, create: create, update: update});

}

function preload() {

    for (var i = 0; i < tileImages.length; i++) game.load.image(tileImages[i].key, tileImages[i].src);

    game.load.image('player', 'assets/ship.png');

    game.load.image('redTurret', 'assets/redTurret.png');
    game.load.image('redBullet', 'assets/redBullet.png');

    game.load.image('blueTurret', 'assets/blueTurret.png');
    game.load.image('blueBullet', 'assets/blueBullet.png');

}

function create() {

    tiles = game.add.group();

    createMap();

    getAjax("https://webgamesdev-blaircalderwood.c9.io/newGame", setPlayerTeams);

}

function setPlayerTeams(playerTeam){

    player = new Player(playerTeam);

    console.log(playerTeam);

    if(playerTeam == "red")enemy = new Player("blue");
    else enemy = new Player("red");

    createText();

    startTimer();

}

function update() {

    if(player) {

        moveSoldiers();
        moveTurrets();

        player.turrets.forEach(function (turret) {

            game.physics.arcade.overlap(turret.bullets, player.soldierPool, collisionHandler, null, this);

        });

        player.soldierPool.forEach(function (soldier) {

            soldier.bringToTop();
        });

    }

}

function startTimer() {

    serverTimer = setInterval(function () {
        getAjax("https://webgamesdev-blaircalderwood.c9.io/update?team=" + player.team, updateListener);
    }, 200);

}

function updateListener(update) {

    var team = JSON.parse(update);

    console.log(update);
    for (var i = 0; i < team.length; i++) {

        if (team[i].type == "soldier") {
            spawnPlayerOnObject(team[i].x, team[i].y);
        }
        else if (team[i].type == "turret") {
            spawnTurretOnObject(team[i].x, team[i].y);
        }
    }

}

function collisionHandler(bullet, soldier) {

    console.log(soldier);

    bullet.kill();

    soldier.kill();

    player.funds += 20;
    scoreText.text = "Funds: " + player.funds;


}


function moveSoldiers() {

    player.soldierPool.forEach(function (soldier) {

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

    player.soldierPool.forEach(function (soldier) {

        if (soldier.alive) {
            player.turrets.forEach(function (turret) {

                if (turret.alive) {

                    if (game.physics.arcade.distanceBetween(turret, soldier) < 300) {
                        rotate(turret, soldier);
                        //fire(turret, soldier);
                        //if (turret.target !== undefined) turret.sprite.rotation = game.physics.arcade.angleBetween(turret.sprite, soldier);

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

function newSoldier(listener, pointer) {

    var targetTile = getTargetTile(pointer);

    spawnPlayerOnObject(targetTile.x, targetTile.y);
    //getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?team=" + player.team + "&type=soldier&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y));

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

    getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?team=" + player.team + "&type=turret&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y));

}

function spawnPlayerOnObject(x, y) {

    var newSoldier = new Soldier(x, y, "blue");

    newSoldier.bringToTop();

    player.funds -= 50;
    scoreText.text = "Funds: " + player.funds + " Cts";

}


function spawnTurretOnObject(x, y) {

    var newTurret = new Turret("blue", x, y);

    player.funds -= 300;
    scoreText.text = "Funds: " + player.funds + " Cts";

}

function getTargetTile(pointer) {

    var objX = Math.floor(pointer.x / tileWidth) * tileWidth + (tileWidth / 2);
    var objY = Math.floor(pointer.y / tileHeight) * tileHeight + (tileHeight / 2);

    return {x: objX, y: objY};
}