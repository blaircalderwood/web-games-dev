var game = new Phaser.Game(1100, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var tiles, player = {}, tileWidth, tileHeight;

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
    {key: "noWalkTile", src: "assets/noWalkTile.jpg"},
    {key: "neutralTile", src: "assets/neutralTile.jpg"}
];

function preload() {

    for (var i = 0; i < tileImages.length; i++) game.load.image(tileImages[i].key, tileImages[i].src);

    game.load.image('player', 'assets/ship.png');

}

function create() {

    player.soldiers = [];

    tiles = game.add.group();

    createMap();

}

function update() {

    moveSoldiers();

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

function createMap() {

    var tileName, inputEnabled;
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
                    break;
                case 1:
                    tileName = "noWalkTile";
                    inputEnabled = false;
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

            if (inputEnabled == true) newTile.events.onInputDown.add(spawnPlayerOnObject, this);

        }
    }

}

spawnPlayerOnObject = function (listener, pointer) {

    var objWidth = Math.floor(pointer.x / tileWidth) * tileWidth + (tileWidth / 2);
    var objHeight = Math.floor(pointer.y / tileHeight) * tileHeight + (tileHeight / 2);

    var newSoldier = game.add.sprite(objWidth, objHeight, 'player');
    game.physics.arcade.enable(newSoldier);
    newSoldier.bringToTop();
    newSoldier.anchor.setTo(0.5, 0.5);

    newSoldier.path = findPath([Math.floor(newSoldier.x / tileWidth), Math.floor(newSoldier.y / tileHeight)], [0, 0]);

    newSoldier.pointer = 0;

    player.soldiers.push(newSoldier);

};