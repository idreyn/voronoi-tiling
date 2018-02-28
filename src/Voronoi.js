import React, {Component} from "react";

import {generateDiagram, circularPerturbation} from "./geom.js";

class VoronoiRender extends Component {
    static defaultProps = {overfill: 0.1};

    renderCell(cell, key) {
        const {overfill} = this.props;
        const {points} = cell;
        return <polygon
            key={key}
            points={points
                .map(({x, y}) => `${x},${y}`).join(" ")}
            style={{
                fill: "orange",
                fillRule: "evenodd",
                opacity: (cell.index % 10) / 10,
            }}
        />;
    }

    render() {
        const {diagram, width, height, overfill} = this.props;
        const viewBox = [
            overfill * width / 2,
            overfill * height / 2,
            width * (1 - overfill),
            height * (1 - overfill),
        ];
        return <div style={{height: "100vh", overflow: "hidden"}}>
            <svg
                width={"100%"}
                height={"100%"}
                viewBox={viewBox.map(s => s.toString()).join(" ")}
                preserveAspectRatio="xMidYMid slice"
            >
                {diagram.cells.map((cell, i) => this.renderCell(cell, i))}
            </svg>
        </div>;

    }
}

export default class Voronoi extends Component {
    componentWillMount() {
        const {width, height, cellSize, wobble} = this.props;
        const diagram = generateDiagram(
            width,
            height,
            cellSize,
            cellSize * 2
        );
        const perturbations = diagram.points.map(
            _ => circularPerturbation(
                wobble,
                0.001 + 0.002 * Math.random()
            )
        );
        this.setState({
            diagramBase: diagram,
            diagram,
            perturbations,
        });
    }

    componentDidMount() {
        window.requestAnimationFrame(this.updateMotion)
    }

    updateMotion = () => {
        const {diagramBase, perturbations} = this.state;
        this.setState({
            diagram: diagramBase.perturb(perturbations),
        });
        window.requestAnimationFrame(this.updateMotion);
    }

    render() {
        return <VoronoiRender {...this.props} diagram={this.state.diagram} />;
    }
}
