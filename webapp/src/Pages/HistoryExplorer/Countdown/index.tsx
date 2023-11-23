import { Pitch, beep } from "../../../audio/beep";
import { Seconds, nSecondsAfter, now } from "../../../domain/datetimeUtils";
import { Counter } from "./Counter";
import { Button } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

const COUNTER_REFRESH_RATE_IN_MS = 100;

const Container = styled.div`
  margin: 1rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  column-gap: 0.5rem;
`;

function Countdown() {
  const [isCounterVisible, setIsCounterVisible] = useState<boolean>(false);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [time, setTime] = useState<Seconds>(0);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [timeLeft, setTimeLeft] = useState<Seconds>(0);

  useEffect(() => {
    function tick(): void {
      if (deadline === undefined || isCounting === false) return;

      setTimeLeft((deadline.getTime() - now().getTime()) / 1000);
    }

    const interval = setInterval(() => tick(), COUNTER_REFRESH_RATE_IN_MS);
    return () => clearInterval(interval);
  }, [time, deadline, isCounting]);

  function _updateTimerTime(time: Seconds): void {
    setTime(time);
  }

  function _resetTimer(time: Seconds): void {
    setIsCounting(false);
    setTimeLeft(time);

    setDeadline(undefined);
  }

  function _stop(): void {
    setIsCounting(false);
  }

  function handleButtonClick({ time }: { time: Seconds }): void {
    // stop and set countdown to clicked button value
    _updateTimerTime(time);
    _resetTimer(time);
    if (isCounterVisible === false) {
      setIsCounterVisible(true);
    }
    _stop();
  }

  function handleCounterClick(): void {
    // pause or start/resume countdown
    const secondsLeft = deadline === undefined ? time : timeLeft;
    setDeadline(nSecondsAfter(now(), secondsLeft));
    setIsCounting(!isCounting);
  }

  if (isCounting && timeLeft <= 0) {
    // beep and reset countdown
    _stop();
    _resetTimer(time);
    beep({ repetitions: 1, repetitionInterval: 150, pitch: Pitch.high });
  }

  return (
    <Container>
      <ButtonContainer>
        <Button text="15s" large onClick={() => handleButtonClick({ time: 15 })} />
        <Button text="20s" large onClick={() => handleButtonClick({ time: 20 })} />
        <Button text="30s" large onClick={() => handleButtonClick({ time: 30 })} />
        <Button text="60s" large onClick={() => handleButtonClick({ time: 60 })} />
      </ButtonContainer>
      {isCounterVisible ? (
        <Counter
          time={time}
          onClick={handleCounterClick}
          left={timeLeft}
          running={isCounting}
        />
      ) : null}
    </Container>
  );
}

export default Countdown;
