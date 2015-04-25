var tiles, player, enemy = {}, tileWidth, tileHeight, scoreText, scoreTimer, serverTimer, game, barBackground, barBackground2, healthBarBlue, healthBarRed;
var starterMenu, instrPage, instrButtonGroup, instrPageOpenBool, buttonGroup, serverBackground, gameCanvas;
var red = {}, blue = {};

/** The tile map used by the game. 0 is team territory, 1 is turret space, 2 is neutral ground, 3 is the blue goal zone and 4 is the red goal zone
 *
 * @type {*[]}
 */

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

/** Array of tiles containing images corresponding to the numbers in the tile map.
 *
 * @type {*[]}
 */

var tileImages = [
    {key: "blueTile", src: "assets/blueBaseTileTurnip.png"},
    {key: "redTile", src: "assets/redBaseTileTurnip.png"},
    {key: "canWalkTile", src: "assets/grass2TileTurnip.png"},
    {key: "noWalkTile", src: "assets/turretBaseStoneTileTurnip.png"},
    {key: "neutralTile", src: "assets/pathLightTileTurnip.png"}
];

/** Loads all images for later manipulation
 *
 */

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

    game.load.image('serverBackground', 'assets/serverBackground.jpg');

}

/** Called when the game first loads and if the game is restarted. Creates a new Phaser game element
 *
 */

function loadGame() {

    $("#playerList").html("");
    gameCanvas = $("#gameCanvas");
    if (game)game.destroy();
    game = new Phaser.Game(1100, 500, Phaser.AUTO, gameCanvas, {
        preload: preload,
        create: createButtons,
        update: update
    });

}

/** Remove the main menu
 *
 */

function removeGroup() {

    game.world.remove(buttonGroup);

    buttonGroup.destroy();

}

/** Hide all menus and start the game
 *
 */

function startGame() {

    game.world.remove(serverBackground);

    $("#hostSettings").hide();
    $("#playerList").hide();
    createMap();

    createHealthBars();
    setPlayerTeams(playerTeam);

}

/** Create a player object and a pool of turrets and soldiers for each team colour
 *
 * @param playerTeam - The colour of the player's team. Used to determine the colour of soldiers and turrets used.
 */

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

    if (playerTeam == "red")enemy = new Player("blue");
    else enemy = new Player("red");

    forEachSoldier(function (soldier) {
        soldier.speed = 80;
        animateSoldiers(soldier);
    });

    createFundsText();

    //Start the timer to recieved periodic updates from the server

    startTimer();

}

/** Create and display a health bar for each player at the left and right hand sides of the screen
 *
 */

function createHealthBars() {

    barBackground = game.add.sprite(0, 0, 'healthBarBackground');
    healthBarBlue = game.add.sprite(0, 0, 'healthBarBlue');

    barBackground2 = game.add.sprite(game.world.width - 20, 0, 'healthBarBackground');
    healthBarRed = game.add.sprite(game.world.width - 20, 0, 'healthBarRed');

}

/** Move all game elements and handle collisions on every frame
 *
 */

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

/** Show the server screen with a name input box and buttons to either host or join a game
 *
 */

function showServerScreen() {

    $("#hostSettings").show();
    $("#playerList").show();
    serverBackground = game.add.sprite(0, 0, 'serverBackground');
    console.log('button clicked');
    tiles = game.add.group();

}

/** Loop through each soldier in their respective object pool for both blue and red teams
 *
 * @param targetFunction - A function executed with the given parameter of the soldier currently being targeted by the loop.
 */

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

/** Loop through each turret in their respective object pool for both blue and red teams
 *
 * @param targetFunction - A function executed with the given parameter of the soldier currently being targeted by the loop.
 */

function forEachTurret(targetFunction) {

    red.turretPool.forEach(function (targetVar) {
        targetFunction(targetVar);
    });
    blue.turretPool.forEach(function (targetVar) {
        targetFunction(targetVar);
    });

}

/** Start a timer that periodically check for any changes in the game (e.g. a new player or turret).
 *
 */

function startTimer() {

    serverTimer = setInterval(function () {
        getAjax("https://webgamesdev-blaircalderwood.c9.io/update?name=" + playerName, updateListener);
    }, 200);

}

/** Handle any game over or disconnection scenarios and place any new object recieved from the server into the game
 *
 * @param update - An array of objects received from the server. Contains all new soldiers/turrets and indicates any game over/disconnect instances
 */

function updateListener(update) {

    //Inform the player if their partner disconnects
    if (update == "Partner Disconnected") {
        gameOver("The other player has disconnected.")
    }

    else if (update !== "Connection Problem") {

        var team = JSON.parse(update);

        for (var i = 0; i < team.length; i++) {

            //If the enemy has been defeated inform the player that they have won.
            if (team[i] == "Blue Dead" && player.team !== "blue")gameOver("The enemy is dead. You have won!");

            //If the player has been defeated inform the player that they have lost.
            else if (team[i] == "Red Dead" && player.team !== "red")gameOver("The enemy is dead. You have won!");

            //Spawn any newly placed soldiers
            else if (team[i].type == "soldier") {
                spawnPlayerOnObject(team[i].x, team[i].y, team[i].team);
            }

            //Spawn any newly placed turrets
            else if (team[i].type == "turret") {
                spawnTurretOnObject(team[i].x, team[i].y, team[i].team);
            }
        }

    }

}

/** Remove a soldier from the game if they have been hit by a bullet.
 *
 * @param bullet - The bullet that has collided with a soldier.
 * @param soldier - The soldier that has collided with a bullet.
 */

function collisionHandler(bullet, soldier) {

    if (bullet.team !== soldier.team) {

        bullet.kill();

        soldier.kill();

        //Play the explosion animation where the soldier was hit
        var explosion = player.explosionPool.getFirstExists(false);
        explosion.reset(soldier.body.x, soldier.body.y);


        player.explosionPool.forEach(function (explosion) {
            explosion.animations.add('explode');
            explosion.animations.play('explode', 15, false, true);
        });

        //Add funds if the player's bullet hit an enemy soldier
        if (soldier.team !== player.team) {

            player.funds += 20;
            scoreText.text = "Funds: " + player.funds;

        }

    }
}

/** Move the soldiers along a designated path on each frame using a*
 *
 */

function moveSoldiers() {

    //Loop through each soldier in the game
    forEachSoldier(function (soldier) {

        if (soldier.alive) {

            //Only move soldiers that have not yet reached their goal
            if (soldier.path.length > 0) {
                var path = soldier.path;

                //Change the a* coordinates into game coordinates
                var pathX = path[soldier.pointer][0] * tileWidth + (tileWidth / 2);
                var pathY = path[soldier.pointer][1] * tileHeight + (tileHeight / 2);

                //Rotate to face direction of path and move towards next goal
                soldier.rotation = game.physics.arcade.moveToXY(soldier, pathX, pathY, soldier.speed);


                //Move onto the next section of the path is the end of the current section has been reached
                if (Math.round(soldier.x) == pathX && Math.round(soldier.y) == pathY) {

                    //Move diagonally if both the x and y axis of the path coordinates two places ahead in the list are different
                    if (path[soldier.pointer + 2]) {
                        if (path[soldier.pointer][0] !== path[soldier.pointer + 2][0] && path[soldier.pointer][1] !== path[soldier.pointer + 2][1]) {
                            soldier.pointer++;
                        }
                    }

                    soldier.pointer++;

                }

                //Check if the player has reached the end of the path
                if (soldier.pointer > path.length - 1) {
                    goalReached(soldier);
                }

            }

        }

    });

}

/** Update the game to show a player has reached the enemy's base
 *
 * @param soldier - The soldier which has reached the enemy's base
 */

function goalReached(soldier) {

    /** Update the appropriate health bar and player funds
     *
     * @param targetPlayer - Either the player or the enemy
     */

    function setHealthBar(targetPlayer) {

        if (targetPlayer.healthBar.height >= 50) {
            targetPlayer.healthBar.height -= 50;
            targetPlayer.healthBar.y += 50;

            targetPlayer.health -= 50;

            if (targetPlayer !== player) {
                targetPlayer.funds += 200;
                scoreText.text = "Funds: " + targetPlayer.funds + " Cts";
            }

        }

        //Inform server that the player is dead if their health has reached zero
        if (soldier.team !== player.team && player.health <= 0) {
            getAjax("https://webgamesdev-blaircalderwood.c9.io/playerDead?name=" + playerName, playerDead);
        }
    }

    //Check to see if it was a player or enemy soldier that reached its goal
    if (soldier.team !== player.team) {
        setHealthBar(player);
    }
    else {
        setHealthBar(enemy);
    }

    //Remove the soldier from the game
    soldier.kill();

}

/** Inform the player that they are dead
 *
 * @param data - Confirmation of death from the server
 */

function playerDead(data) {

    console.log(data);
    gameOver("You have lost the game")

}

/** Display a game over screen if the player has won/lost or the opposing player has disconnected from the game.
 *
 * @param text - Text to display on screen informing user of win/loss/disconnection
 */

function gameOver(text) {

    var gameOverMessage = $("#gameOverMessage");
    console.log(text);

    //Stop game from recieving server updates or adding to the player's score
    clearInterval(serverTimer);
    clearInterval(scoreTimer);

    //Show the game over screen
    serverBackground = game.add.sprite(0, 0, 'serverBackground');
    gameOverMessage.show();

    $("#gameOverText").html("<b>" + text + "</b>");

    //Ensure the game is not running in the background when the game over screen if showing
    game.paused = true;

    //Inform the server that the player has been told the game is over and so the server can delete their name from the host/joined list.
    getAjax("https://webgamesdev-blaircalderwood.c9.io/deadNotified?name=" + playerName, showMenuButtons)
}

/** Confirm that the host/joined name no longer includes the player
 *
 * @param data - Server confirmation of host/joined list name deletion
 */

function showMenuButtons(data) {

    console.log(data);

}

/** Move each turret in the game towards any soldier that is in their vicinity
 *
 */

function moveTurrets() {

    forEachSoldier(function (soldier) {

        if (soldier.alive) {
            forEachTurret(function (turret) {

                if (turret.alive) {
                    console.log(turret);
                    if (game.physics.arcade.distanceBetween(turret, soldier) < 250 && turret.team !== soldier.team) {
                        rotate(turret, soldier);

                    }

                }

            });

        }
    });

}

/** Fire a bullet towards a soldier.
 *
 * @param turret - The turret that is firing the bullet.
 * @param target - The soldier that is being targeted by the turret.
 *  @param angle - Angle at which the bullet will fire.
 */

fireBullet = function (turret, target, angle) {

    //Check that the fire rate has not been exceeded
    if (game.time.now > turret.nextFire && turret.bullets.countDead() > 0) {

        turret.nextFire = game.time.now + turret.fireRate;

        //Set the bullet position and angle to that of the turret
        var bullet = turret.bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        bullet.rotation = angle;

        //Move the bullet at the current angle of the turret
        var cosAngle = (Math.cos(angle) * 10) + turret.x;
        var sinAngle = (Math.sin(angle) * 10) + turret.y;

        game.physics.arcade.moveToXY(bullet, cosAngle, sinAngle, 500);

        turret.bringToTop();

    }

};

/** Rotate a turret towards a soldier at a constant speed (prevents jumping to face target).
 *
 * @param turret - Turret to rotate.
 * @param target - Soldier to rotate towards turret towards.
 */

rotate = function (turret, target) {

    var totalRotation = game.physics.arcade.angleBetween(turret, target) - turret.rotation;

    if (totalRotation <= -turret.speed)turret.rotation -= turret.speed;
    else if (totalRotation >= turret.speed)turret.rotation += turret.speed;

    fireBullet(turret, target, turret.rotation);

};

/** Create the map based on the tileMap object and display it on screen.
 *
 */

function createMap() {

    game.add.tileSprite(0, 0, game.width, game.height, "canWalkTile");

    var tileName, inputEnabled, listenerFunction;
    tileWidth = game.width / gridCoords.length;
    tileHeight = game.height / gridCoords[0].length;

    //Loop through all tiles in tile map and place relevant tile on screen
    for (var i = 0; i < gridCoords.length; i++) {
        for (var j = 0; j < gridCoords[0].length; j++) {

            switch (gridCoords[i][j]) {

                case 0:
                    tileName = "canWalkTile";

                    //Create new soldier if tile is clicked.
                    inputEnabled = true;
                    listenerFunction = newSoldier;
                    break;

                case 1:
                    tileName = "noWalkTile";

                    //Create new turret if tile is clicked.
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

            //Add relevant tile to game
            var newTile = game.add.sprite(tileWidth * i, tileHeight * j, tileName);
            newTile.width = tileWidth;
            newTile.height = tileHeight;
            newTile.inputEnabled = inputEnabled;

            //Listen for mouse clicks on relevant tiles
            if (inputEnabled == true) newTile.events.onInputDown.add(listenerFunction, this);

        }
    }

}

/** Update the funds text at the top of the screen.
 *
 */

function createFundsText() {

    var style = {font: "30px Arial", fill: "#FFFFFF", align: "center"};
    scoreText = game.add.text(game.world.centerX, game.world.centerY / 8, "Funds: " + player.funds + " Cts", style);
    scoreText.anchor.set(0.5);

    //Add 100 to the funds every three seconds
    scoreTimer = setInterval(function () {
        player.funds += 100;
        scoreText.text = "Funds: " + player.funds + " Cts";
    }, 3000);

}

/** Check if player is clicking in their own half.
 *
 * @param xCoord - X coordinate of mouse click.
 * @returns {boolean} - True if player clicked in their own half.
 */

function isInOwnHalf(xCoord) {
    return ((xCoord < (game.width / 2) && player.team == "blue") || (xCoord > (game.width / 2) && player.team == "red"))
}

/** Create a new soldier and send the data to the server.
 *
 * @param listener - Listener object. Byproduct of Phaser's event handler and not used.
 * @param pointer - Mouse object.
 */
function newSoldier(listener, pointer) {

    //Check that the player has enough funds to place a new soldier
    if (player.funds >= 50) {

        //Check which tile was clicked
        var targetTile = getTargetTile(pointer);

        //If the tile was clicked in own half send new soldier data to the server. It will get inserted into game on next call of updateListener function.
        if (isInOwnHalf(targetTile.x)) {
            //spawnPlayerOnObject(targetTile.x, targetTile.y);
            console.log("Player placed");
            getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=soldier&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
        }

        //Remove funds from player
        player.funds -= 50;
        scoreText.text = "Funds: " + player.funds + " Cts";

    }

}

/** Create a new turret and send the data to the server.
 *
 * @param listener - Listener object. Byproduct of Phaser's event handler and not used.
 * @param pointer - Mouse object.
 */
function newTurret(listener, pointer) {

    //Check that the player has enough funds to place a new turret
    if (player.funds >= 700) {

        //Check which tile was clicked
        var targetTile = getTargetTile(pointer);

        //If the tile was clicked in own half send new turret data to the server. It will get inserted into game on next call of updateListener function.
        if (isInOwnHalf(targetTile.x)) {
            getAjax("https://webgamesdev-blaircalderwood.c9.io/placeNew?name=" + playerName + "&team=" + player.team + "&type=turret&x=" + JSON.stringify(targetTile.x) + "&y=" + JSON.stringify(targetTile.y), itemPlaced);
        }

        //Remove funds from player
        player.funds -= 700;
        scoreText.text = "Funds: " + player.funds + " Cts";

    }

}

/** Confirm server has received new soldier/turret data
 *
 * @param data
 */

function itemPlaced(data) {
    console.log(data);
}

/** Get data from the server and execute a callback upon receiving.
 *
 * @param url - Server URL
 * @param callback - Function to execute when data is recieved from the server.
 */

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

/** Upon receiving new soldier data from the server place a new soldier in the game.
 *
 * @param x - X coordinate of new soldier.
 * @param y - Y coordinate of new soldier.
 * @param team - Team colour of new soldier.
 */

function spawnPlayerOnObject(x, y, team) {

    var newSoldier = new Soldier(x, y, team);
    newSoldier.bringToTop();

}

/** Upon receiving new turret data from the server place a new soldier in the game.
 *
 * @param x - X coordinate of new turret.
 * @param y - Y coordinate of new turret.
 * @param team - Team colour of new turret.
 */
function spawnTurretOnObject(x, y, team) {

    var newTurret;

    newTurret = new Turret(team, x, y);

}

/** Check which tile has been clicked.
 *
 * @param pointer - Mouse coordinates
 * @returns {{x: number, y: number}} - The coordinates of the center of the tile that has been clicked.
 */
function getTargetTile(pointer) {

    var objX = Math.floor(pointer.x / tileWidth) * tileWidth + (tileWidth / 2);
    var objY = Math.floor(pointer.y / tileHeight) * tileHeight + (tileHeight / 2);

    return {x: objX, y: objY};
}

/** Create the main menu.
 *
 */

function createButtons() {

    //Hide the DOM elements
    $("#hostSettings").hide();
    $("#gameOverMessage").hide();

    instrPageOpenBool = false;

    //Add the menu to the game
    starterMenu = game.add.sprite(0, 0, 'startMenu');
    buttonGroup = game.add.group();

    var playButton = game.make.button(200, 175, 'playButtonOut', playPressed, this, 2, 1, 0);
    playButton.width = 328;
    playButton.height = 124;

    var instructionButton = game.make.button(200, 325, 'instructionButtonOut', instrAction, this, 2, 1, 0);
    instructionButton.width = 328;
    instructionButton.height = 124;

    buttonGroup.add(playButton);
    buttonGroup.add(instructionButton);
}

/** Remove the main menu and show the server screen if play is pressed.
 *
 */

function playPressed() {

    if (instrPageOpenBool == false) {

        game.world.remove(buttonGroup);

        buttonGroup.destroy();
        starterMenu.destroy();

        showServerScreen();

    }

}

/** Show the instruction screen.
 *
 */

function instrAction() {

    if (instrPageOpenBool == false) {

        instrPageOpenBool = true;

        instrPage = game.add.sprite(0, 0, 'instructionPage');

        instrButtonGroup = game.add.group();

        //Create and show a back button for navigation to the main menu
        var backButton = game.make.button(game.world.width - 210, game.world.height - 64, 'backButtonOut', backAction, this, 2, 1, 0);
        backButton.width = 200;
        backButton.height = 54;

        instrButtonGroup.add(backButton);

        instrPage.bringToTop();
        game.world.bringToTop(instrButtonGroup);

    }

}

/** Navigate from instruction page to main menu.
 *
 */

function backAction() {
    instrPageOpenBool = false;
    game.world.remove(instrPage);
    game.world.sendToBack(instrButtonGroup);

}
