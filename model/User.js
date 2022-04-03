const db = require('../db/db')
const bcrypt = require('bcrypt');
const { reject } = require('bcrypt/promises');
const admin = require('../admin');

const io = require('@pm2/io')

const realtimeUser = io.metric({
    name: 'Realtime user',
})


const findUser = async (username) => {
    try {
        data = await db.pool.promise().query(`select * from user where username='${username}'`);
        return data[0][0];
    }
    catch (e) {
        throw e
    }
}


module.exports.login = async (username, password) => {
    try {
        const user = await findUser(username);
        if (user) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                return user;
            }
            throw Error('incorrect password');
        }
        throw Error('incorrect username');
    }
    catch (e) {
        throw e
    }
}

module.exports.getOnlineDevice = async username => {
    try {
        return await db.pool.promise()
            .query(`SELECT socketid,username
                    FROM userOnline 
                    WHERE username='${username}'`)
            .then(data => data[0])
    }
    catch (e) {
        throw e
    }
}
/**
 * 
 * @param {[ content:string, sender:string, resiver:string, time:string ]} args
 * @returns 
 */
module.exports.sendMessage = async (...args) => {//content, sender, resiver,time)=>{
    const command = ` INSERT INTO chat(content,sender,resiver,time) VALUES(?,?,?,?) `
    return await db.pool.promise()
        .query(command, args)
        .then((data) => { 
            // console.log(data[0]);
            // admin.messageSec.mark()
            return data[0] 
        })
        .catch((e) => { throw Error('Cannot send message...') })
}

module.exports.setUserOnline = async (userName, id) => {
    return await db.pool
        .promise()
        .query(`INSERT INTO userOnline VALUES('${id}','${userName}')`)
        .then(() => true)
        .catch(() => false)
};

module.exports.setUserOnline = async (id = null) => {
    return await db.pool
        .promise()
        .query(`DELETE FROM userOnline ${id ? 'WHERE socketid=?' : ''}`, [id])
        .then(() => true)
        .catch(() => false)
};

module.exports.getAllUsers = async username => {
    let data = await db.pool
        .promise()
        .query('select username,displayName from user')
        .then(data => data[0])
        .catch(_ => { });

    return data
}

module.exports.getChat = async (username1, username2, limit = 20, id = null) => {
    const command = `
        SELECT a.id, a.content, a.sender, a.resiver, a.time+0 time FROM(
            SELECT * FROM chat WHERE ${id ? 'id<' + id + ' and ' : ''} sender=? and resiver = ?
            UNION
            SELECT * FROM chat WHERE ${id ? 'id<' + id + ' and ' : ''} sender=? and resiver = ?
        ) a ORDER BY a.time DESC LIMIT ?;
    `
    return await db.pool.promise()
        .query(command, [username1, username2, username2, username1, limit])
        .then(data => data[0])
        .catch(() => { throw Error('cannot loading chat') })
}


module.exports.signup = async data => {
    const command = `INSERT INTO user(displayName,username,password) values(?,?,?)`;

    const res = await db.pool.promise()
        .query(command, [
            data.displayName,
            data.username,
            await bcrypt.hash(data.password, await bcrypt.genSalt())
        ])
        .then(data => data)

    require('../admin').updateuser()
    
    return res

}