

//Inspiration taken from aStar tutorial at http://buildnewgames.com/astar/

/**Find the most efficient path using the A* algorithm
 *
 * @param pathStart - The coordinates of the start of the path
 * @param pathEnd - The coordinates of the end of the path
 * @returns {*} - An array containing coordinates of the most efficient path to take
 */

findPath = function (pathStart, pathEnd) {

    var pow = Math.pow;
    var sqrt = Math.sqrt;

    var maxWalkableTileNo = 0;

    var worldWidth = gridCoords.length;
    var worldHeight = gridCoords[0].length;
    var worldSize = worldWidth * worldHeight;

    /** Find the distance 'as the crow flies' between two points
     *
     * @param point - First point used to calculate the distance
     * @param target - Second point used to calculate the distance
     * @returns {number} - The euclidean distance between the two given points
     */

    function euclideanDistance(point, target) {
        return sqrt(pow(point.x - target.x, 2) + pow(point.y - target.y, 2));
    }

    /** Check the neighbouring space of a given set of coordinates to see if they can be travelled upon i.e. they do not contain impassable obstacles
     *
     * @param x - X coordinate to check neighbours of
     * @param y - Y coordinate to check neighbours of
     * @returns {Array} - An array of all coordinates next to the given target that do not contain obstacles
     */

    function neighbours(x, y) {

        var north = y - 1,
            east = x + 1,
            south = y + 1,
            west = x - 1,
            myNorth = north > -1 && canWalkHere(x, north),
            myEast = east < worldWidth && canWalkHere(east, y),
            mySouth = south < worldHeight && canWalkHere(x, south),
            myWest = west > -1 && canWalkHere(west, y),
            result = [];

        if (myNorth) {
            result.push({x: x, y: north});
        }

        if (myEast) {
            result.push({x: east, y: y});
        }

        if (mySouth) {
            result.push({x: x, y: south})
        }

        if (myWest) {
            result.push({x: west, y: y});
        }

        return result;

    }

    /** Check if given coordinates contain obstacles
     *
     * @param x - X coordinate to check
     * @param y - Y coordinate to check
     * @returns {boolean} - Returns true if the given coordinates contain no obstacles
     */

    function canWalkHere(x, y) {

        return ((gridCoords[x] != null) &&
            (gridCoords[x][y] != null) &&
            (gridCoords[x][y] <= maxWalkableTileNo));

    }

    /** Set up node object for future path calculation
     *
     * @param parent - The node that was checked immediately prior to the current node
     * @param point - The coordinates of the current node
     * @returns {{parent: *, value: *, x: *, y: *, f: number, g: number}} - Node object
     * @constructor
     */

    function Node(parent, point) {

        return {

            parent: parent,
            value: point.x + (point.y * worldWidth),
            x: point.x,
            y: point.y,
            f: 0,
            g: 0

        };

    }

    /** Calculate the path using the A* algorithm
     *
     * @returns {Array} - Array of path coordinates
     */

    function calculatePath() {

        var myPathStart = Node(null, {x: pathStart[0], y: pathStart[1]});
        var myPathEnd = Node(null, {x: pathEnd[0], y: pathEnd[1]});

        var aStar = new Array(worldSize);

        var open = [myPathStart];
        var closed = [];
        var result = [];

        var myNeighbours, myNode, myPath;
        var length, max, min, i, j;

        while (length = open.length) {

            max = worldSize;
            min = -1;

            for (i = 0; i < length; i++) {

                if (open[i].f < max) {
                    max = open[i].f;
                    min = i;
                }

            }

            myNode = open.splice(min, 1)[0];

            if (myNode.value == myPathEnd.value) {

                myPath = closed[closed.push(myNode) - 1];

                do {

                    result.push([myPath.x, myPath.y]);

                }
                while (myPath = myPath.parent);

                aStar = closed = open = [];

                result.reverse();

            }

            else {

                myNeighbours = neighbours(myNode.x, myNode.y);

                for (i = 0, j = myNeighbours.length; i < j; i++) {

                    myPath = Node(myNode, myNeighbours[i]);

                    if (!aStar[myPath.value]) {

                        myPath.g = myNode.g + euclideanDistance(myNeighbours[i], myNode);
                        myPath.f = myPath.g + euclideanDistance(myNeighbours[i], myPathEnd);

                        open.push(myPath);

                        aStar[myPath.value] = true;
                    }
                }

                closed.push(myNode);

            }
        }
            console.log(result);
            return result;

    }

    return calculatePath();

};