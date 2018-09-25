require('es6-promise').polyfill();
require('universal-fetch');
const graphql = require('graphql')

// define the Todo type for graphql
const PollType = new graphql.GraphQLObjectType({
  name: 'Poll',
  description: 'Polls',
  fields: {
    id: {
      type: graphql.GraphQLInt
    },
    name: {
      type: graphql.GraphQLString
    },
    options: {
      type: graphql.GraphQLString
    }
  }
})

const PollStatType = new graphql.GraphQLObjectType({
  name: 'PollStat',
  description: 'PollsStat',
  fields: {
    id: {
      type: graphql.GraphQLInt
    },
    name: {
      type: graphql.GraphQLString
    },
    options: {
      type: graphql.GraphQLString
    },
    votes: {
      type: graphql.GraphQLString
    }
  }
})

const getPoll = (id) => {
  const url = 'http://127.0.0.1:3300/v1/poll/verPoll'
  return fetch(url)
    .then(response => {
      return response.json()
    })
    .then(json => {
      return idPoll(id, json)
    })
    .catch(err => {
      console.trace(err)
    })
}

const statPoll = (id) => {
  const url = 'http://127.0.0.1:4400/v1/stats/statPoll'
  return fetch(url)
    .then(response => {
      return response.json()
    })
    .then(json => {
      return idPoll(id, json)
    })
    .catch(err => {
      console.trace(err)
    })
}

const resultByHour = (id) => {
  const url = 'http://127.0.0.1:4400/v1/stats/statPoll'
  return fetch(url)
    .then(response => {
      return response.json()
    })
    .then(json => {
      return idPoll(id, json)
    })
    .catch(err => {
      console.trace(err)
    })
}

const idPoll = (id, json) => {
  if (id == 0)
    return json;
  return [json[id - 1]];
}

const addPoll = (name, options) => {
  const url = 'http://127.0.0.1:3300/v1/poll/addPoll?name=' + name + '&opts=' + options
  return fetch(url)
    .then(response => {
      return getPoll(0)
    })
    .catch(err => {
      console.trace(err)
    })
}

const vote = (id, option) => {
  const url = 'http://127.0.0.1:4400/v1/stats/vote?id=' + id + '&opt=' + option
  return fetch(url)
    .then(response => {
      return response.json()
    })
    .catch(err => {
      console.trace(err)
    })
}

const pollQuery = {

}

// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'QueryPoll',
  fields: {
    seePoll: {
      type: new graphql.GraphQLList(PollType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, { id }) => {
        if (!id)
          id = 0;
        return getPoll(id);
      }
    },
    statPoll: {
      type: new graphql.GraphQLList(PollStatType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, { id }) => {
        if (!id)
          id = 0;
        return statPoll(id);
      }
    },
    resultByHour: {
      type: new graphql.GraphQLList(PollStatType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, { id }) => {
        return resultByHour(id);
      }
    }
  }
})

// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'MutationPoll',
  fields: {
    createPoll: {
      type: new graphql.GraphQLList(PollType),
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        options: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, { name, options }) => {
        return addPoll(name, options);
      }
    },
    votePoll: {
      type: new graphql.GraphQLList(PollStatType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        },
        option: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, { id, option }) => {
        return vote(id, option);
      }
    }
  }
})


// creates and exports the GraphQL Schema
module.exports = new graphql.GraphQLSchema({
  query, mutation
})
