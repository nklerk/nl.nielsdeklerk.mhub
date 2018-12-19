"use strict";

const Homey = require("homey");
/* global Homey, module */

const hdamhub = require("hdamhub");

function fcaInputOutput(deviceId, args) {
  let api = new hdamhub.api(deviceId);
  api.switchOutputInput(args.output.id, args.input.id);
}

function fcaPower(deviceId, value) {
  let api = new hdamhub.api(deviceId);
  if (value === true) api.powerOn();
  if (value === false) api.powerOff();
}

function fcaUControl(deviceId, args) {
  let api = new hdamhub.api(deviceId);
  api.executeUcontrolCommand(args.io.id, args.command.id);
}

function fcaPronto(deviceId, args) {
  let api = new hdamhub.api(deviceId);
  api.executeUcontrolCommand(args.io.id, args.prontohex);
}

function homeyFormatedDiscovery(callback) {
  hdamhub
    .discover()
    .then(devices => {
      let responce = devices.map(deviceEntry => {
        console.log(deviceEntry.host);
        return {
          name: deviceEntry.host,
          data: { id: deviceEntry.host }
        };
      });
      callback(null, responce);
    })
    .catch(e => {
      console.log(e);
      callback(null, []);
    });
}

async function getIo(deviceId, inputOrOutputOptional) {
  let api = new hdamhub.api(deviceId);
  let mhubsysinfo = await api.getSystemInfo();
  let [input, output] = mhubGetInputsOutputs(mhubsysinfo);
  if (typeof inputOrOutputOptional == "undefined") {
    return input.concat(output);
  } else if (inputOrOutputOptional == "input") {
    return input;
  } else if (inputOrOutputOptional == "output") {
    return output;
  } else {
    console.log(`ERROR: Did not expect inputOrOutputOptional to be ${inputOrOutputOptional}.`);
    return [];
  }
}

function mhubGetInputsOutputs(mhubsysinfo) {
  let inputs = [];
  let outputs = [];
  let io = 1;
  for (let i in mhubsysinfo.io_data.input_audio) {
    for (let input of mhubsysinfo.io_data.input_audio[i].labels) {
      inputs.push({ name: `Input: ${input.id}`, description: input.label, id: `${input.id}`, io });
      io = io + 1;
    }
  }
  for (let i in mhubsysinfo.io_data.input_video) {
    for (let input of mhubsysinfo.io_data.input_video[i].labels) {
      inputs.push({ name: `Input: ${input.id}`, description: input.label, id: `${input.id}`, io });
      io = io + 1;
    }
  }

  for (let i in mhubsysinfo.io_data.output_audio) {
    for (let output of mhubsysinfo.io_data.output_audio[i].labels) {
      outputs.push({ name: `Output: ${output.id}`, description: output.label, id: `${output.id}`, io });
      io = io + 1;
    }
  }
  for (let i in mhubsysinfo.io_data.output_video) {
    for (let output of mhubsysinfo.io_data.output_video[i].labels) {
      outputs.push({ name: `Output: ${output.id}`, description: output.label, id: `${output.id}`, io });
      io = io + 1;
    }
  }
  return [inputs, outputs];
}

async function getuControlIo(deviceId) {
  let api = new hdamhub.api(deviceId);
  let uControlStatus = await api.getUControlStatus();
  let uControlPorts = [];
  let io = 1;
  if (uControlStatus && uControlStatus.input && typeof uControlStatus.input == "object") {
    for (let ucontrol of uControlStatus.input) {
      if (ucontrol.irpack) {
        let x = await api.getUControlState(io);
        uControlPorts.push({ name: `Input: ${ucontrol.id}`, description: x.name, id: io });
      }
      io = io + 1;
    }
  }
  if (uControlStatus && uControlStatus.output && typeof uControlStatus.output == "object") {
    for (let ucontrol of uControlStatus.output) {
      if (ucontrol.irpack) {
        let x = await api.getUControlState(io);
        uControlPorts.push({ name: `Output: ${ucontrol.id}`, description: x.name, id: io });
      }
      io = io + 1;
    }
  }
  return uControlPorts;
}

async function getCommands(deviceId, args) {
  if (typeof args.io.id !== "undefined") {
    let commands = [];
    let api = new hdamhub.api(deviceId);
    let x = await api.getUControlState(args.io.id);
    for (let command of x.irpack) {
      commands.push({ name: command.label, description: "IR Command", id: command.id });
    }
    return commands;
  } else {
    return [];
  }
}

class hdaMhubDriver extends Homey.Driver {
  onInit() {
    console.log(`Driver init()..`);
  }
  getIo(deviceId, inputOrOutputOptional) {
    return getIo(deviceId, inputOrOutputOptional);
  }
  getuControlIo(deviceId) {
    return getuControlIo(deviceId);
  }
  getCommands(deviceId, args) {
    return getCommands(deviceId, args);
  }
  onPairListDevices(data, callback) {
    homeyFormatedDiscovery(callback);
  }
  fcaInputOutput(deviceId, value) {
    fcaInputOutput(deviceId, value);
  }
  fcaPower(deviceId, value) {
    fcaPower(deviceId, value);
  }
  fcaUControl(deviceId, args) {
    fcaUControl(deviceId, args);
  }
  fcaPronto(deviceId, args) {
    fcaPronto(deviceId, args);
  }
}
module.exports = hdaMhubDriver;
