let data = require('./data');

function forceJSDate(day) {
  if (typeof day === 'string' || typeof day === 'number') {
    return data.rawDayToJSDate(day);
  } else {
    return day;
  }
}

module.exports = {
  Query: {
    hundred: async (_, {}, context, info) => {
      return 100;
    },

    usDaily_forAllDays: async (_, {}, context, info) => {
      return data().usDaily;
    },

    usDaily_forDay: async (_, { day }, context, info) => {
      let usDaily = data().usDaily;
      let day_ = forceJSDate(day);
      for (let dayData of usDaily) {
        if (+dayData.date === +day_) {
          return dayData;
        }
      }
      return null;
    },

    usDaily_forDayRange: async (_, { startDay, endDay }, context, info) => {
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
  },
};
