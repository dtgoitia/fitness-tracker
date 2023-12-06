import { AppUI } from "./AppUI";
import "./blueprint.css";
import { BASE_URL } from "./constants";
import "./index.css";
import { App } from "./lib/app/app";
import { setUpApp } from "./lib/app/setUp";
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
