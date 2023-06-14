import Paths from "../routes";
import { Button } from "@blueprintjs/core";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface NavBarButtonProps {
  text: string;
  path: string;
}
function NavBarButton({ text, path }: NavBarButtonProps) {
  return (
    <Link to={path}>
      <Button text={text} large={true} />
    </Link>
  );
}

const Container = styled.div`
  margin-bottom: 1rem;
`;

function NavBar() {
  return (
    <Container>
      <NavBarButton text="Record" path={Paths.root} />
      <NavBarButton text="History" path={Paths.history} />
      <NavBarButton text="Activities" path={Paths.activities} />
      <NavBarButton text="Trainings" path={Paths.trainings} />
      <NavBarButton text="Shortcuts" path={Paths.shortcuts} />
      <NavBarButton text="Stats" path={Paths.stats} />
    </Container>
  );
}

export default NavBar;
