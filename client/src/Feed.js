import React, { Component } from 'react';

import ChatMessageGetter from './ChatMessageGetter'
import ChatMessage from './ChatMessage'
import './Feed.css';

class Feed extends Component {

    constructor() {
        super()

        this.state = {
            messages: []
        }

        this.cmg = new ChatMessageGetter()

        this.cmg.on('newMessages', this.addMessages)

    }

    componentDidMount() {
        this.cmg.initialFetch().then(messages => {
            if (messages) {
                this.addMessages(messages)
            }
        }).catch(err => {
            console.error(err)
        })
    }

    addMessages(messages) {
        console.log('messages:', messages)
        let stateMessageIds = this.state.messages.map((message) => message.id)
        let newMessages = messages.filter((m) => !stateMessageIds.includes(m.id))

        let stateMessages = this.state.messages.slice()
        stateMessages.push(...newMessages)

        console.log('state messages:', stateMessages)
        this.setState({
            messages: stateMessages
        })
    }

    sortMessages(a, b) {
        return parseFloat(a.received_on) > parseFloat(b.received_on)
    }

    render() {
        if (!this.state.messages.length) {
            return <div>loading...</div>
        } else {
            let chatMessages = this.state.messages.map((message) => {
                return <ChatMessage key={message.id} message={message}/>
                
            })

            return <div className='chat-messages-container'>
                { chatMessages }
            </div>
        }
    }
}

export default Feed;
