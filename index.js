const WebSocket = require("ws")

const PORT = 8080
const server = new WebSocket.Server({ port: PORT })

let players = []
let id = 1

server.on("connection", connection => {
    let playerId = `player${id}`
    let playerName = "player"

    players.push({
        connection,
        id: playerId,
    })

    const player = {
        id: playerId,
        name: playerName,
    }

    sendToOthers(
        {
            ...player,
            type: "connect",
        },
        playerId,
    )

    connection.on("close", () => {
        players = players.filter(next => next.id !== playerId)

        sendToOthers({
            ...player,
            type: "disconnect",
        })
    })

    connection.on("message", message => {
        const data = JSON.parse(message.toString())

        if (data.type == "name") {
            playerName = data.name

            sendToOthers(
                {
                    ...player,
                    type: "name",
                    name: data.name,
                },
                playerId,
            )
        }

        if (data.type == "message") {
            sendToOthers(
                {
                    ...player,
                    type: "message",
                    message: data.message,
                },
                playerId,
            )
        }

        if (data.type == "position") {
            sendToOthers(
                {
                    ...player,
                    type: "position",
                    position: data.position,
                },
                playerId,
            )
        }
    })

    id++
})

const sendToOthers = (data, playerId) => {
    for (let player of players) {
        if (player.id == playerId) {
            continue
        }

        player.connection.send(JSON.stringify(data))
    }
}

console.log("server running on port", PORT)
