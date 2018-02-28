import React, {Component} from "react";

import {generateDiagram, circularPerturbation} from "./geom.js";

class VoronoiRender extends Component {
    static defaultProps = {overfill: 1.1};

    renderCell(cell, key) {
        const {overfill} = this.props;
        const {points} = cell;
        return <polygon
            key={key}
            points={points
                .map(({x, y}) => ({x: x * overfill, y: y * overfill}))
                .map(({x, y}) => `${x},${y}`).join(" ")}
            style={{
                fill: "orange",
                fillRule: "evenodd",
                opacity: (1 + cell.index % 10) / 10,
            }}
        />;
    }

    render() {
        const {diagram, width, height, overfill} = this.props;
        const outerStyle = {
            overflow: "hidden",
            position: "relative",
            width,
            height,
        };
        const innerStyle = {
            position: "absolute",
            left: width * (1 - overfill) / 2,
            top: height * (1 - overfill) / 2,
        };
        return <div style={outerStyle}>
            <svg
                width={width * overfill}
                height={height * overfill}
                style={innerStyle}
            >
                {diagram.cells.map((cell, i) => this.renderCell(cell, i))}
            </svg>
        </div>;
    }
}

export default class Voronoi extends Component {
    componentWillMount() {
        const {width, height, size, wobble} = this.props;
        const diagram = generateDiagram(width, height, size, size * 2);
        const perturbations = diagram.points.map(
            _ => circularPerturbation(
                wobble * Math.random(),
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
