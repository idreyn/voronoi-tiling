import Poisson from "poisson-disk-sampling";
import Voronoi from "voronoi";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Cell {
    constructor(points, index) {
        this.points = points;
        this.index = index;
    }
}

class VoronoiDiagram {
    constructor(cells, points) {
        this.cells = cells;
        this.points = points;
    }

    perturb(fxns) {
        const pointsMap = new WeakMap();
        const now = Date.now();
        let fxnIndex = 0;
        return new VoronoiDiagram(this.cells.map((cell, index) =>
            new Cell(cell.points.map(point => {
                if (pointsMap.has(point)) {
                    return pointsMap.get(point);
                } else {
                    const perturbedPoint = fxns[fxnIndex](point, now);
                    fxnIndex = (fxnIndex + 1) % fxns.length;
                    pointsMap.set(point, perturbedPoint);
                    return perturbedPoint;
                }
            }), index)
        ));
    }
}

export const randomPerturbation = (magnitude) => {
    return ({x, y}, time) => new Point(
        x + magnitude * (-0.5 + Math.random()),
        y + magnitude * (-0.5 + Math.random())
    );
}

export const circularPerturbation = (magnitude, frequency, phase = 0) => {
    return ({x, y}, time) => new Point(
        x + magnitude * Math.cos(frequency * time + phase),
        y + magnitude * Math.sin(frequency * time + phase),
    );
}

export const generateDiagram = (width, height, min, max, tolerance = 1) => {
    // First generate some nicely spaced points
    // TODO(ian): Parameterize the min/max spacing
    const seeds = new Poisson([width, height], min, max).fill()
        .map(([x, y]) => ({x, y}));
    // Now generate a Voronoi diagram from it
    const diagram = new Voronoi()
        .compute(seeds, {xl: 0, xr: width, yt: 0, yb: height});
    console.log(seeds, diagram);
    // Let's get the Voronoi diagram into our own representation
    const pointsMap = new WeakMap();
    const points = [];
    return new VoronoiDiagram(diagram.cells.map((cell, index) => {
        const {halfedges} = cell;
        // Take all of the points in the cell...
        return new Cell([halfedges[0].getStartpoint()]
            .concat(halfedges.map(he => he.getEndpoint()))
            // Convert them to our points...
            .map(vPoint => {
                if (pointsMap.has(vPoint)) {
                    return pointsMap.get(vPoint);
                } else {
                    const nearbyPoint = points.find(p =>
                        Math.sqrt(
                            Math.pow(p.y - vPoint.y, 2) +
                            Math.pow(p.x - vPoint.x, 2)
                        ) < tolerance
                    );
                    if (nearbyPoint) {
                        return nearbyPoint;
                    } else {
                        const point = new Point(vPoint.x, vPoint.y);
                        pointsMap.set(vPoint, point);
                        points.push(point);
                        return point;
                    }
                }
            }),
            index
        );
    }), points);
};
