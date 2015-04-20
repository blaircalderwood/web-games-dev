var hostTimer, playerName, hostList;

function submitName(hosting) {

    playerName = $("#nameInput").val();

    if (hosting) getAjax("https://webgamesdev-blaircalderwood.c9.io/saveName?name=" + playerName, hostWait);
    else getAjax("https://webgamesdev-blaircalderwood.c9.io/checkName?name=" + playerName, checkName);

}

function checkName(availability) {

    var newHTML = "";

    if (availability !== "false") {

        availability = JSON.parse(availability);

        console.log(availability);
        hostList = availability;

        newHTML = "<ul>";
        for (var i = 0; i < availability.length; i++) {

            console.log(availability[i]);
            newHTML += "<li><a data-index='" + i + "' onclick='selectHost(this)'>" + availability[i] + "</a></li>";

        }

        newHTML += "</ul>";
        $("#playerList").append(newHTML);

    }

    else {
        console.log("Name Unavailable");
    }

}

function selectHost(listItem){

    console.log($(listItem).data('index'));

    console.log(hostList[$(listItem).data('index')]);

    getAjax("https://webgamesdev-blaircalderwood.c9.io/selectHost?name=" + playerName + "&selectedName=" + hostList[$(listItem).data('index')], playGame);

}

function playGame(data){

    console.log(JSON.parse(data));

}

function hostWait(availability) {

    console.log("Game created. Waiting for player to join");

    if (availability !== "false") {

            hostTimer = setInterval(function () {

                getAjax("https://webgamesdev-blaircalderwood.c9.io/checkHost?name=" + playerName, playerJoined);

            }, 200)
    }

}

function playerJoined(data){

    if(data == "Player Joined"){

        console.log(data);
        clearInterval(hostTimer);

    }

}