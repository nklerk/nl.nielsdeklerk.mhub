"use strict";

const Homey = require("homey");
/* global Homey, module */

class mhubDevice extends Homey.Device {
  onInit() {
    this._data = this.getData();
    this._id = this._data.id;
    //this._store = this.getStore();
    //this._token = this._store.token;
    //this._api = null;
    //this._info = null;
    this._added = false;
    this._driver = this.getDriver();
    //this._name = this.getName();
    //this._class = this.getClass();

    this.log("Loaded Device_id", this._id);

    this.registerCapabilityListener("onoff", (value, opts) => {
      this._driver.fcaPower(this._id, value);
      return Promise.resolve();
    });

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

    new Homey.FlowCardAction("fcaUControl").register().registerRunListener(args => {
      this._driver.fcaUControl(args.device._id, args);
      return true;
    });

    new Homey.FlowCardAction("fcaPronto").register().registerRunListener(args => {
      this._driver.fcaPronto(args.device._id, args);
      return true;
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
