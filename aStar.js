var canvas, context;

var currentPath = [];

window.onload = function(){

    currentPath = findPath([0, 0], [4, 0]);

};

findPath = function (pathStart, pathEnd) {

    var pow = Math.pow;
    var sqrt = Math.sqrt;

    var maxWalkableTileNo = 0;

    var worldWidth = gridCoords[0].length;
    var worldHeight = gridCoords.length;
    var worldSize = worldWidth * worldHeight;

    function euclideanDistance(point, target) {
        return sqrt(pow(point.x - target.x, 2) + pow(point.y - target.y, 2));
    }

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

    function canWalkHere(x, y) {

        return ((gridCoords[x] != null) &&
            (gridCoords[x][y] != null) &&
            (gridCoords[x][y] <= maxWalkableTileNo));

    }

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