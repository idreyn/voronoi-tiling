import React, { Component } from "react";

import Voronoi from "./Voronoi.js";

export default class App extends Component {
  render() {
      return <Voronoi
        width={768}
        height={576}
        cellSize={300}
        wobble={3}
      />;
  }
}
