const { FlatfileClient } = require("@flatfile/api");
const fs = require("fs");
const path = require("path");
// Outside of our deployed listeners, we'll need to configure the api with our key
const api = new FlatfileClient({ token:"sk_efb599d2ab3249e982a1b341b76bd83c" });

const dataFilePath = path.join(__dirname, "./inventory.csv");
const readStream = fs.createReadStream(dataFilePath);

async function uploadingFile() {
    const spaceId = "us_sp_mO1GD6zi"
    const environmentId = "us_env_9zBv5p0c"
    try{
    const uploadResult = await api.files.upload(readStream, { spaceId, environmentId });
        console.log(uploadResult)
} catch (error) {
    console.error(error);
  }
}

uploadingFile();