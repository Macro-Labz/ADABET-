markdown
Copy code
# Setting up a Next.js App with Cardano Wallet Integration

## Step 1: Install Dependencies

To get started, install the necessary dependencies for Cardano wallet integration and module transpiling.

```bash
npm install @meshsdk/core@1.5.11-beta.3 @meshsdk/react@1.1.10-beta.3  // new version doesnt work!

//npm install @meshsdk/core @meshsdk/core-cst @meshsdk/react


Step 2: Configure next.config.mjs
Next, configure your Next.js app to transpile the necessary modules and enable WebAssembly support.

In your project root, open or create next.config.js.
Add the following configuration:
javascript
Copy code
const withTM = require('next-transpile-modules')([
  '@emurgo/cardano-serialization-lib-browser', 
  '@emurgo/cardano-message-signing-browser'
]);

module.exports = withTM({
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
    ];
    return config;
  },
});
This configuration enables WebAssembly and ensures the required modules are transpiled properly.

Step 3: Wrap Your App with MeshProvider
In order to provide wallet functionality throughout your app, wrap the entire application with the MeshProvider.

Open pages/_app.tsx (or create it if it doesn’t exist).
Wrap your app in the MeshProvider component.
typescript
Copy code
import { MeshProvider } from '@meshsdk/react';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
  );
}

export default MyApp;
This ensures that wallet functionality is available throughout your application.

Step 4: Implement Wallet Functionality on Main Page
Open pages/index.tsx (or create it if it doesn’t exist).
Import the necessary components and hooks:
typescript
Copy code
import { useAddress, useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { useCallback, useState } from 'react';
Set up wallet connection state:
typescript
Copy code
const { connected, wallet } = useWallet();
Add the CardanoWallet component to your JSX:
typescript
Copy code
<CardanoWallet isDark={true} className="wallet" />
This provides a wallet connection button in the UI.

Step 5: Implement Wallet-Related Functions
Now, let’s add the transaction processing logic using the connected wallet.

Create a function to process transactions:
typescript
Copy code
const processTransaction = useCallback(async () => {
  try {
    const tx = new Transaction({ initiator: wallet })
      .sendLovelace(
        'recipient_address',   // Replace with the recipient address
        'amount_in_lovelace'   // Replace with the amount in lovelace
      );
    
    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    
    console.log('Transaction hash:', txHash);
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}, [wallet]);
This function builds, signs, and submits a transaction using the connected wallet.

Step 6: Manage User Data with Wallet Information
Let’s create functionality to fetch user-specific data, such as their wallet address and usage.

Set up state to store the user's address and usage:
typescript
Copy code
const [userUses, setUserUses] = useState<string>('0');
const [userAddress, setUserAddress] = useState<string>('none');
Create a function to fetch user data from the wallet:
typescript
Copy code
const fetchUserData = useCallback(async () => {
  const usedAddresses = await wallet.getUsedAddresses();
  const address = usedAddresses[0];
  setUserAddress(address);

  const storedUses = localStorage.getItem(address);
  if (storedUses === null) {
    localStorage.setItem(address, '30');
    setUserUses('30');
  } else {
    setUserUses(storedUses);
  }
}, [wallet]);
This function fetches the user's address from the wallet and stores it in localStorage if it's their first visit.

Final Thoughts
Once the setup is complete, you should be able to:

Connect your Cardano wallet.
Process transactions.
Fetch and manage user-specific data.
Make sure to replace placeholders like 'recipient_address' and 'amount_in_lovelace' with the actual values.