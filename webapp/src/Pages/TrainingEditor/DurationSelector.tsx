import { getDurationLevelShorthand } from "../../domain/activities";
import { Duration } from "../../domain/model";
import { Icon, IconSize } from "@blueprintjs/core";
import styled from "styled-components";

interface Props {
  selectedDuration: Duration;
  onSelect: (duration: Duration) => void;
}
function DurationSelector({ selectedDuration, onSelect }: Props) {
  const durationButtons = Object.keys(Duration).map((key) => {
    const buttonDuration = key as Duration;
    const classNameIfSelected =
      buttonDuration === selectedDuration ? "bp4-intent-success" : "";

    return (
      <button
        key={`ribbon-duration-button-${key}`}
        type="button"
        className={`bp4-button bp4 ${classNameIfSelected}`}
        onClick={() => onSelect(buttonDuration)}
      >
        {getDurationLevelShorthand(buttonDuration)}
      </button>
    );
  });

  const icon = (
    <IconContainer key={`ribbon-duration-icon`}>
      <Icon icon="time" size={IconSize.LARGE} />
    </IconContainer>
  );

  return (
    <Container>
      <ButtonRibbon className="bp4-button-group">
        {[icon, ...durationButtons]}
      </ButtonRibbon>
    </Container>
  );
}

export default DurationSelector;

const ButtonRibbon = styled.div`
  display: flex;
  margin: 0 0.5rem;
`;
const Container = styled.div`
  flex-basis: 4rem;
  flex-shrink: 0;
  align-self: center;
`;

const IconContainer = styled.div`
  margin: 0 0.5rem;
  align-self: center;
  opacity: 0.6;
`;
