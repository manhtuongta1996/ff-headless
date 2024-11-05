import { get } from "../http";
import { configDotenv } from 'dotenv';
configDotenv()
// Available properties to be fetched: countries, states, timezones
const validProperties = ['countries', 'states', 'timezone'];

async function fetchCountryStatesTimezones(properties = []) {
    
    try {
        const token = process.env.JWT_TOKEN
        const config = {
            headers: {
            Authorization: `OAuth ${token}`,
            },
        };
      const res = await get(`https://nick.au.deputy.com/api/v1/my/setup/getStateCountryList`,
        config
      );
      console.log("timezone ressssssssssss", res)
      if (res.status >= 400) {
        const errorMessage =
          'Failed to fetch timezones with status: ' + res.status;
        console.error(errorMessage);
        return [];
      }
  
      return properties.reduce((result, prop) => {
        // Check if the property is valid
        if (validProperties.includes(prop) && prop in res.data) {
          result[prop] = res.data[prop];
        }
        return result;
      }, {});
    } catch (e) {
      console.error(e);
    }
  }
  export {
    fetchCountryStatesTimezones,
  };
  