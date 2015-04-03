var game = new Phaser.Game(1100, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var tiles;

var gridCoords = [[3, 3, 3, 3, 3], [0, 0, 0, 0, 0], [1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [0, 1, 0, 1, 0], [2, 2, 2, 2, 2],
    [0, 1, 0, 1, 0], [0, 0, 0, 0, 0], [1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [4, 4, 4, 4, 4]];

var tileImages = [{key: "blueTile", src: "Images/blueGoalTile.jpg"},
    {key: "redTile", src: "Images/redGoalTile.jpg"},
    {key: "canWalkTile", src: "Images/canWalkTile.jpg"},
    {key: "noWalkTile", src: "Images/noWalkTile.jpg"},
    {key: "neutralTile", src: "Images/neutralTile.jpg"}];

function preload() {

    for(var i = 0; i < tileImages.length; i ++) game.load.image(tileImages[i].key, tileImages[i].src);

}

function create() {

    var tileName;
    var tileWidth = game.width / gridCoords.length;
    var tileHeight = game.height / gridCoords[0].length;

    tiles = game.add.group();

    for(var i = 0; i < gridCoords.length; i ++){
        for (var j = 0; j < gridCoords[0].length; j ++){

            if(gridCoords[i][j] == 0){
              tileName = "canWalkTile";
            }
            else{
                tileName = "noWalkTile";
            }

            switch(gridCoords[i][j]){

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

function update() {
}