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

  //jwt token
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE3MjM1NDUyNjQsImlhdCI6MTcyMzU0NDk2NCwibmJmIjoxNzIzNTQ0OTU5LCJqdGkiOiIya2JHZk9NZGpwZWxzMXlRMlRXdW4zZTBSbFYiLCJpc3MiOiJkZXB1dHkuY29tIiwiYXVkIjoiZGVwdXR5LmNvbSIsImRwLmJpZCI6IjYyM2E4YTBjLWU4YTYtNGI3Zi05ODRhLTZkMGFlZDFjMDE2OSIsImRwLmJ1aWQiOiIxNTgwIiwiZHAudWlkIjoiYjc2NGY5MjItYjVkYy00ZjIwLWI1NWItZTg4YWNmZjcyMzJmIiwiZHAucmVnIjoiYXAtc291dGhlYXN0LTIiLCJkcC5yZWdzIjoiYXBzZTIiLCJkcC5hcGloIjoiYXBpLmFwc2UyLmRlcHV0eS5jb20iLCJkcC5wdSI6ZmFsc2UsImRwLmFkdnUiOmZhbHNlLCJkcC5iY2huIjoibmljay5hdS5kZXB1dHkuY29tIiwiZHAuc2IiOmZhbHNlfQ.26LDWTR2vKggxW02TGdOpo9R4H8JmuhTz37Qw3LPLe4V_4Co80D_fBLi6IJqQAuAPV5KXUUONnGahpgfYuX7lQ"
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
