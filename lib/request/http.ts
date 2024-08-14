/**
 * Generic client for request to webapp that are not apiv2
 */
import axios from 'axios';
//import applyCsrfInterceptor from '../utils/apply-csrf-interceptor';
const http = axios.create({});
const remove = http.delete;
//applyCsrfInterceptor(http);
const { post, put, get } = http;

export { post, put, get, remove };
export default http;