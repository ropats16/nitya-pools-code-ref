# Nitya Pools: Upload Data to Arweave with Sponsored Credits

This guide explains how to use Nitya Pools to upload data to Arweave. Nitya Pools allow sponsors to set up credit pools for events, enabling participants to use these shared credits for testing and other activities without needing their own AR tokens.

> Note: Your wallet address must be whitelisted by the Sponsor in order for you to be able to use credits from the shared pool.

There are three primary ways to interact with Nitya Pools:

1.  Command Line Interface (CLI)
2.  Node/ Web
3.  HTTP API

## Using the CLI to Upload Files

### 1. Installation

First, you need to install the `@ardrive/turbo-sdk` globally on your system. Open your terminal and run the following command:

```bash
npm install -g @ardrive/turbo-sdk
```

### 2. Wallet Setup

You will need an Arweave wallet key file. Ensure you have your key file saved securely on your computer. This file is necessary for the CLI to interact with the Arweave network and Nitya Pools.

For example, you might save your wallet as `wallet.json` in your project directory or a designated secure location.

### 3. Uploading Files

Once the SDK is installed and you have your wallet file ready, you can upload files using the `turbo upload-file` command.

Here's an example command:

```bash
turbo upload-file --file-path ./public/stock.jpeg --wallet-file ./wallet.json
```

**Explanation of the command:**

- `turbo upload-file`: The base command to initiate a file upload.
- `--file-path ./public/stock.jpeg`: Specifies the path to the file you want to upload. Replace `./public/stock.jpeg` with the actual path to your file.
- `--wallet-file ./wallet.json`: Specifies the path to your Arweave wallet key file. Replace `./wallet.json` with the actual path to your wallet file.

### Important Note

By default, the CLI is configured to prioritize using credits from any available sponsor pools you are part of. If credits are available in a Nitya Pool, they will be used before attempting to use any credits from your personal wallet. This makes it easy for participants in sponsored events to upload data without incurring personal costs.

---

## Using the Node.js SDK to Upload Files

You can also programmatically upload files to Arweave using Nitya Pools credits via the `@ardrive/turbo-sdk` in a Node.js environment.

### 1. Setup and Initialization

First, ensure you have the `@ardrive/turbo-sdk` installed in your project:

```bash
npm install @ardrive/turbo-sdk
```

Then, you can import the necessary modules and initialize the Turbo SDK with your Arweave wallet:

```javascript
// src/index-node.js (Simplified Example)
import { TurboFactory, ArweaveSigner } from "@ardrive/turbo-sdk/node";
import fs from "fs";
import path from "path";

(async () => {
  const jwk = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));
  const signer = new ArweaveSigner(jwk);
  const turbo = TurboFactory.authenticated({
    signer,
  });

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "./public/stock.jpeg");
  const fileSize = fs.statSync(filePath).size;

  // Details for balance checking and cost estimation can be found in src/index-node.js

  try {
    const { id } = await turbo.uploadFile({
      fileStreamFactory: () => fs.createReadStream(filePath),
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: [
          {
            name: "Content-Type",
            value: "image/jpeg",
          },
        ],
        // Specify the sponsor's wallet address to use their Nitya Pool credits
        paidBy: "1-5C9_RbavjM4fG5nwLK9EOlpmTDmffb72WGQ5tvfgc", // Replace with actual sponsor wallet address
      },
    });
    console.log("Successfully uploaded data item with ID:", id);
  } catch (error) {
    console.error("Failed to upload data item:", error);
  }
})();
```

### 2. Using Sponsored Credits with `paidBy`

To utilize credits from a Nitya Pool, you must specify the sponsor's Arweave wallet address in the `paidBy` field within the `dataItemOpts` when calling `turbo.uploadFile()`.

As shown in the example above (and in `src/index-node.js`):

```javascript
// ...
dataItemOpts: {
  // ... other tags
  paidBy: "SPONSOR_WALLET_ADDRESS", // Replace with the actual sponsor's wallet address
}
// ...
```

This tells the ArDrive Turbo SDK to attempt to use the sponsor's Nitya Pool credits for the upload transaction.

---

## Using the HTTP API to Upload Files

For environments where you might not use the SDK directly, or for more direct control, you can interact with the Nitya Pools / ArDrive upload endpoint via an HTTP POST request.

### 1. Prepare Data for Upload

Before making the HTTP request, you'll need to prepare your file data as a data item and sign it. The `@dha-team/arbundles` library can be helpful here, as shown in `src/index-http.js`.

```javascript
// src/index-http.js (Simplified Example)
import { ArweaveSigner } from "@ardrive/turbo-sdk/node"; // Signer can be from turbo-sdk
import { createData, sign } from "@dha-team/arbundles";
import fs from "fs";
import path from "path";

(async () => {
  const jwk = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));
  const signer = new ArweaveSigner(jwk);

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "./public/stock.jpeg");
  const fileAsUint8Array = new Uint8Array(fs.readFileSync(filePath));

  const data = createData(fileAsUint8Array, signer, {
    tags: [
      {
        name: "Content-Type",
        value: "image/jpeg",
      },
    ],
  });

  const signedData = await sign(data, signer);

  // ... (rest of the HTTP call)
})();
```

### 2. Making the HTTP POST Request

You will send the raw binary data of the (potentially unsigned if using `x-paid-by`) data item in the body of a POST request to `https://upload.ardrive.io/v1/tx`.

### 3. Using Sponsored Credits with `x-paid-by` Header

To use credits from a Nitya Pool via the HTTP API, include the `x-paid-by` header in your request, with its value set to the sponsor's Arweave wallet address.

```javascript
// src/index-http.js (Relevant Part)
// ...
try {
  const response = await fetch(`https://upload.ardrive.io/v1/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Accept: "application/json",
      // Specify the sponsor's wallet address to use their Nitya Pool credits
      "x-paid-by": "1-5C9_RbavjM4fG5nwLK9EOlpmTDmffb72WGQ5tvfgc", // Replace with actual sponsor wallet address
    },
    body: data.getRaw(), // Send the raw data item
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  const result = await response.json();
  console.dir(result);
} catch (error) {
  console.error("Failed to upload image:", error);
}
// ...
```

When the `x-paid-by` header is present and valid, the ArDrive service will attempt to use the specified sponsor's Nitya Pool credits for the upload.

---
