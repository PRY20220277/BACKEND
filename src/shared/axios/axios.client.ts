import axios from 'axios';

const axiosClient = (url: string, token?: string) => {
  const headers: any = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: url,
    headers: headers,
  });
};

export { axiosClient };
