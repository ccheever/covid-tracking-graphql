let fetch = require('cross-fetch');
let luxon = require('luxon');
let promiseProps = require('promise-props');

let Data = null;

async function getJSONAsync(url) {
  let response = await fetch(url);
  return await response.json();
}

function rawDayToJSDate(rawDay) {
  // The `rawDay` value is typically an int not a string, of a form like 20200317
  try {
    return luxon.DateTime.fromFormat(rawDay + '', 'yyyyMMdd').toJSDate();
  } catch (e) {
    console.error(`Failed to parse raw day '${rawDay}'`);
    return null;
  }
}

function rawToUSDailyDataPoint(raw) {
  return {
    date: rawDayToJSDate(raw.date),
    statesReporting: raw.states,
    positive: raw.positive,
    negative: raw.negative,
    positivePlusNegative: raw.posNeg,
    pending: raw.pending,
    deaths: raw.death,
    total: raw.total,
  };
}

async function refreshAsync() {
  let _updated = new Date();
  let newData = await promiseProps({
    usDaily: usDailyDataAsync(),
  });
  newData._updated = _updated;
  Data = newData;
  return {
    success: true,
    updatedDateTime: _updated,
  }
}

async function usDailyDataAsync() {
  let raw = await getJSONAsync('https://covid.cape.io/us/daily');
  let usDailyData = [];
  for (day of raw) {
    usDailyData.push(rawToUSDailyDataPoint(day));
  }
  return usDailyData;
}

function data() {
  if (Data === null) {
    throw new Error("Data not ready yet; this shouldn't happen");
  }
  return Data;
}

module.exports = data;

Object.assign(data, {
  refreshAsync,
  rawDayToJSDate,
});
