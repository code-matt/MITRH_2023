import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import createBabylon from './core/setupBabylon';
import './main.scss'
import createConnectSetupMulti from './core/SocketConnect';

function App() {

  const [ appEntered, setAppEntered ] = useState(false)

  return (
    <div className="App">
      {!appEntered && <header className="App-header" onClick={async () => {
        setAppEntered(true)
        await createBabylon()
        createConnectSetupMulti()
        console.log("Enter clicked..")
      }} style={{zIndex: 999999999999999, position: 'fixed'}}>
        <p>Enter The Garden</p>
      </header>}
      <canvas style={{
        
      }} id="mainCanvas"></canvas>
    </div>
  );
}

export default App;
