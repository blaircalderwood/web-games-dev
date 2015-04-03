var game = new Phaser.Game(1100, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var tiles, player, tileWidth, tileHeight, path, pointer = 0;

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

    tiles = game.add.group();

    createMap();

    spawnPlayer();

}

function update() {

    if (path) {

        var pathX = path[pointer][0] * tileWidth + (tileWidth / 2);
        var pathY = path[pointer][1] * tileHeight + (tileHeight / 2);

        console.log("PATH: " + pathX, pathY);
        console.log(player.x, player.y);

        game.physics.arcade.moveToXY(player, pathX, pathY, 50);

    }

    if(Math.round(player.x) == pathX && Math.round(player.y) == pathY){
        console.log(pointer);
        pointer ++;

    }

}

function createMap() {

    var tileName;
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
                    break;
                case 1:
                    tileName = "noWalkTile";
                    break;
                case 2:
                    tileName = "neutralTile";
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;
                case 3:
                    tileName = "blueTile";
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;
                case 4:
                    tileName = "redTile";
                    //Change to 0 for simpler path finding
                    gridCoords[i][j] = 0;
                    break;

            }

            var newTile = game.add.sprite(tileWidth * i, tileHeight * j, tileName);
            newTile.width = tileWidth;
            newTile.height = tileHeight;
        }
    }

}

function spawnPlayer() {

    player = game.add.sprite((game.width / 2), Math.random() * game.height, 'player');
    game.physics.arcade.enable(player);
    player.bringToTop();

    path = findPath([Math.floor(player.x / tileWidth), Math.floor(player.y / tileHeight)], [0, 0]);
    console.log(path);

}