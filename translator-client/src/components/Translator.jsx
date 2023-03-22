import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { translateText } from '../services/Translation'
import { API_SERVER_BASE_URL } from '../Constants'
import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import AudioRecorder from './AudioRecorder';
import FullPageLoader from './FullPageLoader';


export default function Translator() {
    const [text, setText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('en');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const token = useSelector(state => state.token);
    const navigate = useNavigate();
    // if (!token) {
    //     navigate('/login');
        
    //   }

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
            setTargetLanguage(data.dest_lang)
            setSourceLanguage(data?.source_lang)
          })
          .catch(error => {
            setLoading(false);
            console.error(error);
          });
      }, []);
    
    useEffect(() => {
        setLoading(true);
        fetch(`${API_SERVER_BASE_URL}/supported-lang`, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }})
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
        if (translatedText !== '') {

        }
    }, [translatedText]);



    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleSourceLanguageChange = (event) => {
        setSourceLanguage(event.target.value);
    };

    const handleTargetLanguageChange = (event) => {
        setTargetLanguage(event.target.value);
    };

    const handleTranslation = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            const response = await axios.post(`${API_SERVER_BASE_URL}/translate`, {
                text,
                "source_lang": sourceLanguage,
                "dest_lang": targetLanguage,
            });
            const translatedText = response.data?.translation;
            setLoading(false);
            setTranslatedText(translatedText);

        } catch (error) {
            setLoading(false);
            console.log(error);
            alert(error)
        }
    };


    return (
        <>
        {loading && <FullPageLoader />}
        <Container>
            <Row>
                <Col>
                    <h1>Text Translation</h1>
                </Col>
            </Row>
            <Row>
                <Col md={4}>
                    <Form onSubmit={handleTranslation}>
                        <Form.Group controlId="formText">
                            <Form.Label>Enter text to translate</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                value={text}
                                onChange={handleTextChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formSourceLanguage">
                            <Form.Label>Source language</Form.Label>
                            <Form.Control as="select" value={sourceLanguage} onChange={handleSourceLanguageChange}>
                                {options}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formTargetLanguage">
                            <Form.Label>Target language</Form.Label>
                            <Form.Control as="select" value={targetLanguage} onChange={handleTargetLanguageChange}>
                                {options}
                            </Form.Control>
                        </Form.Group>
                        <AudioRecorder srcLang={sourceLanguage} destLang={targetLanguage} setTranslatedText={setTranslatedText} setLoading={setLoading}></AudioRecorder>


                        <Button className='mt-3 mb-3' variant="primary" type="submit">
                            Translate
                        </Button>
                    </Form>
                </Col>
                <Col className='translation__margin' md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Translation</Card.Title>
                            <Card.Text>{translatedText}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container></>);

}
