// or use @ardrive/turbo-sdk/web depending on your environment
import { TurboFactory, ArweaveSigner } from "@ardrive/turbo-sdk/node";
import { createData, sign } from "@dha-team/arbundles";
import fs from "fs";
import path from "path";

(async () => {
  const jwk = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));

  const signer = new ArweaveSigner(jwk);

  const turbo = TurboFactory.authenticated({
    signer,
  });

  // get the wallet balance
  const { winc: balance } = await turbo.getBalance();
  console.log("Balance", balance, "AR");

  // prep file for upload
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "./public/crew_1.jpeg");

  // Read the file content into a Buffer (which is a Uint8Array)
  const fileAsUint8Array = new Uint8Array(fs.readFileSync(filePath));

  console.log("File Size", fileAsUint8Array.length / 1024, "KB");

  // get the cost of uploading the file
  const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({
    bytes: [fileAsUint8Array.length],
  });

  console.log("File Size Cost", fileSizeCost / 10 ** 12, "AR");

  const data = createData(fileAsUint8Array, signer, {
    tags: [
      {
        name: "Content-Type",
        value: "image/jpeg",
      },
    ],
  });

  console.log("Data", data);

  const signedData = await sign(data, signer);

  // console.log("Signed Data", signedData);

  // upload the file
  try {
    const response = await fetch(`https://upload.ardrive.io/v1/tx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Accept: "application/json",
        "x-paid-by": "1-5C9_RbavjM4fG5nwLK9EOlpmTDmffb72WGQ5tvfgc",
      },
      body: data.getRaw(),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.dir(result);
  } catch (error) {
    console.error("Failed to upload image:", error);
    throw error;
  }
})();
