let { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime
  scalar Date

  type USDailyDataPoint {
    date: Date
    statesReporting: Int
    positive: Int
    negative: Int
    positivePlusNegative: Int
    pending: Int
    deaths: Int
    total: Int
  }

  type Query {
    hundred: Int
    usDaily_forAllDays: [USDailyDataPoint]
    usDaily_forDay(day: Date): USDailyDataPoint
    usDaily_forDayRange(startDay: Date, endDay: Date): [USDailyDataPoint]
    
    
  }


`;
