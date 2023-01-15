import './App.css';
import { useState } from 'react';
import createBabylon from './core/setupBabylon';
import './main.scss'
import createConnectSetupMulti from './core/SocketConnect';
import _ from 'lodash'
import HomeScreen from './react/screens/Home'

import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders";

import {
  BufferState
} from "buffered-interpolation-babylon";
import loadScene from './core/loadScene';
import { Sound } from '@babylonjs/core';

let connected = false
let connectedClients
let room

let introMusic
let mainMusic

function App() {

  const [ appEntered, setAppEntered ] = useState(false)


  const connectAndBeginExperience = async (coreStuff) => {
    introMusic.dispose()
    let entersound = new Sound("Music", "audio/enterround.mp3", coreStuff.scene, null, {
      loop: false,
      autoplay: true
    })
    entersound.onEndedObservable.addOnce(() => {
      entersound.dispose()
    })
    mainMusic = new Sound("Music", "audio/mainmusic.mp3", coreStuff.scene, null, {
      loop: true,
      autoplay: true
    })
    loadScene({ scene: coreStuff.scene })
    let multiSetup = await createConnectSetupMulti(coreStuff)
    connectedClients = multiSetup.connectedClients
    room = multiSetup.room
    connected = true
  }

  const theApp = async () => {
    console.log("Enter clicked..")

    setAppEntered(true)
    let coreStuff = await createBabylon({
      connectAndBeginExperienceFxn: connectAndBeginExperience
    })

    introMusic = new Sound("Music", "audio/instructionsmusic.mp3", coreStuff.scene, null, {
      loop: true,
      autoplay: true
    })

    let { camera, scene, engine, defaultExpHelper } = coreStuff

    const handleUpdatedCamera = function () {
      let data = {
        pX: 0,
        pY: 0,
        pZ: 0,
        rX: 0,
        rY: 0,
        rZ: 0,
        rW: 0
      }
      let cameraToSend
      const isVRWorking = defaultExpHelper.baseExperience.state === 2
      if (isVRWorking) {
        cameraToSend = defaultExpHelper.baseExperience.camera
      } else {
        cameraToSend = camera
      }

      data.pX = cameraToSend.position.x;
      data.pY = cameraToSend.position.y;
      data.pZ = cameraToSend.position.z;
      data.rX = 0.0;
      data.rY = 0.0;
      data.rZ = 0.0;
      data.rW = 0.0;
      room.send("transform_update", data)
    }

    let updateCameraPosThrottled = _.throttle(handleUpdatedCamera, 50)

    const updateMulti = () => {
      _.forEach(connectedClients, (client) => {
          if (client.avatar && client.sessionId !== room.userSessionId) {
              client.buffer.update(scene.deltaTime)
              if (client.buffer.state === BufferState.PLAYING) {
                client.avatar.position.copyFrom(client.buffer.position);
              }
              if (client.clientVREnabled) {
                client.leftHand.buffer.update(scene.deltaTime)
                client.rightHand.buffer.update(scene.deltaTime)
                if (client.leftHand.buffer.state === BufferState.PLAYING) {
                  client.leftHand.mesh.position.copyFrom(client.leftHand.buffer.position);
                }
                if (client.rightHand.buffer.state === BufferState.PLAYING) {
                  client.rightHand.mesh.position.copyFrom(client.rightHand.buffer.position);
                }
              }
          }
      })
    }

    const mainRenderLoop = () => {
      scene.render()
      if (connected) {
        updateCameraPosThrottled() // send to colyseus
        updateMulti() // process remote players movement smoothly using the interp buffer package
      }
    }

    engine.runRenderLoop(mainRenderLoop)
  }

  return (
    <div className="App">
      {!appEntered && <HomeScreen launchAppFxn={theApp} />}
      <canvas style={{
        
      }} id="mainCanvas"></canvas>
    </div>
  );
}

export default App;
