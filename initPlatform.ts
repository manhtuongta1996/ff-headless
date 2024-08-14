const { FlatfileClient } = require("@flatfile/api");
//import FFClient from "@flatfile/api"
const path = require("path");
const dotenv = require("dotenv");
dotenv.config()
// Outside of our deployed listeners, we'll need to configure the api with our key
const api = new FlatfileClient({ token:process.env.FLATFILE_API_KEY });

async function initPlatform(namespace: string, spacename: string) {
  try {
    
    const name = spacename;
    const space = await api.spaces.create({ name, namespace, autoConfigure: true });
    console.log("created space", space)
  } catch (error) {
    console.error(error);
  }
}

initPlatform("newapp2","New Space");