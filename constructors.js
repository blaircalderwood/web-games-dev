/** Create a new player or enemy object.
 *
 * @param team - Team colour
 * @constructor
 */
var Player = function (team) {

    //Create a new pool of explosion animations to use on soldier death
    this.explosionPool = new ExplosionPool();

    //Set up player variables
    this.funds = 1000;
    this.health = 500;
    this.team = team;

    //Assign the relevant health bar to the player
    if(team == "blue")
    {
        this.healthBar = healthBarBlue;
    }
    else this.healthBar = healthBarRed;

};

/** Create a new soldier.
 *
 * @param x - X coordinate of tile to create soldier in.
 * @param y - Y coordinate of tile to create soldier in.
 * @param team - Team colour of soldier.
 * @returns {*} - New soldier object.
 * @constructor
 */

var Soldier = function (x, y, team) {

    var newSoldier;

    /** Create a path for the player to follow towards the enemy base using a*.
     *
     * @param targetX - X coordinate of enemy base.
     * @param targetY - Y coordinate of enemy base.
     */

    function posAndPath(targetX, targetY) {

        //Move the new soldier to the clicked tile
        newSoldier.reset(x, y);

        //Find a new path towards the enemy base using a*
        newSoldier.path = findPath([Math.floor(newSoldier.x / tileWidth), Math.floor(newSoldier.y / tileHeight)], [targetX, targetY]);
        console.log(newSoldier.path);

        newSoldier.pointer = 0;

    }

    //If the soldier is in the blue team move towards the red base
    if (team == "blue") {

        if (blue.soldierPool.countDead() > 0) {

            newSoldier = blue.soldierPool.getFirstExists(false);

            posAndPath(10, 2);

        }

    }

    //If the soldier is in the red team move towards the blue base
    else {

        if (red.soldierPool.countDead() > 0) {

            newSoldier = red.soldierPool.getFirstExists(false);
            posAndPath(0, 2);
            console.log(newSoldier);

        }

    }

    newSoldier.team = team;

    return newSoldier;

};

/** Create a new turret.
 * 
 * @param team - Team colour of soldier.
 * @param x - X coordinate of tile to create turret in.
 * @param y - Y coordinate of tile to create turret in.
 * @returns {*} - New turret.
 * @constructor
 */
var Turret = function (team, x, y) {

    var newTurret;

    if (team == "blue") newTurret = blue.turretPool.getFirstExists(false);

    else newTurret = red.turretPool.getFirstExists(false);

    //Set position of turret to clicked tile
    newTurret.reset(x, y);

    //Set up turret variables
    newTurret.nextFire = 0;

    newTurret.bullets = new BulletPool(team);

    newTurret.fireRate = 2000;
    newTurret.speed = 0.008;

    newTurret.anchor.setTo(0.3, 0.5);

    newTurret.team = team;

    return newTurret;

};

/** Create a new pool of bullets for turrets to fire.
 * 
 * @param team - Team colour of bullet pool.
 * @returns {*} - New bullet pool.
 * @constructor
 */
    
var BulletPool = function (team) {

    var bullets = setUpPool();

    //Create a pool of bullets in the correct colour
    if (team == "blue") {
        bullets.createMultiple(30, 'blueBullet', 0, false);
    } else {
        bullets.createMultiple(30, 'redBullet', 0, false);
    }

    //Set variables for each bullet
    bullets.setAll('team', team);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    return bullets;

};

/** Create a new pool of turrets to spawn.
 *
 * @param team - Team colour of turret pool.
 * @returns {*} - New turret pool.
 * @constructor
 */
    
var TurretPool = function (team) {

    var turrets = setUpPool();

    //Create a pool of turrets in the correct colour
    if (team == "blue") {
        turrets.createMultiple(5, 'blueTurret', 0, false);
    } else {
        turrets.createMultiple(5, 'redTurret', 0, false);
    }

    //Set variables for each bullet
    turrets.setAll('anchor.x', 0.5);
    turrets.setAll('anchor.y', 0.5);

    return turrets;

};

/** Create a new pool of soldiers to spawn.
 *
 * @param team - Team colour of soldier pool.
 * @returns {*} - New soldier pool.
 * @constructor
 */
    
var SoldierPool = function (team) {

    var soldiers = setUpPool();

    //Create a pool of turrets in the correct colour
    if (team == "blue") {
        soldiers.createMultiple(30, 'player', 0, false);
    }
    else {
        soldiers.createMultiple(30, 'player2', 0, false);
    }

    //Set variables for each bullet
    soldiers.setAll('anchor.x', 0.5);
    soldiers.setAll('anchor.y', 0.5);
    soldiers.setAll('outOfBoundsKill', true);
    soldiers.setAll('checkWorldBounds', true);

    return soldiers;

};

/** Create a new pool of explosions to spawn.
 *
 * @returns {*} - New explosion pool.
 * @constructor
 */

var ExplosionPool = function () {

    var explosions = setUpPool();
    explosions.createMultiple(30, 'kaboom', 0, false);

    return explosions;

};

/** Create a group and enable physics on pools of objects.
 *
 * @returns {*} - new object pool.
 */

function setUpPool() {
    
    var pool = game.add.group();
    pool.enableBody = true;
    pool.physicsBodyType = Phaser.Physics.ARCADE;
    return pool;
    
}