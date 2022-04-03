const express = require('express');
const io = require('socket.io');
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')


const https = require('https');
const http = require('http');

const fs = require('fs');

const path = require('path');
const { is } = require('express/lib/request');

const event = require('./controller/eventController')

const authRout = require('./routes/authRoutes')

require('./admin').updateuser()

require('dotenv').config()

// #####################################################

const app = express();

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')))



// login
app.use(authRout)

app.get('/',(req,res)=>{
    if (req.cookies.jwt){
        res.redirect('/chatX')
    }
    res.sendFile(path.join(__dirname,'public/home.html'))
})
app.get('/signup',(req,res)=>{
    if (req.cookies.jwt){
        res.redirect('/chatX')
    }
    res.sendFile(path.join(__dirname,'public/signup.html'))
})
app.get('/chatX',(req,res)=>{
    res.sendFile(path.join(__dirname, './public/chatX.html'))
})


// error 404 page
// app.get('*',(req,res)=>{
//     res.status(404).send('404 sign by anirut')
// });


// SSL key for HTTPS
const privateKey = fs.readFileSync('ssl/key.pem');
const certificate = fs.readFileSync('ssl/cert.pem');
const credentials = { key: privateKey, cert: certificate };


// create http/https server
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);



// create socket server and event
const ioServer = new io.Server(httpServer);

// add event listener to socket
ioServer
    .use((socket, next) => {
        const token = socket.handshake.query.token;
        if (token) {
            jwt.verify(socket.handshake.query.token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        } else {
            socket.decoded = null
            next()
        }
    })
    .on('connection', event.connection);

const sendPrivateEvent = (socketID, event, ...args) => ioServer.to(socketID).emit(event, ...args)
const getSocketClients = () => Array.from(ioServer.sockets.sockets).map(socket => socket[1])
const sendEvent = (event, ...arg) => ioServer.emit(event, ...arg)




// runing server
httpServer.listen(8080, () => {
    console.log('HTTP Server running on port 8080');
});

// httpsServer.listen(4433, () => {
//     console.log('HTTPS Server running on port 4433');
// });




module.exports = {
    sendPrivateEvent,
    getSocketClients,
    sendEvent
}