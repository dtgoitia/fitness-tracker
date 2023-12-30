import styled from "styled-components";

interface Props {
  children: JSX.Element;
}

export function ScreenBottomNavBar({ children }: Props) {
  return <Container>{children}</Container>;
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: flex-start;

  /* UNCOMMENT LINE BELOW TO DEBUG */
  /* border: 1px solid yellow; */
`;
