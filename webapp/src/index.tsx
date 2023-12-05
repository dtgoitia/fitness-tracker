import { AppUI } from "./AppUI";
import "./blueprint.css";
import { BASE_URL } from "./constants";
import "./index.css";
import { App } from "./lib/app/app";
import { setUpApp } from "./lib/app/setUp";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { GlobalStyle } from "./style/globalStyle";
import { activeTheme } from "./style/globalStyle";
import React, { useContext, createContext } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

const app = setUpApp();
const AppContext = createContext(app);

export function useApp(): App {
  return useContext(AppContext);
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={BASE_URL}>
      <GlobalStyle theme={activeTheme} />
      <AppUI />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

const isLocalhost = window.location.hostname === "localhost";

const updateSW = registerSW({
  onNeedRefresh: function () {
    if (
      isLocalhost ||
      confirm("There is an newer version of this app. Do you want to update?")
    ) {
      updateSW(true);
    }
  },
});
