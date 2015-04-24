var tiles, player, enemy = {}, tileWidth, tileHeight, blueTurret, redTurret, scoreText, scoreTimer, serverTimer, game, barBackground, barBackground2, healthBarBlue, healthBarRed;
var starterMenu, instrPage, instrButtonGroup, instrPageOpenBool, buttonGroup;
var red = {}, blue = {};
game = new Phaser.Game(1100, 500, Phaser.AUTO, '', {preload: preload, create: create, update: update});
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

    game.load.image('healthBarBlue', 'assets/healthBar.png');
    game.load.image('healthBarRed', 'assets/healthBar2.png');
    game.load.image('healthBarBackground', 'assets/healthBarBackground.png');

    game.load.image('playButtonOut', 'assets/playButton.png');
    game.load.image('playButtonOver', 'assets/playButtonGo.png');

    game.load.image('instructionButtonOut', 'assets/instructionButton.png');
    game.load.image('instructionPage', 'assets/turnipInstructions.png');
    game.load.image('backButtonOut', 'assets/backButton.png');
    game.load.image('startMenu', 'assets/starterPage.png');

}

function create() {

    $("#hostSettings").hide();

    createButtons();

    //createMap();

    //setPlayerTeams(playerTeam);

}

function removeGroup() {

    game.world.remove(buttonGroup);

    buttonGroup.destroy();

}


function over() {
    console.log('button over');
}

function out() {


    console.log('button out');
}

function actionOnClick() {

    console.log('button clicked');

    $("#hostSettings").hide();
    $("#playerList").hide();
    createMap();

    createHealthBars();
    setPlayerTeams(playerTeam);


}

function setPlayerTeams(playerTeam) {

    function animateSoldiers(soldier) {
        soldier.animations.add('walk');
        soldier.animations.play('walk', 5, true);
    }

    red.soldierPool = new SoldierPool("red");
    blue.soldierPool = new SoldierPool("blue");
    red.turretPool = new TurretPool("red");
    blue.turretPool = new TurretPool("blue");

    player = new Player(playerTeam);

    console.log(playerTeam);

    if (playerTeam == "red")enemy = new Player("blue");
    else enemy = new Player("red");

    red.soldierPool.forEach(function (soldier) {
        animateSoldiers(soldier);
    });
    blue.soldierPool.forEach(function (soldier) {
        animateSoldiers(soldier);
    });

    createText();

    startTimer();

}

function createHealthBars() {

    barBackground = game.add.sprite(0, 0, 'healthBarBackground');
    healthBarBlue = game.add.sprite(0, 0, 'healthBarBlue');

    barBackground2 = game.add.sprite(game.world.width - 20, 0, 'healthBarBackground');
    healthBarRed = game.add.sprite(game.world.width - 20, 0, 'healthBarRed');

}

function update() {

    if (player) {

        moveSoldiers();
        moveTurrets();

        forEachTurret(function (turret) {

            game.physics.arcade.overlap(turret.bullets, red.soldierPool, collisionHandler, null, this);
            game.physics.arcade.overlap(turret.bullets, blue.soldierPool, collisionHandler, null, this);

        });

        forEachSoldier(function (soldier) {
            soldier.bringToTop();
        })

    }

}

function playAction() {

    $("#hostSettings").show();
    console.log('button clicked');
    tiles = game.add.group();

}

function forEachSoldier(targetFunction) {

    red.soldierPool.forEach(function (targetVar) {
        targetVar.team = "red";
        targetFunction(targetVar);
    });
    blue.soldierPool.forEach(function (targetVar) {
        targetVar.team = "blue";
        targetFunction(targetVar);
    });

}

function forEachTurret(targetFunction) {

    red.turretPool.forEach(function (targetVar) {
        targetFunction(targetVar);
    });
    blue.turretPool.forEach(function (targetVar) {
        targetFunction(targetVar);
    });

}

function startTimer() {

    serverTimer = setInterval(function () {
        getAjax("https://webgamesdev-blaircalderwood.c9.io/update?name=" + playerName, updateListener);
    }, 200);

}

function updateListener(update) {

    if (update == "Partner Disconnected") {
        console.log(update);
    }

    else if (update !== "Connection Problem") {

        var team = JSON.parse(update);

        for (var i = 0; i < team.length; i++) {

            if(team[i] == "Player Dead")gameOver("The enemy is dead. You have won!");

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

    if (bullet.team !== soldier.team) {

        bullet.kill();

        soldier.kill();

        var explosion = player.explosionPool.getFirstExists(false);
        explosion.reset(soldier.body.x, soldier.body.y);


        player.explosionPool.forEach(function (explosion) {
            explosion.animations.add('explode');
            explosion.animations.play('explode', 15, false, true);
        });


        player.funds += 20;
        scoreText.text = "Funds: " + player.funds;

        forEachSoldier(function (soldier) {
            soldier.animations.add('walk');
            soldier.animations.play('walk', 5, true);
        });

    }
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

    function setHealthBar(targetPlayer) {
        if (targetPlayer.healthBar.height >= 50) {
            targetPlayer.healthBar.height -= 50;
            targetPlayer.healthBar.y += 50;

            targetPlayer.health -= 50;

            targetPlayer.funds += 200;
            scoreText.text = "Funds: " + targetPlayer.funds + " Cts";
        }
        if (soldier.team !== player.team && player.health <= 0) {
            getAjax("https://webgamesdev-blaircalderwood.c9.io/playerDead?name=" + playerName, playerDead);
        }
    }

    if (soldier.team !== player.team) {
        setHealthBar(player);
    }
    else {
        setHealthBar(enemy);
    }

    soldier.kill();

}

function playerDead(data) {

    console.log(data);
    gameOver("You have lost the game")

}

function gameOver(text) {

    console.log(text);
    clearInterval(serverTimer);

    getAjax("https://webgamesdev-blaircalderwood.c9.io/deadNotified?name=" + playerName, showMenuButtons)
}

function showMenuButtons(){


}

function moveTurrets() {

    forEachSoldier(function (soldier) {

        if (soldier.alive) {
            forEachTurret(function (turret) {

                if (turret.alive) {
                    console.log(turret);
                    if (game.physics.arcade.distanceBetween(turret, soldier) < 300 && turret.team !== soldier.team) {
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

    enemy.healthText = game.add.text(game.world.width / 3, game.world.height / 2, "Enemy Health: " + enemy.health, style);


    scoreTimer = setInterval(function () {
        player.funds += 100;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }, 3000);

}

function isInOwnHalf(xCoord) {
    return ((xCoord < (game.width / 2) && player.team == "blue") || (xCoord > (game.width / 2) && player.team == "red"))
}

function newSoldier(listener, pointer) {

    var targetTile = getTargetTile(pointer);

    if (isInOwnHalf(targetTile.x)) {
        //spawnPlayerOnObject(targetTile.x, targetTile.y);
        console.log("Player placed");
        getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=soldier&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
    }

}

function itemPlaced(data) {
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

    if (isInOwnHalf(targetTile.x)) {
        //spawnTurretOnObject(targetTile.x, targetTile.y);
        getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=turret&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
    }

}

function spawnPlayerOnObject(x, y, team) {

    if (player.funds >= 50)    //if the funds are above 50 then do the following
    {

        var newSoldier = new Soldier(x, y, team);

        newSoldier.bringToTop();

        player.funds -= 50;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }

}


function spawnTurretOnObject(x, y, team) {

    var newTurret;

    if (player.funds >= 300)    //if the funds are above 300 then do the following
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

function createButtons()
{

    instrPageOpenBool = false;

    starterMenu = game.add.sprite(0, 0, 'startMenu');
    buttonGroup = game.add.group();


    var playButton = game.make.button(200, 175, 'playButtonOut', playPressed, this, 2, 1, 0);
    playButton.width = 328;
    playButton.height = 124;

    var instructionButton = game.make.button(200, 325, 'instructionButtonOut', instrPressed, this, 2, 1, 0);
    instructionButton.width = 328;
    instructionButton.height = 124;

    playButton.onInputOver.add(overPlay, this);
    playButton.onInputOut.add(outPlay, this);

    instructionButton.onInputOver.add(overInstr, this);
    instructionButton.onInputOut.add(outInstr, this);

    buttonGroup.add(playButton);
    //buttonGroup.add(backButton);
    buttonGroup.add(instructionButton);
}




function playPressed() {

    if(instrPageOpenBool == false)
    {

        game.world.remove(buttonGroup);

        buttonGroup.destroy();
        starterMenu.destroy();
        //instrPage.destroy();
        //instrButtonGroup.destroy();

        playAction();

    }

}

function instrPressed() {

    if(instrPageOpenBool == false)
    {
        instrAction();
    }

}


function backPressed() {

    backAction();

}




function overPlay() {
    console.log('button over play');
}

function outPlay() {
    console.log('button out play');
}

function overInstr() {
    console.log('button over instr');
}

function outInstr() {
    console.log('button out instr');
}

function overBack() {
    console.log('button over back');
}

function outBack() {
    console.log('button out back');
}

function instrAction()
{
    instrPageOpenBool = true;

    instrPage = game.add.sprite(0, 0, 'instructionPage');

    instrButtonGroup = game.add.group();

    //instrPage = game.add.sprite(0, 0, 'instructionPage');

    var backButton = game.make.button(game.world.width - 210, game.world.height - 64, 'backButtonOut', backPressed, this, 2, 1, 0);
    backButton.width = 200;
    backButton.height = 54;

    backButton.onInputOver.add(overBack, this);
    backButton.onInputOut.add(outBack, this);

    instrButtonGroup.add(backButton);

    instrPage.bringToTop();
    game.world.bringToTop(instrButtonGroup);    //bring groups to top
    //backButton.bringToTop();

    // game.world.remove(starterMenu);



}



function backAction()
{
    instrPageOpenBool = false;
    game.world.remove(instrPage);
    game.world.sendToBack(instrButtonGroup);

}
