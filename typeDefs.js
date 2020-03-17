let { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime

  type Query {
    hundred: Int
  }
`;
