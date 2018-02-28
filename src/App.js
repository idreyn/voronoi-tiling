import React, { Component } from "react";

import Voronoi from "./Voronoi.js";

export default class App extends Component {
  render() {
      return <Voronoi
        width={window.innerWidth}
        height={window.innerHeight}
        size={500}
        wobble={3}
      />;
  }
}
