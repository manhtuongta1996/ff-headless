const { FlatfileClient } = require("@flatfile/api");
//import FFClient from "@flatfile/api"
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config()
// Outside of our deployed listeners, we'll need to configure the api with our key
const api = new FlatfileClient({ token:process.env.DEPUTY_HEADLESS_API_KEY });

//const dataFilePath = path.join(__dirname, "./inventory.csv");
//const readStream = fs.createReadStream(dataFilePath);

async function daily() {
  try {
    // To make it easier to find, we'll include the date in our space name
    const date = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const name = `test-location-workbook-7`;

    // Create a space
    //console.log(await FFClient.spaces.list())
    //const space = await api.spaces.create({ name, namespace:"newapp2", autoConfigure: true });
    //const { id: spaceId, environmentId } = space.data;
    //console.log("created space", space)

    console.log(await api.spaces.create())

    // Upload a file to the space
    //await api.files.upload(readStream, { spaceId, environmentId });
  } catch (error) {
    console.error(error);
  }
}

daily();