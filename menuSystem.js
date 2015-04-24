/**
 * Created by b00225424 on 24/04/2015.
 */
var starterMenu, instrPage, instrButtonGroup, instrPageOpenBool, buttonGroup;



function startGame() {


    instrPageOpenBool = false;

}


function createButtons()
{
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




function playAction() {

    console.log('button clicked');
    tiles = game.add.group();
    createMap();

    barBackground = game.add.sprite(0, 0, 'healthBarBackground');
    healthBarBlue = game.add.sprite(0, 0, 'healthBarBlue');

    barBackground2 = game.add.sprite(game.world.width - 20, 0, 'healthBarBackground');
    healthBarRed = game.add.sprite(game.world.width - 20, 0, 'healthBarRed');


    setPlayerTeams(playerTeam);

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