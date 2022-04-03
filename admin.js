const io = require('@pm2/io')
const db = require('./db/db')

const realtimeUser = io.metric({
    name: 'Realtime user',
})

const messageSec = io.meter({
  name: 'messages/sec',
  id: 'app/requests/volume'
})

const onlinedevice = io.counter({
  name: 'Online Divice',
  id: 'app/realtime/requests'
});


const updateuser = async () => {
    const users = await db.pool.promise()
        .query(` SELECT count(*) as user FROM user `)
        .then(data => data[0][0])
        .then(data => data.user)
    
    realtimeUser.set(await users)
    console.log("get user update ", users);
}


module.exports = {
    updateuser,
    onlinedevice,
    messageSec
}