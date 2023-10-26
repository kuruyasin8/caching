import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";
import { Workbox } from "workbox-window";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// handle service worker updates
if ("serviceWorker" in navigator) {
  const wb = new Workbox("/service-worker.js");
  let registration;

  const showSkipWaitingPrompt = async (event) => {
    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
    wb.addEventListener("controlling", () => {
      // At this point, reloading will ensure that the current
      // tab is loaded under the control of the new service worker.
      // Depending on your web app, you may want to auto-save or
      // persist transient state before triggering the reload.
      window.location.reload();
    });

    // When `event.wasWaitingBeforeRegister` is true, a previously
    // updated service worker is still waiting.
    // You may want to customize the UI prompt accordingly.

    // This code assumes your app has a promptForUpdate() method,
    // which returns true if the user wants to update.
    // Implementing this is app-specific; some examples are:
    // https://open-ui.org/components/alert.research or
    // https://open-ui.org/components/toast.research
    const updateAccepted = await promptForUpdate();

    if (updateAccepted) {
      wb.messageSkipWaiting();
    }
  };

  // Add an event listener to detect when the registered
  // service worker has installed but is waiting to activate.
  wb.addEventListener("waiting", (event) => {
    showSkipWaitingPrompt(event);
  });

  wb.register();
}

function promptForUpdate() {
  return new Promise((resolve) => {
    // This assumes you have a way to prompt the user.
    // For example, by using https://open-ui.org/components/dialog.research
    // or https://open-ui.org/components/alert.research
    const dialog = document.createElement("dialog");
    dialog.innerHTML = `
      <form method="dialog">
        <p>A new version of this site is available. Reload to update?</p>
        <menu>
          <button value="cancel">Cancel</button>
          <button value="reload">Reload</button>
        </menu>
      </form>
    `;
    dialog.addEventListener("click", (event) => {
      if (event.target.nodeName.toLowerCase() !== "button") {
        return;
      }
      dialog.close(event.target.value);
    });
    document.body.appendChild(dialog);
    dialog.showModal();
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "reload");
      document.body.removeChild(dialog);
    });
  });
}
