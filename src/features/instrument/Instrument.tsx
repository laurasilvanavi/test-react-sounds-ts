import { Button } from '@mui/material';
import './Instrument.css';
import { Synth, Volume, Sampler, Destination, PolySynth, Transport, Part, Noise, AutoFilter, Player } from 'tone'
import { BASS_CHORDS, GAMMA_NOTES, MARIO_SAMPLES, MELODY_CHORDS } from '../../constants/notes'
const DogSample = require("../../assets/dog-sample.mp3");

const keyStyles = {
  paddingTop: '4em',
  paddingBottom: '4em',
  width: '5em'
};

export const Instrument = () => {
  // @TODO: work on initializing only once (useEffect/useMemo?)
  const mediumVolume = new Volume(-15);

  const sampler = new Sampler({
    E4: DogSample,
  }).chain(mediumVolume, Destination);

  const polySynthSquare = new PolySynth(Synth, {
    oscillator: {
      type: "square",
    },
  }).chain(new Volume(-25), Destination);

  // buuu
  let isTransportStarted: boolean = false;
  let melodyPart: Part | null = null;
  let bassPart: Part | null = null;
  let noise: Noise | null = null;

  function playNote(note: string) {
    polySynthSquare.triggerAttackRelease(note, "8n");
    sampler.triggerAttack(note);
  }

  // @TODO: add types
  function playPart(part: Part) {
    if (!isTransportStarted) {
      Transport.toggle();
      isTransportStarted = true;
      Transport.bpm.value = 132;
    }

    part.start(0);
    part.loop = true;
    part.loopEnd = "4m";
  }

  // @TODO: maybe move to separate components, maybe same file
  function toggleMelody() {
    if (melodyPart) {
      melodyPart.mute = !melodyPart.mute;
    } else {
      const polySynthSaw = new PolySynth(Synth, {
        oscillator: {
          type: "fatsawtooth",
        },
        envelope: {
          attack: 0.01,
          release: 0.4,
        },
      }).chain(mediumVolume, Destination);

      melodyPart = new Part((time, chord) => {
        sampler.triggerAttackRelease(chord.note, chord.duration, time);
        polySynthSaw.triggerAttackRelease(
          chord.note,
          chord.duration,
          time
        );
      }, MELODY_CHORDS);

      playPart(melodyPart);
    }
  }

  function toggleBass() {
    if (bassPart) {
      bassPart.mute = !bassPart.mute;
    } else {
      bassPart = new Part((time, chord) => {
        polySynthSquare.triggerAttackRelease(
          chord.note,
          chord.duration,
          time
        );
      }, BASS_CHORDS);

      playPart(bassPart);
    }
  }

  function toggleNoise() {
    if (noise) {
      noise.mute = !noise.mute;
    } else {
      noise = new Noise("pink").start();
      const filter = new AutoFilter({
        frequency: "8m",
      }).chain(new Volume(-20), Destination);

      noise.connect(filter);
      filter.start();
    }
  }

  // @TODO: review isnt a beter way to write each thing now (always create new player?), also any diff in react
  function playSample(sampleName: string) {
    new Player({
      url: sampleName,
      autostart: true,
    }).chain(mediumVolume, Destination);
  }

  function playRandomMarioSample() {
    playSample(
      MARIO_SAMPLES[Math.floor(Math.random() * MARIO_SAMPLES.length)]
    );
  }

  function speedUpBpm() {
    Transport.bpm.value += 20;
  }

  function stopInstrument(instrument: Part | Noise | null) {
    if (instrument) {
      instrument.mute = true;
      instrument.stop();
      // instrument = null;
    }
  }

  function stopInstruments() {
    playSample(MARIO_SAMPLES[5]);

    stopInstrument(melodyPart);
    stopInstrument(bassPart);
    stopInstrument(noise);
  }

  return (
    <div className="Instrument">
      <div>
        {GAMMA_NOTES.map(note => (
          <Button onClick={() => playNote(note)} key={note} sx={keyStyles}>♪ {note}</Button>
        ))}
      </div>
      <div className="PredefinedMusic">
        <Button onClick={toggleMelody}>🎹 Melody</Button>
        <Button onClick={toggleBass}>🎸 Bass</Button>
        <Button onClick={toggleNoise}>💨 Noise</Button>
        <Button onClick={playRandomMarioSample}>🍄 Mario</Button>
        <Button onClick={speedUpBpm}>👟 Speed up</Button>
        <Button onClick={stopInstruments}>🖐 Stop</Button>
      </div>
    </div>

  );
}