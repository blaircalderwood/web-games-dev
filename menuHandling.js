var hostTimer, playerName, hostList, playerTeam;

/** Accessed via the on screen 'Host Game' and 'Join Game' buttons. The function sends the user's chosen name to the server to ensure it is available for use
 *
 * @param hosting - boolean which is set to true if the 'Host Game' button has been pressed
 */

function submitName(hosting) {

    playerName = $("#nameInput").val();

    if (hosting) getAjax("https://webgamesdev-blaircalderwood.c9.io/saveName?name=" + playerName, hostWait);
    else getAjax("https://webgamesdev-blaircalderwood.c9.io/checkName?name=" + playerName, checkName);

}

/** Called if the user wishes to join a game. Creates a list of all of the available hosts and displays on screen.
 *
 * @param availability - Recieved from the server. Contains a list of available hosts if chosen name is available and returns false if unavailable
 */

function checkName(availability) {

    var playerList = $("#playerList");
    playerList.html("");
    var newHTML = "";

    if (availability !== "false") {

        availability = JSON.parse(availability);

        if (availability.length == 0) {
            playerList.html("<h2 style='color: white;'><b>There are no games available. Please consider hosting one.</b></h2>");
        }
        console.log(availability);
        hostList = availability;

        newHTML = "<ul style='list-style-type: none'>";
        for (var i = 0; i < availability.length; i++) {

            console.log(availability[i]);
            newHTML += "<li><button class='hostList' data-index='" + i + "' onclick='selectHost(this)'>" + availability[i] + "</button></li>";

        }

        newHTML += "</ul>";
        playerList.append(newHTML);

    }

    else {
        playerList.html("<h1 style='color: white;'><b>Name is unavailable. Please select another.</b></h1>");
    }

}

/** Called after a host is selected from the list. Informs the server of this selection and starts the game
 *
 * @param listItem - Chosen host
 */

function selectHost(listItem) {

    console.log($(listItem).data('index'));

    console.log(hostList[$(listItem).data('index')]);

    getAjax("https://webgamesdev-blaircalderwood.c9.io/selectHost?name=" + playerName + "&selectedName=" + hostList[$(listItem).data('index')], playGame);

}

/** Set the team colour and play the game
 *
 * @param data - confirmation of connection to host recieved from server
 */

function playGame(data) {

    playerTeam = "red";
    console.log(JSON.parse(data));
    startGame();

}

/** If the player has chosen to be a host inform them that the game will start once a player joins then periodically check the server for a joined player
 *
 * @param availability - Received from the server. Returns false if name is unavailable
 */

function hostWait(availability) {

    var playerList = $("#playerList");
    if (availability !== "false") {

        playerList.html("<h1 style='color: white;'><b>Game created. Waiting for player to join</b></h1>");

        hostTimer = setInterval(function () {

            getAjax("https://webgamesdev-blaircalderwood.c9.io/checkHost?name=" + playerName, playerJoined);

        }, 500)
    }
    else playerList.html("<h1 style='color: white;'><b>Name is unavailable. Please select another.</b></h1>");

}

/** Play the game once another player joins the host
 *
 * @param data - Received from the server. Confirmation that another player has joined.
 */

function playerJoined(data) {

    if (data !== "false") {

        playerTeam = "blue";
        console.log(data);
        clearInterval(hostTimer);

        startGame();

    }

}