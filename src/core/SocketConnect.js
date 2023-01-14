import { Color3, MeshBuilder, Quaternion, StandardMaterial } from "@babylonjs/core"
import * as Colyseus from "colyseus.js"

import {
    InterpolationBuffer,
    BufferMode
  } from "buffered-interpolation-babylon";

const connectedClients = {}
let avatarMaterial
const createConnectSetupMulti = async ({ scene }) => {
    avatarMaterial = new StandardMaterial("avatarMat", scene)
    avatarMaterial.emissiveColor = new Color3(255, 255, 255)

    console.log("connecting to local colyseus...")

    const wsURL = "ws://localhost:2567"

    var colyseusClient = new Colyseus.Client(wsURL)
    
    let room = await colyseusClient.joinOrCreate("soulsync_default_room", {})

    room.onStateChange.once((state) => {
        console.log("setting up state events...")

        state.players.forEach(p => {
            if (p.sessionId !== room.sessionId) {
                console.log(("a friendo was already in the room!"))
                connectedClients[p.sessionId] = createPlayer(p)
                p.transformData.onChange = (changes) => {
                    changes.forEach(c => {
                        switch(c.field) {
                            case 'pX':
                            case 'pY':
                            case 'pZ':
                                connectedClients[p.sessionId].posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                                break
                            case 'rX':
                            case 'rY':
                            case 'rZ':
                            case 'rW':
                                connectedClients[p.sessionId].rotForBuffer[`${c.field.replace('r', '').toLowerCase()}`] = c.value
                                break
                            default:
                                break

                        }
                    })
                    connectedClients[p.sessionId].buffer.appendBuffer(connectedClients[p.sessionId].posForBuffer, null, connectedClients[p.sessionId].rotForBuffer, null) 
                }
            }
        })

        state.players.onAdd = p => {
            console.log(("a friendo connected"))
            connectedClients[p.sessionId] = createPlayer(p)
            p.transformData.onChange = (changes) => {
                changes.forEach(c => {
                    switch(c.field) {
                        case 'pX':
                        case 'pY':
                        case 'pZ':
                            connectedClients[p.sessionId].posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                            break
                        case 'rX':
                        case 'rY':
                        case 'rZ':
                        case 'rW':
                            connectedClients[p.sessionId].rotForBuffer[`${c.field.replace('r', '').toLowerCase()}`] = c.value
                            break
                        default:
                            break

                    }
                })
                connectedClients[p.sessionId].buffer.appendBuffer(connectedClients[p.sessionId].posForBuffer, null, connectedClients[p.sessionId].rotForBuffer, null) 
            }
        }
        
        state.players.onRemove = c => {
            cleanupPlayer(c)
            console.log("a homie was removed")
        }
    })
    
    console.log("Colyseus setup and connected !!")

    return {
        connectedClients,
        room
    }
}

const createPlayer = (c) => {
    const avatar = MeshBuilder.CreateSphere("player" + c.sessionId)

    avatar.material = avatarMaterial

    let posForBuffer = {
        pX: 0,
        pY: 0,
        pZ: 0
    }

    let rotForBuffer = {
        rX: 0,
        rY: 0,
        rZ: 0,
        rW: 0
    }

    avatar.rotationQuaternion = new Quaternion()

    return {
        client: c,
        avatar,
        posForBuffer,
        rotForBuffer,
        buffer: new InterpolationBuffer(BufferMode.MODE_LERP, 0.2),
        sessionId: c.sessionId
    }
}

const cleanupPlayer = (c) => {
    let cc = connectedClients[c.sessionId]
    cc.avatar.dispose()
    delete connectedClients[c.sessionId]
}

export default createConnectSetupMulti


