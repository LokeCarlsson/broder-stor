import React, { Component } from 'react';
import Feed from './Feed.js';
import logo from './camera.png'
import './App.css';

class App extends Component {

  loop = (items) => {
    const result = [];
    for (var i = 0; i < items; i++) {
      result.push(<Feed />);
    }
    return result;
  }


  one = () => {
    console.log('Scroll event detected!');
  }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Broder stor</h1>
          <img src={logo} className="App-logo" alt="logo" />
        </div>

        <table onScroll={this.one}>
           [...]
        </table>

        <p className="App-intro">
          Chat
        </p>
        <div className="Feed">
          {this.loop(200)}
        </div>
      </div>
    );
  }
}

export default App;
