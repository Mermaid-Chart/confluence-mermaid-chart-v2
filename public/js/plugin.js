"use strict";
class CPlugin {
  _sendMessage(data) {
    window.parent.postMessage(data, "*");
  }
  saveData(data) {
    if (!data.documentID || !data.diagramCode) {
      throw new Error("Invalid saving diagram data");
    }
    this._sendMessage({
      action: "save",
      data,
    });
  }
  cancel() {
    this._sendMessage({
      action: "cancel",
    });
  }
  getData() {
    return window.name ? JSON.parse(window.name) : {};
  }
  invalidateToken() {
    this._sendMessage({
      action: "logout",
    });
  }
}

window.CP = new CPlugin();
