const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server })

// koa绑定的http服务
app.use(async (ctx, next) => {
    ctx.state.user = parseUser(ctx.cookies.get('name') || '');
    await next();
});

server.listen(2001, () => {
    console.log('app is listening on port 2001')
})

//存放前端连接的socket
let clientMap = {}
let count = 0
let id = 0
//当客户端连接上的就会触发，回调会接收一个socket对象
wss.on("connection", socket => {
    count++; id++;
    socket.id = id
    socket.nickname = '好友'
    clientMap[socket.id] = socket
    broadMessage(socket, 'online')

    //当这个客户端发送数据的时候会触发
    socket.on("message", msg=> {
        let info = JSON.parse(msg)
        if (socket.nickname !== info.nickname && info.nickname) {
            socket.nickname = info.nickname
            broadMessage(socket,'updateNickname')
        }
        socket.nickname = info.nickname
        broadMessage(socket, 'msg', info.msg)
    })

    //当客户端断开的时候触发
    socket.on("close", function () {
        count--;
        delete clientMap[socket.id];
        broadMessage(socket, 'offline')
    })

    //当客户端连接出错的时候
    socket.on("error", function (err) {
        console.log(err)
    })

})


/**
 * 广播客户端消息
 * @param {*} nickname 昵称
 * @param {*} type     数据类型
 */
function broadMessage(socket, type, msg) {
    Object.keys(clientMap).forEach(id => {
        clientMap[id].send(JSON.stringify({
            count,
            nicknameList: Object.values(clientMap).map(e => e.nickname),
            type: type,
            nickname: socket.nickname,
            msg: msg, 
            isMe: socket.id == id ? true : false,
        }))
    })
}
