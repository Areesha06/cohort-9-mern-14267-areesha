import axiosClient from './axiosClient';

export const registerRequest = (data) => axiosClient.post('/auth/register', data);
export const loginRequest = (data) => axiosClient.post('/auth/login', data);
export const getMeRequest = () => axiosClient.get('/auth/me');
