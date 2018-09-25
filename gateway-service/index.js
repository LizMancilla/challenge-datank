const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./graphql/schema/Schema')
const app = express()


app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

// run server on port 5000
app.listen('5000', _ => console.log('Server is listening on port 5000…'))