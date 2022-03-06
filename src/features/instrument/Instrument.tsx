import { Button } from '@mui/material';
import './Instrument.css';
import { Synth, Volume, Sampler, Destination, PolySynth, Transport, Part, Noise, AutoFilter, Player } from 'tone'
import { BASS_CHORDS, GAMMA_NOTES, MARIO_SAMPLES, MELODY_CHORDS, JUMP_SONG } from '../../constants/notes'
import { useRef, useEffect } from 'react';
import * as mm from '@magenta/music';
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

  return (
    <div className="Instrument">
      <Keys></Keys>
      <div className="Section">
        <PredefinedMusic></PredefinedMusic>
      </div>
      <div className="Section"><AIMusic></AIMusic></div>
    </div>

  );
}

export const Keys = () => {
  function playNote(note: string) {
    polySynthSquare.triggerAttackRelease(note, "8n");
    sampler.triggerAttack(note);
  }

  return (
    <div>
      {GAMMA_NOTES.map(note => (
        <Button onClick={() => playNote(note)} key={note} sx={keyStyles}>♪ {note}</Button>
      ))}
    </div>
  );
}

export const PredefinedMusic = () => {
  const isTransportStarted = useRef(false);
  const melodyPart = useRef<Part | null>(null);
  const bassPart = useRef<Part | null>(null);
  const noise = useRef<Noise | null>(null);

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
    <>
      <Button onClick={toggleMelody}>🎹 Melody</Button>
      <Button onClick={toggleBass}>🎸 Bass</Button>
      <Button onClick={toggleNoise}>💨 Noise</Button>
      <Button onClick={playRandomMarioSample}>🍄 Mario</Button>
      <Button onClick={speedUpBpm}>👟 Speed up</Button>
      <Button onClick={stopInstruments}>🖐 Stop</Button>
    </>
  );
}

const mmPlayer = new mm.Player();

const musicRNN = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
const musicVAE = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2');

const steps = 60;
const temperature = 1.5;
const stepsPerQuarter = 4;
export const AIMusic = () => {
  useEffect(() => {
    musicRNN.initialize();
    musicVAE.initialize();
  }, []);

  function playOriginalSong() {
    if (mmPlayer.isPlaying()) {
      mmPlayer.stop();
    } else {
      mmPlayer.start(JUMP_SONG);
    }
  }

  function continueSongWithAI() {
    if (mmPlayer.isPlaying()) {
      mmPlayer.stop();
    } else {
      const quantizedNotes = mm.sequences.quantizeNoteSequence(JUMP_SONG, stepsPerQuarter);

      musicRNN
        .continueSequence(quantizedNotes, steps, temperature)
        .then((sample) => mmPlayer.start(sample))
        .catch((err: any) => console.log(err));
    }
  }

  function playNewSongWithAI() {
    if (mmPlayer.isPlaying()) {
      mmPlayer.stop();
      return;
    } else {
      musicVAE
        .sample(1, temperature)
        .then((samples) => mmPlayer.start(samples[0]));
    }
  }

  return (
    <>
      <Button onClick={playOriginalSong}>⭐️ Original</Button>
      <Button onClick={continueSongWithAI}>🌟 AI continues</Button>
      <Button onClick={playNewSongWithAI}>👶 AI new song</Button>
    </>
  );
}
