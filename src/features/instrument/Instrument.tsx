import { Button } from '@mui/material';
import './Instrument.css';
import { Synth, Volume, Sampler, Destination } from 'tone'
import { GAMMA_NOTES } from '../../constants/notes'
const CatSample = require("../../assets/cat-sample.mp3");

export const Instrument = () => {
  // @TODO: work on initializing only once (useMemo?)
  const synth = new Synth().toDestination();

  const volume = new Volume(-5);
  const sampler = new Sampler({
    G2: CatSample,
  }).chain(volume, Destination);

  function play(note: string) {
    synth.triggerAttackRelease(note, "8n");
    sampler.triggerAttack(note);
  }


  return (
    <div className="Instrument">
      <div>
        {GAMMA_NOTES.map(note => (
          <Button size="large" variant="contained" color="primary" onClick={() => play(note)} key={note}>♪ {note}</Button>
        ))}
      </div>
    </div>

  );
}