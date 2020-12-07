var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var sendbutton = document.getElementById("sendbutton")
let chatclear = document.getElementById("chatclear")
let players = document.getElementById("spillere")
let navn = getUrlParam("navn")
let id

const socket = io()

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
            players.innerHTML += `<ul> ${player.navn} </ul>`
        })

        lobby.messages.forEach(msg => {
            chatText.innerHTML += `<ul> ${msg.navn}: ${msg.message} </ul>`
        })
    })
});

socket.on("message", msg => {
    if (scrolled) {
        chatText.innerHTML += `<ul> ${msg.navn}: ${msg.message} </ul>`
    } else {
        chatText.innerHTML += `<ul> ${msg.navn}: ${msg.message} </ul>`
        scrolled = false
    }
})

socket.on("newPlayer", player => {
    if (scrolled) {
        players.innerHTML += `<ul> ${player.navn} </ul>`
    } else {
        players.innerHTML += `<ul> ${player.navn} </ul>`
        scrolled = false
    }
})

socket.on("left", player => {
    if (scrolled) {
        players.innerHTML = players.innerHTML.replace(`<ul> ${player.navn} </ul>`, '')
    } else {
        players.innerHTML = players.innerHTML.replace(`<ul> ${player.navn} </ul>`, '')
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


function send(message, navn) {
    socket.emit("message", {
        navn: navn,
        message: message,
        time: new Date().getTime(),
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