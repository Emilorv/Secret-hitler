var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var sendbutton = document.getElementById("sendbutton")
let chatclear = document.getElementById("chatclear")
let navn = getUrlParam("name")
let id

const socket = io()

let players = []

socket.on('connect', function () {
    let data = {
        name: navn,
        code: getUrlParam("code"),
        time: new Date().getTime()
    }
    socket.emit('join', data);

    socket.on("lobby", lobby => {
        id = lobby.players.length - 1

        lobby.players.forEach(player => {
            players.push(player)
        })

        lobby.messages.forEach(msg => {
            if ((new Date(msg.time).getMinutes().toString().length) < 2) {
                time = `${new Date(msg.time).getHours()}:0${new Date(msg.time).getMinutes()}`
            } else {
                time = `${new Date(msg.time).getHours()}:${new Date(msg.time).getMinutes()}`
            }
            chatText.innerHTML += `<ul>[${time}] ${msg.navn}: ${msg.message} </ul>`
        })
    })
});

socket.on("message", msg => {
    if ((new Date(msg.time).getMinutes().toString().length) < 2) {
        time = `${new Date(msg.time).getHours()}:0${new Date(msg.time).getMinutes()}`
    } else {
        time = `${new Date(msg.time).getHours()}:${new Date(msg.time).getMinutes()}`
    }
    if (scrolled) {
        chatText.innerHTML += `<ul>[${time}] ${msg.navn}: ${msg.message} </ul>`
    } else {
        chatText.innerHTML += `<ul>[${time}] ${msg.navn}: ${msg.message} </ul>`
        scrolled = false
    }
})

var scrolled = false;

chatInput.addEventListener("keypress", e => {
    if (e.key === 'Enter' && navn !== undefined && chatInput.value !== "") {
        send(chatInput.value, navn)
        chatInput.value = ""
        scrolled = false
    }
})
sendbutton.addEventListener("click", (e) => {
    if (navn !== undefined && chatInput.value !== "") {
        send(chatInput.value, navn)
        chatInput.value = ""
        scrolled = false
    }
})


//Når noen forlater eller reloader tabben 
window.addEventListener('beforeunload', async e => {
    let data = {
        code: getUrlParam("code"),
        id: id,
        time: new Date().getTime(),
        name: navn
    }
    socket.emit("leave", data)
})

function send(message, navn) {
    socket.emit("message", {
        navn: navn,
        message: message.replace(/</g, "&").replace(/>/g, "&"),
        code: getUrlParam("code")
    })
}

function updateScroll() {
    if (!scrolled) {
        var element = document.getElementById("chat-text");
        element.scrollTop = element.scrollHeight;
    }
}
setInterval(updateScroll, 100);

chatText.onscroll = function (ev) {
    if (chatText.scrollHeight - chatText.scrollTop > 220) {
        scrolled = true;
    } else {
        scrolled = false;
    }
}

function arrDiff(arr1, arr2) {
    let arr3 = []
    for (i = arr1.length; i < arr2.length; i++) {
        arr3.push(arr2[i])
    }
    return arr3
}

function getUrlParam(parameter, defaultvalue) {
    let urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

function getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}