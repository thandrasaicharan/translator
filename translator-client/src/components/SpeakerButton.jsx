import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';

const SpeakerButton = ({ text }) => {
    const speakText = (text) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
      };
  const handleClick = () => {
    speakText(text);
  };

  return (
    <Button onClick={handleClick}>
      <FontAwesomeIcon icon={faVolumeUp} />
    </Button>
  );
};


export default SpeakerButton;