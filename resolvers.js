let data = require('./data');
let stateNames = require('./stateNames');

function forceJSDate(day) {
  if (typeof day === 'string' || typeof day === 'number') {
    return data.rawDayToJSDate(day);
  } else {
    return day;
  }
}

module.exports = {
  Query: {
    _updated: (_, {}, context, info) => {
      return data()._updated;
    },

    usDailyData_forAllDays: async (_, {}, context, info) => {
      return data().usDaily;
    },

    usDailyData_forDay: async (_, { day }, context, info) => {
      let usDaily = data().usDaily;
      let day_ = forceJSDate(day);
      for (let dayData of usDaily) {
        if (+dayData.date === +day_) {
          return dayData;
        }
      }
      return null;
    },

    usDailyData_forDayRange: async (_, { startDay, endDay }, context, info) => {
      let usDaily = data().usDaily;
      let startDayMoment = +forceJSDate(startDay);
      let endDayMoment = +forceJSDate(endDay);
      let result = [];
      for (let dayData of usDaily) {
        let dayMoment = +dayData.date;
        if (dayMoment >= startDayMoment && dayMoment <= endDayMoment) {
          result.push(dayData);
        }
      }
      return result;
    },

    state: async (_, { state }, context, info) => {
      let stateInfo = data().stateInfo;
      for (let abbrev in stateInfo) {
        let stateData = stateInfo[abbrev];
        if (stateData.abbrev === state || stateData.name === state) {
          return stateData;
        }
      }
    },

    allStates: async (_, {}, context, info) => {
      let stateInfo = data().stateInfo;
      let results = [];
      for (let abbrev in stateInfo) {
        let stateData = stateInfo[abbrev];
        results.push(stateData);
      }
      return results;
    },

    usCumulativeTotal: async (_, {}, context, info) => {
      return data().usTotal;
    },

    stateCumulativeData_forAllStates: async (_, {}, context, info) => {
      let results = [];
      let statesData = data().statesData;
      for (let abbrev in statesData) {
        results.push(statesData[abbrev]);
      }
      return results;
    },

    stateCumulativeData_forState: async (_, { state }, context, info) => {
      let statesData = data().statesData;
      for (let abbrev in statesData) {
        let stateData = statesData[abbrev];
        if (stateNames.matches(state, abbrev)) {
          return stateData;
        }
      }
      return null;
    },

    stateCumulativeData_forStates: async (_, { statesList }, context, info) => {
      let results = [];
      let statesData = data().statesData;
      for (let abbrev in statesData) {
        let stateData = statesData[abbrev];
        if (stateNames.matches(state, stateData.__stateAbbrev)) {
          results.push(stateData);
        }
      }
      return results;
    },
  },

  DataPoint: {
    __resolveType: (obj, context, info) => {
      if (obj.date) {
        return 'USDailyDataPoint';
      } else if (obj.state) {
        return 'StateCumulativeDataPoint';
      } else {
        return 'USTotalDataPoint';
      }
    },
  },

  State: {
    cumulativeData: async (_, {}, context, info) => {
      return data().statesData[_.abbrev];
    },
  },

  StateCumulativeDataPoint: {
    state: (_, {}, context, info) => {
      return data().stateInfo[_.__stateAbbrev];
    },
  },
};
