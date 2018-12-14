"use strict";

const Homey = require("homey");

class mhubDevice extends Homey.Device {
  onInit() {
    this._data = this.getData();
    this._id = this._data.id;
    this._added = false;
    this._driver = this.getDriver();

    this.log("Loaded Device_id", this._id);

    //onoff
    this.registerCapabilityListener("onoff", (value, opts) => {
      this._driver.fcaPower(this._id, value);
      return Promise.resolve();
    });

    //fcaInputOutput
    let fcaIo = new Homey.FlowCardAction("fcaInputOutput").register().registerRunListener(args => {
      this._driver.fcaInputOutput(args.device._id, args);
      return true;
    });
    let fcaIoInput = fcaIo.getArgument("input");
    fcaIoInput.registerAutocompleteListener((query, args) => {
      return this._driver.getIo(args.device._id, "input");
    });
    let fcaIoOutput = fcaIo.getArgument("output");
    fcaIoOutput.registerAutocompleteListener((query, args) => {
      return this._driver.getIo(args.device._id, "output");
    });

    //fcaUControl
    let fcaUControl = new Homey.FlowCardAction("fcaUControl").register().registerRunListener(args => {
      this._driver.fcaUControl(args.device._id, args);
      return true;
    });
    let fcaUControlIO = fcaUControl.getArgument("io");
    fcaUControlIO.registerAutocompleteListener((query, args) => {
      return this._driver.getuControlIo(args.device._id);
    });
    let fcaUControlCommand = fcaUControl.getArgument("command");
    fcaUControlCommand.registerAutocompleteListener((query, args) => {
      return this._driver.getCommands(args.device._id, args);
    });

    //fcaPronto
    let fcaUControlHex = new Homey.FlowCardAction("fcaPronto").register().registerRunListener(args => {
      this._driver.fcaPronto(args.device._id, args);
      return true;
    });
    let fcaUControlHexIo = fcaUControlHex.getArgument("io");
    fcaUControlHexIo.registerAutocompleteListener((query, args) => {
      return this._driver.getIo(args.device._id);
    });
  }

  onAdded() {
    this.log("device added");
    this._added = true;
  }

  onDeleted() {
    this.log("device deleted");
    this._added = false;
  }
}

module.exports = mhubDevice;
