import React, { Component } from 'react';
import LazyLoad from 'react-lazyload';
import './Feed.css';
import { spinner } from 'react-mdl';


const Lorem = require('react-lorem-component');

class Feed extends Component {
  render() {
    return (
      <LazyLoad height={500} offset={500} placeholder={spinner} >
        <Lorem mode="list" count="1" sentenceUpperBound="2" />
      </LazyLoad>
    );
  }
}

export default Feed;
