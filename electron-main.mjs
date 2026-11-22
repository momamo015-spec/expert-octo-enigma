import { app, BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import process from "node:process";

let serverProcess;
let window;
const port = Number(process.env.PORT || 3000);
const address = `http://localhost:${port}`;

function startLocalServer() {
  serverProcess = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { await fetch(address); return; } catch { await new Promise((resolve) => setTimeout(resolve, 250)); }
  }
  throw new Error("لم يبدأ خادم NOVA المحلي");
}

async function createWindow() {
  startLocalServer();
  await waitForServer();
  window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 650,
    title: "NOVA Search",
    backgroundColor: "#f7f9fc",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  await window.loadURL(address);
}

app.whenReady().then(createWindow).catch((error) => { console.error(error); app.quit(); });
app.on("window-all-closed", () => { if (serverProcess) serverProcess.kill(); if (process.platform !== "darwin") app.quit(); });
app.on("before-quit", () => { if (serverProcess) serverProcess.kill(); });
