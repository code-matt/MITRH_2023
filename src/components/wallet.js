const getProvider = () => {
    const isPhantomInstalled = window.solana?.isPhantom
    if ("solana" in window) {
        const provider = window.solana;
        return provider;
    }
    if (window.solana) {
        if (isPhantomInstalled) {
            const provider = window.phantom;
            return provider;
        } else {
            const provider = window.solana;
            return provider;
        }
    } else {
        console.log('No solana injector found');
    }
  }


const ConnectButton = () => {
  const connect = async () => {
    if (!window.solana) {
      alert('No Phantom Wallet Provider on Browser')
    }
    const provider = getProvider();
    if (provider) {
      await provider.connect();
      let event = new Event('connected', { bubbles: true, cancelable: false });
      window.dispatchEvent(event)
    }
  };

  return (
    <div onClick={connect}>Connect Wallet</div>
  )
}

const DisconnectButton = () => {
    const disconnect = async () => {
      if (!window.solana) {
        alert('No Phantom Wallet Provider on Browser')
      }
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
      }
    };
  
    return (
      <div onClick={disconnect}>Disconnect Wallet</div>
    )
}

export {ConnectButton, DisconnectButton}