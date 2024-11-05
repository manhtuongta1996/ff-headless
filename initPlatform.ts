const { FlatfileClient } = require("@flatfile/api");
//import FFClient from "@flatfile/api"
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config()
// Outside of our deployed listeners, we'll need to configure the api with our key
const api = new FlatfileClient({ token:process.env.FLATFILE_API_KEY });

async function initPlatform(namespace: string, spacename: string) {
  try {
    
    //const name = spacename;
    //const space = await api.spaces.create({ name, namespace, autoConfigure: true });
    //console.log("created space", space)

    // Uploading a file to the space
    //const { id: spaceId, environmentId } = space.data;

    const spaceId = "us_sp_CW2vBEN3"
    const environmentId = "us_env_9zBv5p0c"
    const dataFilePath = path.join(__dirname, "./test_location.csv");
    const readStream = fs.createReadStream(dataFilePath);

    await api.files.upload(readStream, { spaceId, environmentId });
  } catch (error) {
    console.error(error);
  }
}

initPlatform("newapp2","New Space");