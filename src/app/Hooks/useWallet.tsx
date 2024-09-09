import { useWallet } from '@meshsdk/react';

export default function Page() {
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet();

  return (
    <div>
      <p>
        <b>Connected?: </b> {connected ? 'Is connected' : 'Not connected'}
      </p>
      <p>
        <b>Connecting wallet?: </b> {connecting ? 'Connecting...' : 'No'}
      </p>
      <p>
        <b>Name of connected wallet: </b>
        {name}
      </p>
      <button onClick={() => disconnect()}>Disconnect Wallet</button>
    </div>
  );
}