//Please note the following file is run on the Cloud 9 Service and has only been included here to aid code understanding

var express = require("express");
var app = module.exports = express();

var hostNameList = [];
var joinedNameList = [];
var oldHostNameList = [];
var oldJoinedNameList = [];

var playerPairs = [{
    red: {},
    blue: {}
}];

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

/** Save the name of the newly created host to the server database
 *
 * @param req - Contains new host name received from client
 * @param res - Data to be sent to client
 */

app.get('/saveName', function(req, res) {

    if (hostNameList.indexOf(req.query.name) == -1 && joinedNameList.indexOf(req.query.name) == -1) {

        hostNameList.push(req.query.name);
        res.jsonp(JSON.stringify(hostNameList));

    }

    else res.jsonp("false");

});

/** Check that the joining player's chosen name is free to use
 *
 * @param req - Contains new joining player name received from client
 * @param res - Data to be sent to client
 */

app.get('/checkName', function(req, res) {

    if (hostNameList.indexOf(req.query.name) == -1 && joinedNameList.indexOf(req.query.name) == -1) {

        res.jsonp(JSON.stringify(hostNameList));
        joinedNameList.push(req.query.name);

    }

    else res.jsonp("false");

});

/** Allows a joining player to select a host from the host list and pairs the two together then starts the game
 *
 * @param req - Contains chosen host name
 * @param res - Data to be sent to client
 */

app.get('/selectHost', function(req, res) {

    var newPair = {};
    newPair.red = {};
    newPair.blue = {};

    newPair.red.name = req.query.name;
    newPair.blue.name = req.query.selectedName;
    newPair.red.updates = [];
    newPair.blue.updates = [];
    newPair.blue.ready = false;

    newPair.red.timeout = 0;
    newPair.blue.timeout = 0;

    playerPairs.push(newPair);

    res.jsonp(JSON.stringify(playerPairs));

});

/** Send data back to hosting players when another player has joined their game
 * @param req - Contains name of host
 * @param res - Response confirming that another player has joined
 */

app.get('/checkHost', function(req, res) {

    var joined = false;

    var arrayIndex = searchForBluePlayer(req.query.name);
    if (arrayIndex >= 0) {
        if (playerPairs[arrayIndex].red.name !== "") {
            joined = true;
        }
    }
    else {
        arrayIndex = searchForRedPlayer(req.query.name);
        if (arrayIndex >= 0) {
            if (playerPairs[arrayIndex].blue.name !== "") {
                joined = true;
            }
        }
    }

    if (joined == true) res.jsonp("Joined");
    else res.jsonp("false");

});

/** Add any newly placed soldiers or turrets to an array to be sent to each relevant player
 * @param req - Contains newly placed turret or soldier
 * @param res - Confirmation of successful placement to be sent to client
 */

app.get('/placeNew', function(req, res) {

    var arrayIndex = searchForBluePlayer(req.query.name);


    if (arrayIndex == -1) {

        arrayIndex = searchForRedPlayer(req.query.name);

    }
    if (arrayIndex >= 0) {
        playerPairs[arrayIndex].blue.updates.push({
            team: req.query.team,
            type: req.query.type,
            x: JSON.parse(req.query.x),
            y: JSON.parse(req.query.y)
        });

        playerPairs[arrayIndex].red.updates.push({
            team: req.query.team,
            type: req.query.type,
            x: JSON.parse(req.query.x),
            y: JSON.parse(req.query.y)
        });

        res.jsonp("Item Placed");

    }

    else res.jsonp("Item Not Placed");

});

/** Inform a player if their partner has lost the game
 * @param req - Contains name of player who has just died
 * @param res - Notification of player death sent to partner
 */

app.get('/playerDead', function(req, res) {

    var arrayIndex = searchForBluePlayer(req.query.name) || -1;

    if (arrayIndex >= 0) {

        console.log("Blue Player Dead");
        playerPairs[arrayIndex].red.updates.push("Blue Dead");
        playerPairs[arrayIndex].blue.updates.push("Blue Dead");

    }

    else {

        arrayIndex = searchForRedPlayer(req.query.name);

        if (arrayIndex >= 0) {

            console.log("Red Player Dead");
            playerPairs[arrayIndex].blue.updates.push("Red Dead");
            playerPairs[arrayIndex].red.updates.push("Red Dead");

        }

    }

    res.jsonp("Player is dead");

});

/** Confirmation received from both players that they received and acted on the player death notification
 * @param req - Contains name of player confirming they have acted on death notification (e.g. displayed game over screen)
 * @param res - Data to be sent to client
 */
app.get('/deadNotified', function(req, res) {

    var arrayIndex = searchForBluePlayer(req.query.name) || -1;

    if (arrayIndex >= 0) {
        playerPairs[arrayIndex].blue.delete = true;
        deletePlayer(arrayIndex);
    }

    else {

        arrayIndex = searchForRedPlayer(req.query.name);

        if (arrayIndex >= 0) {
            playerPairs[arrayIndex].red.delete = true;
            deletePlayer(arrayIndex);

        }

    }

    res.jsonp("Dead Notified");

});

/** Deletes a player from the host or joined list once their game is finished or they have disconnected
 *
 * @param arrayIndex - Index of joined or host array pointing to the player that should be deleted
 */

function deletePlayer(arrayIndex) {

    if (playerPairs[arrayIndex].red.delete == true && playerPairs[arrayIndex].blue.delete == true) {

        if (hostNameList.indexOf(playerPairs[arrayIndex].blue.name) !== -1) {
            hostNameList.splice(hostNameList.indexOf(playerPairs[arrayIndex].blue.name), 1);
        }
        if (hostNameList.indexOf(playerPairs[arrayIndex].red.name) !== -1) {
            hostNameList.splice(hostNameList.indexOf(playerPairs[arrayIndex].red.name), 1);
        }
        if (joinedNameList.indexOf(playerPairs[arrayIndex].red.name) !== -1) {
            joinedNameList.splice(joinedNameList.indexOf(playerPairs[arrayIndex].red.name), 1);
        }
        if (joinedNameList.indexOf(playerPairs[arrayIndex].blue.name) !== -1) {
            joinedNameList.splice(joinedNameList.indexOf(playerPairs[arrayIndex].blue.name), 1);
        }

        console.log(hostNameList);
        console.log(joinedNameList);
        playerPairs.splice(arrayIndex, 1);

    }

}

/** Inform players of any new soldiers or turrets placed in game
 * @param req - Contains name of player that is requesting an update
 * @param res - An array of all new in game objects
 */

app.get('/update', function(req, res) {

    var arrayIndex = searchForBluePlayer(req.query.name) || -1;

    if (arrayIndex >= 0) {

        if (playerPairs[arrayIndex].red.timeout >= 30) {
            res.jsonp("Partner Disconnected");
            deletePlayer(arrayIndex);
        }
        else {

            res.jsonp(JSON.stringify(playerPairs[arrayIndex].blue.updates));
            playerPairs[arrayIndex].blue.updates = [];
            playerPairs[arrayIndex].blue.timeout = 0;

            playerPairs[arrayIndex].red.timeout++;

        }

    }
    else {

        arrayIndex = searchForRedPlayer(req.query.name);

        if (arrayIndex >= 0) {

            if (playerPairs[arrayIndex].blue.timeout >= 30) {
                res.jsonp("Partner Disconnected");
                deletePlayer(arrayIndex);
            }
            else {

                res.jsonp(JSON.stringify(playerPairs[arrayIndex].red.updates));
                playerPairs[arrayIndex].red.updates = [];
                playerPairs[arrayIndex].red.timeout = 0;


                playerPairs[arrayIndex].blue.timeout++;

            }

        }
        else {
            res.jsonp("Connection Problem");
        }

    }

});

/** Search all blue team players for a specific player name
 *
 * @param playerName - Name of player to search for
 * @returns {number} - Array index of player name (-1 if name was not found)
 */

function searchForBluePlayer(playerName) {

    var arrayIndex = -1;


    for (var i = 0; i < playerPairs.length; i++) {

        if (playerPairs[i].blue.name == playerName) {
            arrayIndex = i;

        }

    }

    return arrayIndex;
}

/** Search all red team players for a specific player name
 *
 * @param playerName - Name of player to search for
 * @returns {number} - Array index of player name (-1 if name was not found)
 */


function searchForRedPlayer(playerName) {

    var arrayIndex = -1;

    for (var i = 0; i < playerPairs.length; i++) {

        if (playerPairs[i].red.name == playerName) {
            arrayIndex = i;

        }

    }

    return arrayIndex;
}

app.listen(process.env.PORT);