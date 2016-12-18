import React, { Component } from 'react';
import LazyLoad from 'react-lazyload';
import './Feed.css';

const Lorem = require('react-lorem-component');

class Feed extends Component {
  render() {
    return (
      <LazyLoad height={800} offset={100}>
        <Lorem mode="list" count="1" sentenceUpperBound="2" />
      </LazyLoad>
    );
  }
}

export default Feed;
