import { Vector3 } from "three";
import GridCell from "./GridCell";

const tmpVec3 = new Vector3();

export default class Grid {
    cells: Set<string>;

    directions: Vector3[];

    constructor(type: GridType) {
        this.cells = new Set();

        this.directions = Grid.directionsFromType(type)
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

    generate(radius) {
        /* position: Vector3 */
        this.cells.add('0,0,0');

        const generated = ['0,0,0'];

        
    }

    generateStep(from: Vector3) {
        const newlycreated: string[] = [];
        this.directions.forEach(d => {
            tmpVec3.copy(d).add(from);

            const str = tmpVec3.toArray().join(',');

            if (!this.cells.has(str)) {
                newlycreated.push(str);

                this.cells.add(str);
            }
        })
    }
}

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