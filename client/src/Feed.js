import React, { Component } from 'react';
import Request from 'react-http-request';
import './Feed.css';

class Feed extends Component {
  render() {
    return (
      <Request
          url='http://api.broderstor.nu/messages'
          method='get'
          accept='application/json'
          verbose={true}>
          {
          ({error, result, loading}) => {
            if (loading) {
              return <div>loading...</div>;
            } else {

              let chatMessages = result.body.map(function(chatMessage) {
                return  <div>{ chatMessage.username + ": " + chatMessage.body }</div>
              });

              return <div>{ chatMessages }</div>;
            }
          }
        }
      </Request>
    );
  }
}

export default Feed;
