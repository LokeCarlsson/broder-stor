import React, { Component } from 'react';
import ScrollToTop from 'react-scroll-up';
import Feed from './Feed.js';
import logo from './camera.png'
import up from './up.png'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Broder stor</h1>
          <img src={logo} className="App-logo" alt="logo" />
        </div>
<<<<<<< HEAD
=======
      
>>>>>>> 480ae2115e392283b7f2557f7d9e1ab3bcaf5a93
        <div className="Feed">
          <Feed />
        </div>

        <ScrollToTop showUnder={250}>
          <img src={up} alt="up" className="ScrollToTop" />
        </ScrollToTop>

      </div>
    );
  }
}

export default App;
