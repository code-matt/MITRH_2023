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

    let { camera, scene, engine } = coreStuff

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

      data.pX = camera.position.x;
      data.pY = camera.position.y;
      data.pZ = camera.position.z;
      data.rX = camera.absoluteRotation.x;
      data.rY = camera.absoluteRotation.y;
      data.rZ = camera.absoluteRotation.z;
      data.rW = camera.absoluteRotation.w;
      room.send("transform_update", data)

    }

    let updateCameraPosThrottled = _.throttle(handleUpdatedCamera, 50)

    const updateMulti = () => {
      _.forEach(connectedClients, (client) => {
          if (client.avatar && client.sessionId !== room.userSessionId) {
              client.buffer.update(scene.deltaTime)
              if (client.buffer.state === BufferState.PLAYING) {
                  client.avatar.position.copyFrom(client.buffer.position);
                  // client.avatar.rotationQuaternion.copyFrom(client.buffer.quaternion);
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
