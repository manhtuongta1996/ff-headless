import { get } from '../../lib/request/http';
import { configDotenv } from 'dotenv';
configDotenv({path:'/Users/tonyta/Desktop/FlatfileApp (1)/.env'})
export async function getCountryList(): Promise<any> {
//   const aud = 'DEPUTY';
//   const claims = {
//     deputy_user_id: '',
//     deputy_business_id: '',
//     deputy_employee_profile_id: '',
//     deputy_business_user_id: '',
//     deputy_business_location_id: '',
//   };

  //jwt token
  const token = process.env.JWT_TOKEN
  console.log("token++++++++++++++++++++", token, process.env)
  const config = {
    headers: {
      Authorization: `OAuth ${token}`,
    },
  };

  const countryList = await get(
    `https://nick.au.deputy.com/api/v2/geo/countries?includes=states`,
    config
  );

  return countryList.data;
}
