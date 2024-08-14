import { AxiosInstance } from 'axios';

let token: string;

function getCsrfToken(): string {
  if (!token) {
    token = (document.querySelector('#Qform__CsrfToken') as HTMLInputElement)
      ?.value;
  }

  return token;
}

export default function applyCsrfInterceptor(
  axiosInstance: AxiosInstance
): void {
  axiosInstance.interceptors.request.use(async function(config) {
    const token = getCsrfToken();

    if (token && config.headers) {
      config.headers['csrf-token'] = token;
    }

    return config;
  });
}
