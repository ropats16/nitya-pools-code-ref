# Nitya Pools: Upload Data to Arweave with Sponsored Credits

This guide explains how to use Nitya Pools to upload data to Arweave. Nitya Pools allow sponsors to set up credit pools for events, enabling participants to use these shared credits for testing and other activities without needing their own Arweave tokens.

There are three primary ways to interact with Nitya Pools:

1.  Command Line Interface (CLI)
2.  Software Development Kit (SDK)
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
turbo upload-file --file-path ./public/crew_1.jpeg --wallet-file ./wallet.json
```

**Explanation of the command:**

- `turbo upload-file`: The base command to initiate a file upload.
- `--file-path ./public/crew_1.jpeg`: Specifies the path to the file you want to upload. Replace `./public/crew_1.jpeg` with the actual path to your file.
- `--wallet-file ./wallet.json`: Specifies the path to your Arweave wallet key file. Replace `./wallet.json` with the actual path to your wallet file.

### Important Note

By default, the CLI is configured to prioritize using credits from any available sponsor pools you are part of. If credits are available in a Nitya Pool, they will be used before attempting to use any credits from your personal wallet. This makes it easy for participants in sponsored events to upload data without incurring personal costs.

---
