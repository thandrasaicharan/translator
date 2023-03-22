import axios from 'axios';
import { API_SERVER_BASE_URL } from './Constants'

export const login = (username, password) => {
  return (dispatch) => {
    return axios.post(`${API_SERVER_BASE_URL}/login`, { username, password })
      .then((response) => {
        const token = response.data.token;
        dispatch(setToken(token));
        dispatch(setUsername(username));
        window.location.hash = '/text-translate';
      })
      .catch((error) => {
        alert('failed login');
      });
  };
};

export const setToken = (token) => {
  return {
    type: 'SET_TOKEN',
    payload: token,
  };
};

export const setUsername = (username) => {
    return {
      type: 'SET_USERNAME',
      payload: username,
    };
  };
  
