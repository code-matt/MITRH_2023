import { Color3, MeshBuilder, ParticleHelper, ParticleSystem, Quaternion, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import * as Colyseus from "colyseus.js"

import {
    InterpolationBuffer,
    BufferMode
  } from "buffered-interpolation-babylon";
import _ from 'lodash'

const connectedClients = {}
let avatarMaterial

const createConnectSetupMulti = async ({ scene, defaultExpHelper }) => {
    let leftController
    let rightController

    const isVRWorking = defaultExpHelper.baseExperience.state === 2

    avatarMaterial = new StandardMaterial("avatarMat", scene)
    avatarMaterial.emissiveColor = new Color3(255, 255, 255)

    console.log("connecting to local colyseus...")

    // const wsURL = "ws://localhost:2567" // for dev
    const wsURL = "wss://romaql.us-east-vin.colyseus.net"

    var colyseusClient = new Colyseus.Client(wsURL)
    
    let room = await colyseusClient.joinOrCreate("soulsync_default_room", {isVRWorking})

    room.onStateChange.once((state) => {
        console.log("setting up state events...")

        state.players.forEach(async p => {
            if (p.sessionId !== room.sessionId) {
                console.log(("a friendo was already in the room!"))
                connectedClients[p.sessionId] = await createPlayer({client: p, scene})
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
                p.transformDataLeftHand.onChange = (changes) => {
                    changes.forEach(c => {
                        switch(c.field) {
                            case 'pX':
                            case 'pY':
                            case 'pZ':
                                connectedClients[p.sessionId].leftHand.posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                                break
                            default:
                                break
    
                        }
                    })
                    connectedClients[p.sessionId].leftHand.buffer.appendBuffer(connectedClients[p.sessionId].leftHand.posForBuffer, null, connectedClients[p.sessionId].leftHand.rotForBuffer, null) 
                }
                p.transformDataRightHand.onChange = (changes) => {
                    changes.forEach(c => {
                        switch(c.field) {
                            case 'pX':
                            case 'pY':
                            case 'pZ':
                                connectedClients[p.sessionId].rightHand.posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                                break
                            default:
                                break
    
                        }
                    })
                    connectedClients[p.sessionId].rightHand.buffer.appendBuffer(connectedClients[p.sessionId].rightHand.posForBuffer, null, connectedClients[p.sessionId].rightHand.rotForBuffer, null) 
                }
            }
        })

        state.players.onAdd = async p => {
            console.log(("a friendo connected"))
            connectedClients[p.sessionId] = await createPlayer({client: p, scene})
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
            p.transformDataLeftHand.onChange = (changes) => {
                changes.forEach(c => {
                    switch(c.field) {
                        case 'pX':
                        case 'pY':
                        case 'pZ':
                            connectedClients[p.sessionId].leftHand.posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                            break
                        default:
                            break

                    }
                })
                connectedClients[p.sessionId].leftHand.buffer.appendBuffer(connectedClients[p.sessionId].leftHand.posForBuffer, null, connectedClients[p.sessionId].leftHand.rotForBuffer, null) 
            }
            p.transformDataRightHand.onChange = (changes) => {
                changes.forEach(c => {
                    switch(c.field) {
                        case 'pX':
                        case 'pY':
                        case 'pZ':
                            connectedClients[p.sessionId].rightHand.posForBuffer[`${c.field.replace('p', '').toLowerCase()}`] = c.value
                            break
                        default:
                            break

                    }
                })
                connectedClients[p.sessionId].rightHand.buffer.appendBuffer(connectedClients[p.sessionId].rightHand.posForBuffer, null, connectedClients[p.sessionId].rightHand.rotForBuffer, null) 
            }
        }
        
        state.players.onRemove = c => {
            cleanupPlayer(c)
            console.log("a homie was removed")
        }
    })

    const handleHandUpdate = function (data) {
        data.mesh.computeWorldMatrix(true);
        room.send("hand_update", {
            hand: data.hand,
            data: {
                pX: data.mesh.absolutePosition.x,
                pY: data.mesh.absolutePosition.y,
                pZ: data.mesh.absolutePosition.z
            }
        })
    }
  
    let updateHandPositionThrottled = _.throttle(handleHandUpdate, 50)

    // if (isVRWorking) {
        defaultExpHelper.input.onControllerAddedObservable.add((controller) => {
            const isHand = controller.inputSource.hand;
            if (isHand) {
                return
                //TODO: Def make this work !
            }
    
            controller.onMotionControllerInitObservable.add((motionController) =>{
                const isLeft = motionController.handedness === 'left';
                controller.onMeshLoadedObservable.add((mesh) => {
                    mesh.onAfterWorldMatrixUpdateObservable.add((e) => {
                        if (isLeft) {
                            leftController = mesh;
                        } else {
                            rightController = mesh;
                        }
                        updateHandPositionThrottled({
                            hand: motionController.handedness,
                            mesh
                        })
                    })
                });
            });
        });
    // }
    
    console.log("Colyseus setup and connected !!")

    return {
        connectedClients,
        room
    }
}

const createPlayer = async ({ client, scene }) => {
    const avatar = MeshBuilder.CreateSphere("player" + client.sessionId)

    let particleSystem = await ParticleHelper.ParseFromFileAsync("", "particles/soulOrb.json", scene, false)

    particleSystem.emitter = avatar
    particleSystem.start()

    avatar.material = avatarMaterial

    let posForBuffer = new Vector3(0, 1.6, 0)
    let rotForBuffer = new Quaternion()

    avatar.rotationQuaternion = new Quaternion()

    let leftHand
    let rightHand
    if (client.isVREnabled) {
        leftHand = await createHand({
            client,
            scene,
            handName: "left"
        })
    
        rightHand = await createHand({
            client,
            scene,
            handName: "right"
        })
    }

    return {
        client,
        avatar,
        posForBuffer,
        rotForBuffer,
        buffer: new InterpolationBuffer(BufferMode.MODE_LERP, 0.2),
        sessionId: client.sessionId,
        leftHand,
        rightHand,
        clientVREnabled: client.isVREnabled
    }
}

const createHand = async ({ scene, handName }) => {
    const hand = MeshBuilder.CreateSphere("hand" + handName, {
        diameter: 0.2
    })

    let particleSystem = await ParticleHelper.ParseFromFileAsync("", "particles/soulOrb.json", scene, false)

    particleSystem.emitter = hand
    particleSystem.maxSize = 0.3
    particleSystem.minSize = 0.05
    particleSystem.start()

    hand.material = avatarMaterial

    let posForBuffer = new Vector3(0, 1.6, 0)
    let rotForBuffer = new Quaternion()

    hand.rotationQuaternion = new Quaternion()

    return {
        mesh: hand,
        posForBuffer,
        rotForBuffer,
        buffer: new InterpolationBuffer(BufferMode.MODE_LERP, 0.2)
    }
}

const cleanupPlayer = (c) => {
    let cc = connectedClients[c.sessionId]
    cc.avatar.dispose()
    if (cc.leftHand) {
        cc.leftHand.mesh.dispose()
    }
    if (cc.rightHand) {
        cc.rightHand.mesh.dispose()
    }
    delete connectedClients[c.sessionId]
}

export default createConnectSetupMulti


