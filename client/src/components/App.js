import React, { Component } from "react";
import Room from "./Room";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import "./App.css";
const uniqid = require('uniqid');

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" render={()=>{
            return (
              <Redirect to={`/rooms/${uniqid("room-")}`} /> 
            )
          }} />
          <Route exact path="/rooms/:roomId" component={Room} />
        </Switch>
      </Router>
    )
  }
}

export default App;
