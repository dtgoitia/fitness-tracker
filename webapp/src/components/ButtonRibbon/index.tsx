import styled from "styled-components";

interface ButtonProps {
  key: string; // each Buttom must be unique
  label: string;
  selected: boolean;
  onClick: () => void;
}

interface Props {
  label: string;
  buttons: ButtonProps[];
}

export function ButtonRibbon({ label, buttons }: Props) {
  return (
    <Container className="bp4-button-group .modifier">
      <Label>{label}</Label>
      {buttons.map((button) => (
        <button
          key={button.key}
          type="button"
          className={`bp4 bp4-button ${button.selected ? "bp4-intent-success" : ""}`}
          onClick={button.onClick}
        >
          {button.label}
        </button>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-item: center;
`;

const Label = styled.label`
  margin-right: 0.7rem;
  align-self: center;
`;
