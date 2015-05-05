

//Inspiration taken from aStar tutorial at http://buildnewgames.com/astar/

/*Find the most efficient path using the A* algorithm
 pathStart - The coordinates of the start of the path
 pathEnd - The coordinates of the end of the path
 @returns {*} - An array containing coordinates of the most efficient path to take
 */

//Find path method
//Initialise the open and closed lists. The start node is added to the open list which starts the process.
findPath = function (pathStart, pathEnd) {

    var pow = Math.pow;
    var sqrt = Math.sqrt;

    var maxWalkableTileNo = 0;

    var worldWidth = gridCoords.length;
    var worldHeight = gridCoords[0].length;
    var worldSize = worldWidth * worldHeight;

    /* Find the distance between two points
     point - First point used to calculate the distance
     target - Second point used to calculate the distance
     */

    //Heuristic function using the Euclidean distance formula
    function euclideanDistance(point, target) {
        return sqrt(pow(point.x - target.x, 2) + pow(point.y - target.y, 2)); //This is the Euclidean distance formula and is used to calculate the cost between two nodes
    }

    /*Check the neighbouring space of a given set of coordinates to see if they can be travelled upon i.e. they do not contain impassable obstacles

     x - X coordinate to check neighbours of.
     y - Y coordinate to check neighbours of.
     {Array} - An array of all coordinates next to the given target that do not contain obstacles
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

    /* Check if given coordinates contain obstacles

      x - X coordinate to check
      y - Y coordinate to check
      {boolean} - Returns true if the given coordinates contain no obstacles
     */

    function canWalkHere(x, y) {

        return ((gridCoords[x] != null) &&
            (gridCoords[x][y] != null) &&
            (gridCoords[x][y] <= maxWalkableTileNo));

    }

    /*Set up node object for future path calculation

     parent - The node that has all of its neighbours checked
     point - The coordinates of the current node
     {{parent: *, value: *, x: *, y: *, f: number, g: number}} - Node object
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

    /* Calculate the path using the A* algorithm
     {Array} - Array of path coordinates
     */

    function calculatePath() {

        var myPathStart = Node(null, {x: pathStart[0], y: pathStart[1]});   //position of first node
        var myPathEnd = Node(null, {x: pathEnd[0], y: pathEnd[1]});   //position of end node

        var aStar = new Array(worldSize);

        var open = [myPathStart]; //Initialise open list
        var closed = [];  //Initialise closed list
        var result = [];

        var myNeighbours, myNode, myPath;
        var length, max, min, i, j;

        while (length = open.length) {   //While a path is being calculated

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

                myPath = closed[closed.push(myNode) - 1];  //push a parent to the closed list

                do {

                    result.push([myPath.x, myPath.y]);

                }
                while (myPath = myPath.parent);

                aStar = closed = open = []; //Make all the arrays empty

                result.reverse();   //Reverse the the order of the closed list containing all of the parent nodes so that the lowest cost parent node is the first node in the path

            }

            else {

                myNeighbours = neighbours(myNode.x, myNode.y);

                for (i = 0, j = myNeighbours.length; i < j; i++) {   //Check through myNeighbour array

                    myPath = Node(myNode, myNeighbours[i]);

                    if (!aStar[myPath.value]) {

                        myPath.g = myNode.g + euclideanDistance(myNeighbours[i], myNode);
                        myPath.f = myPath.g + euclideanDistance(myNeighbours[i], myPathEnd);

                        open.push(myPath);    //Add neighbour to open list

                        aStar[myPath.value] = true;
                    }
                }

                closed.push(myNode);  //Add parent to closed list

            }
        }
            console.log(result);
            return result;

    }

    return calculatePath(); //return the final calculated path

};