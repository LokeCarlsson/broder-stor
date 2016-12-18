import React, { Component } from 'react';
import Feed from './Feed.js';
import './App.css';

class App extends Component {

  loop = (items) => {
    const result = [];
    for (var i = 0; i < items; i++) {
      result.push(<Feed />);
    }
    return result;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Broder stor</h1>
        </div>
        <p className="App-intro">
          Messages
        </p>
        <div className="Feed">
          {this.loop(200)}
        </div>
      </div>
    );
  }
}

export default App;
