import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Login';
import RegistrationPage from './components/Registration';
import Translator from './components/Translator';
import PageNotFound from './components/PageNotFound';
import AboutPage from './components/About';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path='/' element={<App></App>}>
          <Route path='' element={<LoginPage></LoginPage>}></Route>
          <Route path='/register' element={<RegistrationPage></RegistrationPage>}></Route>
          <Route path='/about' element={<AboutPage></AboutPage>}></Route>
          <Route path='/text-translate' element={<Translator></Translator>}></Route>
          <Route path='*' element={<PageNotFound></PageNotFound>}></Route>
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
