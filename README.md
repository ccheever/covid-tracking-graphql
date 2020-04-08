# covid-tracking-graphql

Another GraphQL API for the COVID-19 Tracking Data

### To use in the cloud

https://covid-tracking-graphql-api.onrender.com/


### To get started developing locally

Make sure you have the latest versions of `node` and `yarn` installed.

[Volta](https://volta.sh/) is a good way to do this if you don't have them already.

Then, type this into your terminal.

```shell
git clone https://github.com/ccheever/covid-tracking-graphql.git
cd covid-tracking-graphql
yarn
yarn watch
o
g
```

### Using the GraphQL API


You can go to `/graphql` from the root of what is served, or [visit it in production](https://covid-tracking-graphql-api.onrender.com/) to send GraphQL queries.

An example query you could try is:

gql```
query {
  state(state:"PA") {
    name
    cumulativeData {
      total
      positives
      negatives
    }
    notes
    puiReporting
    pumReporting
  }
}
```
