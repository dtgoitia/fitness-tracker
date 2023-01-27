import CenteredPage from "../components/CenteredPage";
import styled from "styled-components";

const CenteredItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 3.5rem;
  height: 100vh;
`;

const StatusCode = styled.span`
  font-size: 8rem;
  font-weight: 100;
  color: #aaa;
`;

const Details = styled.p`
  margin-top: 1.5rem;
`;

export default function PageNotFound() {
  return (
    <CenteredPage>
      <CenteredItem>
        <h1>Ooops...!</h1>
        <StatusCode>404</StatusCode>
        <Details>Page not found</Details>
      </CenteredItem>
    </CenteredPage>
  );
}
