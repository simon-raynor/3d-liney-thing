import { CatmullRomCurve3, DataTexture, FloatType, RGBAFormat, Vector3 } from "three";

const WIDTH = 4096;
const HEIGHT = 1024;

export default class PathsTexture {
    texture: DataTexture
    paths: Vector3[][]
    pathLengths: number[]

    HEIGHT = HEIGHT
    WIDTH = WIDTH
    
    constructor(paths: Vector3[][]) {
        this.texture = new DataTexture(
            new Float32Array(HEIGHT * WIDTH * 4),
            WIDTH,
            HEIGHT,
            RGBAFormat,
            FloatType
        );
        this.paths = [...paths];
        this.pathLengths = [];
    
        const texData = this.texture.image.data;
    
        for (let y = 0; y < HEIGHT; y++) {
            let curve: CatmullRomCurve3 | null = null;
            let length = 0;
    
            if (paths[y]) {
                curve = new CatmullRomCurve3(paths[y]);
                length = curve.getLength();
            }

            this.pathLengths.push(length);

            curve?.getSpacedPoints(WIDTH).forEach(
                (pt, idx) => {
                    const texidx = ((y * WIDTH) + idx) * 4;
        
                    texData[texidx + 0] = pt?.x ?? 0;
                    texData[texidx + 1] = pt?.y ?? 0;
                    texData[texidx + 2] = pt?.z ?? 0;
                    texData[texidx + 3] = 1;
                }
            );
        }

        this.texture.needsUpdate = true;
    }
}
