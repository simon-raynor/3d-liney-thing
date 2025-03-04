import { Vector3 } from "three";

const CENTER = new Vector3(0, 0, 0);

const MAX_PATH_LENGTH = 1000;

export default class Grid {
    type: GridType;
    directions: Vector3[];

    constructor(type: GridType) {
        this.type = type;
        this.directions = Grid.directionsFromType(type)
    }

    get is2d() {
        return this.type === 'square' || this.type === 'hex';
    }

    static directionsFromType(type: GridType) {
        let dirs: GridDirections;

        switch(type) {
            case 'square':
                dirs = SQUARE_DIRECTIONS;
                break;
            case "hex":
                dirs = HEX_DIRECTIONS;
                break;
            case "cube":
                dirs = CUBE_DIRECTIONS;
                break;
            case "rhombic":
                dirs = RHOMBIC_DIRECTIONS;
                break;
            default:
                throw('Unknown grid type');
        }

        return dirs.map(d => new Vector3(...d));
    }

    randomDirection() {
        const n = Math.floor(Math.random() * this.directions.length);

        return this.directions[n];
    }

    randomPathFromCenter(radius = 10) {
        const points = [new Vector3(0, 0, 0)];

        const currentPoint = new Vector3(0, 0, 0);

        const visited = new Set<string>();

        const r2 = radius * radius;
        let l = 0;

        const tmpVec3 = new Vector3();

        while (currentPoint.distanceToSquared(CENTER) < r2) {
            const availableDirections: Vector3[] = [];

            this.directions.forEach(d => {
                tmpVec3.copy(currentPoint).add(d);

                if (!visited.has(roundCoord(tmpVec3))) {
                    availableDirections.push(d);
                }
            });

            // nowhere to go, just end here
            if (!availableDirections.length) {
                return points;
            }

            const d = availableDirections[
                        Math.floor(Math.random() * availableDirections.length)
                    ];

            currentPoint.add(d);
            tmpVec3.copy(currentPoint);

            points.push(new Vector3(currentPoint.x, currentPoint.y, currentPoint.z));

            visited.add(roundCoord(currentPoint));

            if (++l > MAX_PATH_LENGTH) break;
        }

        return points;
    }
}

const roundCoord = (coord: Vector3) => coord.toArray().map(n => Math.round(n * 1000) / 1000).join(',');

type GridType = 'square' | 'hex' | 'cube' | 'rhombic';
type GridDirections = [number, number, number][];


const SQUARE_DIRECTIONS: GridDirections = [
    [1, 0, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, 0, -1]
];


const cos30 = Math.cos(Math.PI / 6);
const cos60 = Math.cos(Math.PI / 3);

const HEX_DIRECTIONS: GridDirections = [
    [0, 0, 1],
    [cos30, 0, cos60],
    [cos30, 0, -cos60],
    [0, 0, -1],
    [-cos30, 0, cos60],
    [-cos30, 0, -cos60],
];


const CUBE_DIRECTIONS: GridDirections = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
];


const RHOMBIC_DIRECTIONS: GridDirections = [
    [1, 1, 0],
    [1, 0, 1],
    [1, -1, 0],
    [1, 0, -1],

    [-1, -1, 0],
    [-1, 0, 1],
    [-1, 1, 0],
    [-1, 0, -1],

    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1]
];