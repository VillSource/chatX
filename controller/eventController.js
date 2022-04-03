const user = require('../model/User')
const admin = require('../admin')



const connection = async socket => {
    admin.onlinedevice.inc()
    // require('../admin').updateuser()

    const username = socket.decoded.username;
    socket.broadcast.emit('setStatus', username, 'online', socket.id)


    const allUser = await user.getAllUsers(username);
    socket.emit('allUser', allUser, username)
    socket.on('getlastMessage', async (a, b) => {
        socket.emit('updatelastMessage', (await user.getChat(a, b, 1))[0])
    })



    socket.on('greetingNewConnection', (username, id) => {
        require('../server').sendPrivateEvent(id, 'setStatus', username, 'online', null)
    })
    socket.on('restatus', username => {
        require('../server').sendEvent('setStatus', username, 'online', socket.id)
    })

    socket.on('disconnect', _ => {

        admin.onlinedevice.dec()
        socket.broadcast.emit('setStatus', username, 'offline', null)
    });




    socket.on('sendMessage', async (data) => {
        console.log('onsendmessage ',data);
        const meta = await user.sendMessage(data.content, socket.decoded.username, data.to, data.time)
        if (meta.insertId >= 0) {
            const resData = {
                content: data.content,
                from: socket.decoded.username,
                to: data.to,
                time: data.time,
                dbID: meta.insertId
            }
            const f = require('../server').getSocketClients()//.filter(e=>(e.decoded.username==username) || (e.decoded.username==data.to))
            f.forEach(data => {
                if (data.decoded.username == resData.to)
                    require('../server')
                        .sendPrivateEvent(data.id, 'sentMessage', { replies: resData });
                else if (data.decoded.username == username)
                    require('../server')
                        .sendPrivateEvent(data.id, 'sentMessage', { sent: resData });
            });
        }
    });
    socket.on('loadMessage', async (username, id = null) => {
        const data = await user.getChat(username, socket.decoded.username, 20, id)
        socket.emit('loadedMessage', data)
    })
}


module.exports = {
    connection
}