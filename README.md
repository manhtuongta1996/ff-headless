### How to run the script
1. Add .env file with your FF API key.
```
FLATFILE_API_KEY="somekey"
FLATFILE_ENVIRONMENT_ID="environment" # env: development
```

2. run 
```npm i --legacy-peer-deps && npx @flatfile develop index.ts```
To run the listener in your local

2. OR run npx @flatfile deploy index.ts to the flatfile agent

3. Test your operation script by running node daily.js

### How to get JWT token