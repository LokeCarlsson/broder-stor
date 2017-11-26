import EventEmitter from 'events'
import request from 'superagent'

class ChatMessageGetter extends EventEmitter {

    constructor() {
        super()
        this.latestId = 0
        this.url = 'http://api.broderstor.nu/messages'
    }

    initialFetch() {
        return new Promise((resolve, reject) => {
            request.get(this.url)
                .query({limit:1000})
                .end((err, res) => {
                    if (err) return reject(err)
                    this.latestId = this._getLatestId(res.body)
                    setTimeout(this.messageLoop.bind(this), 5000)
                    return resolve(res.body)
                })
        })
    }

    getLatestMessages() {
        request.get(this.url)
            .query({limit:10, since: this.latestId})
            .end((err, res) => {
                if (err) return console.error(err)
                if (res.body.length) {
                    this.latestId = this._getLatestId(res.body)
                    console.log('Fetched new messages, highest id is now', this.latestId)
                    return this.emit('newMessages', res.body)
                } else {
                    console.log('Found no new messages')
                }
            })
    }

    messageLoop() {
        setTimeout(this.messageLoop.bind(this), 5000)
        this.getLatestMessages()
    }

    _getLatestId(messages) {
        const max = Math.max(...messages.map(message => message.id))
        console.log(max)
        return max
    }
}

export default ChatMessageGetter
