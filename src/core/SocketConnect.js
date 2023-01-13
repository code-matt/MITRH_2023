import * as Colyseus from "colyseus.js"

const connectedClients = {}

const createConnectSetupMulti = async () => {

    console.log("connecting to local colyseus...")

    const wsURL = "ws://localhost:2567"

    var colyseusClient = new Colyseus.Client(wsURL)
    
    let room = await colyseusClient.joinOrCreate("soulsync_default_room")
    
    room.onStateChange.once((state) => {
        console.log("room state changed")
    })
    
    room.state.players.onAdd = p => {
        console.log("a homie was added")
    }
    
    room.state.players.onRemove = p => {
        console.log("a homie was removed")
    }
    
    console.log("Colyseus setup and connected !!")

}

export default createConnectSetupMulti


