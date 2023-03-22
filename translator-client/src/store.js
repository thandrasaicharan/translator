import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const initialState = {
  token: null,
  username: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'SET_USERNAME':
    return {
        ...state,
        username: action.payload,
    };
    default:
      return state;
  }
};

const store = createStore(reducer, applyMiddleware(thunk));

export default store
