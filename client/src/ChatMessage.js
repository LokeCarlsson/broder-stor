import React, { Component } from 'react';
import moment from 'moment'

import './ChatMessage.css';

class ChatMessage extends Component {
    render() {
        const date = moment(parseFloat(this.props.message.received_on, 10))
        return (
            <div className='chat-message-container'>
                <div className='name'>{this.props.message.username}</div>
                <div className='date' title={date.calendar()}>{date.fromNow()}</div>
                <div className='channel'>{this.props.message.channel}</div>
                <div className='message'>{this.props.message.body}</div>
            </div>
        )
    }

}

export default ChatMessage;
