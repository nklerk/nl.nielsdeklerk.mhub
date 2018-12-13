"use strict";

const Homey = require("homey");
/* global Homey, module */

const hdamhub = require("hdamhub");

function fcaInputOutput(deviceId, args) {
  console.log(`fcaInputOutput(${deviceId}, ${args.input.id} -> ${args.output.id} )`);
  let api = new hdamhub.api(deviceId);
  api.switchOutputInput(args.output.id, args.input.id);
}

function fcaPower(deviceId, value) {
  console.log(`fcaPower(${deviceId}, ${value})`);
  let api = new hdamhub.api(deviceId);
  if (value === true) api.powerOn();
  if (value === false) api.powerOff();
}

function fcaUControl(deviceId, args) {
  console.log(`fcaUControl(${deviceId}, ${args}`);
  console.log(args);
}

function fcaPronto(deviceId, args) {
  console.log(`fcaPronto(${deviceId}, ${args}`);
  console.log(args);
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
  //console.log(`getIo(,${deviceId}, ${inputOrOutputOptional});`);
  let api = new hdamhub.api(deviceId);
  //console.log(`> await api.getSystemInfo();`);
  let mhubsysinfo = await api.getSystemInfo();
  // console.log(`< await api.getSystemInfo();`);
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
  for (let i in mhubsysinfo.io_data.input_audio) {
    for (let input of mhubsysinfo.io_data.input_audio[i].labels) {
      inputs.push({ name: `Input: ${input.id}`, description: input.label, id: `${input.id}` });
    }
  }
  for (let i in mhubsysinfo.io_data.input_video) {
    for (let input of mhubsysinfo.io_data.input_video[i].labels) {
      inputs.push({ name: `Input: ${input.id}`, description: input.label, id: `${input.id}` });
    }
  }

  for (let i in mhubsysinfo.io_data.output_audio) {
    for (let output of mhubsysinfo.io_data.output_audio[i].labels) {
      outputs.push({ name: `Output: ${output.id}`, description: output.label, id: `${output.id}` });
    }
  }
  for (let i in mhubsysinfo.io_data.output_video) {
    for (let output of mhubsysinfo.io_data.output_video[i].labels) {
      outputs.push({ name: `Output: ${output.id}`, description: output.label, id: `${output.id}` });
    }
  }
  //console.log(`inputs, outputs`);
  // console.log(inputs);
  // console.log(outputs);
  return [inputs, outputs];
}

async function getuControlIo(deviceId, inputOrOutputOptional) {
  let api = new hdamhub.api(deviceId);
  console.log(`> api.getUControlStatus();`);
  let uControlStatus = await api.getUControlStatus();
  console.log(`< api.getUControlStatus();`);
  let uControlPorts = [];
  let io = 1;
  if (uControlStatus && uControlStatus.input && typeof uControlStatus.input == "object") {
    for (let i of uControlStatus.input) {
      if ((typeof inputOrOutputOptional === "undefined" || inputOrOutputOptional === "input") && i.irpack) {
        //console.log(`> io${i.id}`);
        let x = await api.getUControlState(io);
        //console.log(`< io${i.id}`);
        uControlPorts.push({ name: `Input: ${i.id}`, description: x.name, id: io });
      }
      io = io + 1;
    }
  }
  if (uControlStatus && uControlStatus.output && typeof uControlStatus.output == "object") {
    for (let i of uControlStatus.output) {
      if ((typeof inputOrOutputOptional === "undefined" || inputOrOutputOptional === "output") && i.irpack) {
        //console.log(`> io${i.id}`);
        let x = await api.getUControlState(io);
        //console.log(`< io${i.id}`);
        uControlPorts.push({ name: `Output: ${i.id}`, description: x.name, id: io });
      }
      io = io + 1;
    }
  }
  //console.log(`< return`);
  return uControlPorts;
}

class hdaMhubDriver extends Homey.Driver {
  onInit() {
    console.log(`Driver init()..`);
  }
  getIo(deviceId, inputOrOutputOptional) {
    return getIo(deviceId, inputOrOutputOptional);
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
  fcaUControl(deviceId, value) {
    fcaUControl(deviceId, value);
  }
  fcaPronto(deviceId) {
    fcaPronto(deviceId);
  }
}
module.exports = hdaMhubDriver;
