'use strict'
class CPlugin {
  _sendMessage (data) {
    window.parent.postMessage(data, '*')
  }
  saveData(data) {
    console.log("Recieved data", data);
    if (!data.documentID || !(data.major.toString()) || !(data.minor.toString())) {
      throw new Error("Invalid saving diagram data");
    }
    this._sendMessage({
      action: "save",
      data
    })
  }
  cancel() {
    console.log("Cancel called");
    this._sendMessage({
      action: "cancel"
    })
  }
  getData() {
    return window.name ? JSON.parse(window.name) : {}
  }
}

window.CP = new CPlugin()
