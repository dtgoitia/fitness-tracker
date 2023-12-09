import { getIntensityLevelShorthand } from "../../lib/domain/activities";
import { Intensity } from "../../lib/domain/model";
import { Icon, IconSize } from "@blueprintjs/core";
import styled from "styled-components";

interface Props {
  selectedIntensity: Intensity;
  onSelect: (intensity: Intensity) => void;
}
function IntensitySelector({ selectedIntensity, onSelect }: Props) {
  const intensityButtons = Object.keys(Intensity).map((key) => {
    const buttonIntensity = key as Intensity;
    const classNameIfSelected =
      buttonIntensity === selectedIntensity ? "bp4-intent-success" : "";

    return (
      <button
        key={`ribbon-intensity-button-${key}`}
        type="button"
        className={`bp4-button bp4 ${classNameIfSelected}`}
        onClick={() => onSelect(buttonIntensity)}
      >
        {getIntensityLevelShorthand(buttonIntensity)}
      </button>
    );
  });

  const icon = (
    <IconContainer key={`ribbon-intensity-icon`}>
      <Icon icon="flame" size={IconSize.LARGE} />
    </IconContainer>
  );

  return (
    <Container>
      <ButtonRibbon className="bp4-button-group">
        {[icon, ...intensityButtons]}
      </ButtonRibbon>
    </Container>
  );
}

export default IntensitySelector;

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
