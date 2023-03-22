import { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { API_SERVER_BASE_URL } from '../Constants'
import FullPageLoader from "./FullPageLoader";
import axios from 'axios';
function UserPreference() {

  const [sourceLanguage, setSourceLanguage] = useState("");
  const [destinationLanguage, setDestinationLanguage] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  


  const token = useSelector(state => state.token);
  const navigate = useNavigate();
  if (!token) {
    navigate('/login');

  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    // do something with user preferences
    try {
      setLoading(true);
      const response = await axios.put(`${API_SERVER_BASE_URL}/preferences`, {
          "source_lang": sourceLanguage,
          "dest_lang": destinationLanguage,
          
      },{headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }});
      const msg = response.data?.message
      setLoading(false);
      if(msg){
        alert(msg)
      } else {
        alert("Try saving again.")
      }

  } catch (error) {
      setLoading(false);
      console.log(error);
      alert(error)
  }
  };
  useEffect(() => {
    setLoading(true);
    fetch(`${API_SERVER_BASE_URL}/supported-lang`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        const options = [];
        for (let i = 0; i < data.length; i++) {
          const { name, language } = data[i];
          options.push(
            <option key={i} value={language}>
              {name}
            </option>
          );
        }
        setOptions(options);
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_SERVER_BASE_URL}/preferences`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        setDestinationLanguage(data.dest_lang)
        setSourceLanguage(data?.source_lang)
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
  }, []);

  return (
    <>
    {loading && <FullPageLoader />}
    <Container>
      <h1>User Preferences</h1>
      <Form onSubmit={handleSubmit}>




        <Form.Group controlId="formSourceLanguage">
          <Form.Label>Source language</Form.Label>
          <Form.Control as="select" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>
            {options}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="formTargetLanguage">
          <Form.Label>Target language</Form.Label>
          <Form.Control as="select" value={destinationLanguage} onChange={(event) => setDestinationLanguage(event.target.value)}>
            {options}
          </Form.Control>
        </Form.Group>




        <Button className="mt-3 mb-3" variant="primary" type="submit">
          Save Preferences
        </Button>
      </Form>
    </Container>
    </>
  );
}

export default UserPreference;
