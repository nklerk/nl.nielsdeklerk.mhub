"use strict";

const Homey = require("homey");

class MyApp extends Homey.App {
  onInit() {
    this.log("HD Anywhere. MHUB is running...");
  }
}

module.exports = MyApp;
