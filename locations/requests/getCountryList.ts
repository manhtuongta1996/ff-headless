import { get } from '../../lib/request/http';

export async function getCountryList(): Promise<any> {
//   const aud = 'DEPUTY';
//   const claims = {
//     deputy_user_id: '',
//     deputy_business_id: '',
//     deputy_employee_profile_id: '',
//     deputy_business_user_id: '',
//     deputy_business_location_id: '',
//   };

  //const token = "a6844fa1f45338d56e05618520d5d774";
  const JWT_SHORT_LIVE="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE3MjM2MTYzNTEsImlhdCI6MTcyMzYxNjA1MSwibmJmIjoxNzIzNjE2MDQ2LCJqdGkiOiIya2Rha2Z6VHNhMFpjZnI0bVB6TVRKSjJRSmYiLCJpc3MiOiJkZXB1dHkuY29tIiwiYXVkIjoiZGVwdXR5LmNvbSIsImRwLmJpZCI6IjYyM2E4YTBjLWU4YTYtNGI3Zi05ODRhLTZkMGFlZDFjMDE2OSIsImRwLmJ1aWQiOiIxNTgwIiwiZHAudWlkIjoiYjc2NGY5MjItYjVkYy00ZjIwLWI1NWItZTg4YWNmZjcyMzJmIiwiZHAucmVnIjoiYXAtc291dGhlYXN0LTIiLCJkcC5yZWdzIjoiYXBzZTIiLCJkcC5hcGloIjoiYXBpLmFwc2UyLmRlcHV0eS5jb20iLCJkcC5wdSI6ZmFsc2UsImRwLmFkdnUiOmZhbHNlLCJkcC5iY2huIjoibmljay5hdS5kZXB1dHkuY29tIiwiZHAuc2IiOmZhbHNlfQ.K3mGXwgOxv8MON7u39swL5ZiLAs4R53hc_b3Y-A4wh5ryoFPGIc0CezKJ6GJUVEM8Uz1_AJrINDWUbJLXmDLKQ"
  //jwt token
  const token = JWT_SHORT_LIVE
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
