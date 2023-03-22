import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import { API_SERVER_BASE_URL } from '../Constants'
import { useSelector } from 'react-redux';
import { faMicrophone, faStopCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useNavigate } from 'react-router-dom';

const AudioRecorder = (props) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const token = useSelector(state => state.token);
  const navigate = useNavigate();
  // if (!token) {
  //     navigate('/login');
      
  //   }

  const {srcLang, destLang, setTranslatedText, setLoading} = props;
  const handleStartRecording = () => {
    const mediaStream = navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleUpload = () => {
    debugger
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    setLoading(true);
    fetch(`${API_SERVER_BASE_URL}/transcription`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-DestLang': `${destLang}`,
        'X-SrcLang': `${srcLang}`

      }
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        console.log('Audio uploaded successfully:', data);
        if(data?.message){
            alert("Try recording again.")
        }
        setTranslatedText(data?.translation);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error uploading audio:', error);
      });
  };

  return (
    <div>
      {recording ? (
        <Button className='m-2' variant="danger" onClick={handleStopRecording}>
          <FontAwesomeIcon icon={faStopCircle} size='2x' />
        </Button>
      ) : (
        <Button className='m-2' variant="primary" onClick={handleStartRecording}>
           <FontAwesomeIcon icon={faMicrophone} size='2x' />
        </Button>
      )}
      {audioBlob && !recording && (
        <Button className='m-2' variant="success" onClick={handleUpload}>
           <FontAwesomeIcon icon={faUpload} size='2x' />
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;