const express = require("express");
const app = express();
const http = require("http").createServer(app)
const path = require('path');
const ejs = require("ejs");
const Enmap = require("enmap");
const io = require("socket.io")(http)

const lobbies = new Enmap({
    name: "lobbies"
})

let htmlPath = path.join(__dirname, 'views');
app.use(express.static(htmlPath));
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile);
app.use(express.json()) // for parsing application/json

app.get("/lobby", (req, res) => {
    let code = req.query.code
    let name = req.query.name

    if (!code) {
        code = makekey(5)
        let lobbyObj = {
            players: [],
            messages: [],
            ingame: false
        }
        lobbies.set(code, lobbyObj)
        res.redirect(`/lobby?code=${code}&name=${name}`)
    } else {
        if (!lobbies.has(code)) {
            return res.redirect("/?wrongCode=true")
        }
        let lobby = lobbies.get(code)
        if (!lobby.players[0]) {
            lobby.players.push({
                navn: name,
                id: lobby.players.length
            })
            lobby.messages.push({
                navn: name,
                message: `joined the lobby!<hr>`,
                time: new Date().getTime()
            })
            lobbies.set(code, lobby)
            res.render("lobby.html")
        } else if (lobby.players.length >= 10) {
            res.redirect("/?full=true")
        } else if (lobby.ingame) {
            res.redirect("/?ingame=true")
        } else {
            let dupe = false
            lobby.players.forEach(p => {
                if (p.navn === name) {
                    dupe = true
                    res.redirect("/?dupe=true")
                }
            })
            if (!dupe) {
                lobby.players.push({
                    navn: name,
                    id: lobby.players.length
                })
                lobby.messages.push({
                    navn: name,
                    message: `joined the lobby!<hr>`,
                    time: new Date().getTime()
                })
                lobbies.set(code, lobby)
                res.render("lobby.html")
            }
        }
    }
})

app.get("/game", (req, res) => {
    let lobby = lobbies.get(req.query.code)
    lobby.ingame = true
    lobbies.set(req.query.code, lobby)
    res.render("game.html")
})

io.on('connection', (socket) => {
    let start
    socket.on("leave", data => {
        if (start) return
        let lobby = lobbies.get(data.code)
        lobby.players.splice(data.id, 1)
        lobby.messages.push({
            navn: data.name,
            message: `left the lobby!<hr>`,
            time: data.time
        })
        lobbies.set(data.code, lobby)
        io.to(data.code).emit("message", {
            navn: data.name,
            message: `left the lobby!<hr>`,
            time: data.time
        })
        socket.to(data.code).emit("left", {
            navn: data.name
        })
    })

    socket.on("join", data => {
        socket.join(data.code)
        socket.emit("lobby", lobbies.get(data.code))
        socket.to(data.code).emit("message", {
            navn: data.name,
            message: `joined the lobby!<hr>`,
            time: new Date().getTime()
        })
        socket.to(data.code).emit("newPlayer", {
            navn: data.name,
            id: lobbies.get(data.code).players.length
        })
    })

    socket.on("message", msg => {
        let lobby = lobbies.get(msg.code)
        msg.time = new Date().getTime()
        lobby.messages.push(msg)
        lobbies.set(msg.code, lobby)
        io.to(msg.code).emit("message", msg)
    })

    socket.on("start", code => {
        start = true
        lobbies.get(code).ingame = true
        io.to(code).emit("start")
    })
});

let server = http.listen(3000, function () {
    let host = 'localhost';
    let port = server.address().port;
    console.log('listening on http://' + host + ':' + port + '/');
});

function makekey(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

setInterval(() => {
    lobbies.forEach((lobby, i) => {
        if (!lobby.players[0]) {
            lobbies.delete(i)
        }
    })
}, 1000);