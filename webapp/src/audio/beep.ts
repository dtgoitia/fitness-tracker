const RAMP_VALUE = 0.00001;
const RAMP_DURATION = 1;

type Milliseconds = number;
type Frequency = number; // Hz
export enum Pitch {
  // values in Hz
  low = 440,
  medium = 900,
  high = 2000,
}

interface BeepArgs {
  repetitions: number;
  repetitionInterval: Milliseconds;
  pitch: Frequency | Pitch;
}

export function beep(args: BeepArgs): void {
  const { repetitions, repetitionInterval: interval, pitch: frequency } = args;

  // skip type checking for the following line, because TypeScript does not
  // recognize window.webkitAudioContext
  // @ts-ignore
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new window.AudioContext();

  function play() {
    const currentTime = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    gain.gain.setValueAtTime(gain.gain.value, currentTime);
    gain.gain.exponentialRampToValueAtTime(RAMP_VALUE, currentTime + RAMP_DURATION);

    osc.onended = function () {
      gain.disconnect(context.destination);
      osc.disconnect(gain);
    };

    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.start(currentTime);
    osc.stop(currentTime + RAMP_DURATION);
  }

  function beepMultipleTimes(times: number): void {
    (function loop(i = 0) {
      play();
      if (++i < times) {
        setTimeout(loop, interval, i);
      }
    })();
  }

  beepMultipleTimes.destroy = function () {
    context.close();
  };

  beepMultipleTimes(repetitions);
}
