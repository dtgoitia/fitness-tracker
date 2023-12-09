import styled from "styled-components";

function refreshPage() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload
  // `.reload(true)` is supported in Firefox and Chrome, but it's not standard
  // @ts-ignore
  window.location.reload(true);
}

const Container = styled.div`
  padding: 0.5rem 0;
`;

function ReloadPage() {
  return (
    <Container>
      <button type="button" className="bp4-button" onClick={refreshPage}>
        Reload app
      </button>
    </Container>
  );
}

export default ReloadPage;
