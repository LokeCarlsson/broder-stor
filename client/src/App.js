import React, { Component } from 'react';
import ScrollToTop from 'react-scroll-up';
import Feed from './Feed.js';
import logo from './camera.png'
import up from './up.png'
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
          <img src={logo} className="App-logo" alt="logo" />
        </div>

        <p className="App-intro">
        Test
        </p>
        <div className="Feed">
          {this.loop(200)}
        </div>

        <ScrollToTop showUnder={250}>
          <img src={up} alt="up" className="ScrollToTop" />
        </ScrollToTop>

      </div>
    );
  }
}

export default App;
