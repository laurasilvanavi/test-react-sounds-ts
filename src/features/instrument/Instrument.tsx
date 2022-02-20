import { Button } from '@mui/material';
import './Instrument.css';
import { Synth, Volume, Sampler, Destination, PolySynth, Transport, Part, Noise, AutoFilter, Player } from 'tone'
import { BASS_CHORDS, GAMMA_NOTES, MARIO_SAMPLES, MELODY_CHORDS } from '../../constants/notes'
import { useRef } from 'react';
const DogSample = require("../../assets/dog-sample.mp3");

const keyStyles = {
  paddingTop: '4em',
  paddingBottom: '4em',
  width: '5em'
};
const mediumVolume = new Volume(-15);
const sampler = new Sampler({
  E4: DogSample,
}).chain(mediumVolume, Destination);
const polySynthSquare = new PolySynth(Synth, {
  oscillator: {
    type: "square",
  },
}).chain(new Volume(-25), Destination);

export const Instrument = () => {
  // @TODO: separate to piaoa nd predefined isntruments

  const isTransportStarted = useRef(false);
  const melodyPart = useRef<Part | null>(null);
  const bassPart = useRef<Part | null>(null);
  const noise = useRef<Noise | null>(null);

  function playNote(note: string) {
    polySynthSquare.triggerAttackRelease(note, "8n");
    sampler.triggerAttack(note);
  }

  function playPart(part: Part) {
    if (!isTransportStarted.current) {
      Transport.toggle();
      isTransportStarted.current = true;
      Transport.bpm.value = 132;
    }

    part.start(0);
    part.loop = true;
    part.loopEnd = "4m";
  }

  // @TODO: maybe move to separate components, maybe same file
  function toggleMelody() {
    if (melodyPart.current) {
      melodyPart.current.mute = !melodyPart.current.mute;
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

      melodyPart.current = new Part((time, chord) => {
        sampler.triggerAttackRelease(chord.note, chord.duration, time);
        polySynthSaw.triggerAttackRelease(
          chord.note,
          chord.duration,
          time
        );
      }, MELODY_CHORDS);

      playPart(melodyPart.current);
    }
  }

  function toggleBass() {
    if (bassPart.current) {
      bassPart.current.mute = !bassPart.current.mute;
    } else {
      bassPart.current = new Part((time, chord) => {
        polySynthSquare.triggerAttackRelease(
          chord.note,
          chord.duration,
          time
        );
      }, BASS_CHORDS);
      playPart(bassPart.current);
    }
  }

  function toggleNoise() {
    if (noise.current) {
      noise.current.mute = !noise.current.mute;
    } else {
      noise.current = new Noise("pink").start();
      const filter = new AutoFilter({
        frequency: "8m",
      }).chain(new Volume(-20), Destination);
      noise.current.connect(filter);
      filter.start();
    }
  }

  // @TODO: check arent a beter way to write each thing now (always create new player?), also check updates in tone
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
    }
  }

  function stopInstruments() {
    playSample(MARIO_SAMPLES[5]);

    stopInstrument(melodyPart.current);
    stopInstrument(bassPart.current);
    stopInstrument(noise.current);
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