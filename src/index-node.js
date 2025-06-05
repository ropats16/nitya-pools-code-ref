// or use @ardrive/turbo-sdk/web depending on your environment
import { TurboFactory, ArweaveSigner } from "@ardrive/turbo-sdk/node";
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
  const filePath = path.join(__dirname, "./public/stock.jpeg");
  const fileSize = fs.statSync(filePath).size;

  console.log("File Size", fileSize / 1024, "KB");

  // get the cost of uploading the file
  const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({
    bytes: [fileSize],
  });

  console.log("File Size Cost", fileSizeCost / 10 ** 12, "AR");

  // upload the file
  try {
    const { id, owner, dataCaches, fastFinalityIndexes } =
      await turbo.uploadFile({
        fileStreamFactory: () => fs.createReadStream(filePath),
        fileSizeFactory: () => fileSize,
        // optional
        dataItemOpts: {
          tags: [
            {
              name: "Content-Type",
              value: "image/jpeg",
            },
          ],
          paidBy: " 1-5C9_RbavjM4fG5nwLK9EOlpmTDmffb72WGQ5tvfgc",
        },
      });
    // upload complete!
    console.log("Successfully uploaded data item!", {
      id,
      owner,
      dataCaches,
      fastFinalityIndexes,
    });
  } catch (error) {
    // upload failed
    console.error("Failed to upload data item!", error);
  }
})();
