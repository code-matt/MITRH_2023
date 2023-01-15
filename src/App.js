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

let connected = false
let connectedClients
let room

function App() {

  const [ appEntered, setAppEntered ] = useState(false)


  const connectAndBeginExperience = async (coreStuff) => {
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
    // loadScene({ scene: coreStuff.scene })
    // const connectAndBeginExperience = async () => {
    //   // let { connectedClients, room } = await createConnectSetupMulti(coreStuff)
    // }

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

    let updateCameraPosThrottled = _.throttle(handleUpdatedCamera, 250)

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
