var hostTimer, playerName, hostList, playerTeam;

function submitName(hosting) {

    playerName = $("#nameInput").val();

    if (hosting) getAjax("https://webgamesdev-blaircalderwood.c9.io/saveName?name=" + playerName, hostWait);
    else getAjax("https://webgamesdev-blaircalderwood.c9.io/checkName?name=" + playerName, checkName);

}

function checkName(availability) {

    var playerList = $("#playerList");
    playerList.html("");
    var newHTML = "";

    if (availability !== "false") {

        availability = JSON.parse(availability);

        if(availability.length == 0){
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

function selectHost(listItem){

    console.log($(listItem).data('index'));

    console.log(hostList[$(listItem).data('index')]);

    getAjax("https://webgamesdev-blaircalderwood.c9.io/selectHost?name=" + playerName + "&selectedName=" + hostList[$(listItem).data('index')], playGame);

}

function playGame(data){

    playerTeam = "red";
    console.log(JSON.parse(data));
    actionOnClick();

}

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

function playerJoined(data){

    if(data !== "false"){

        playerTeam = "blue";
        console.log(data);
        clearInterval(hostTimer);

        actionOnClick();

    }

}