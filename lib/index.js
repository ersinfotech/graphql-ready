

const graphql = require('graphql')

exports.graphql = graphql

const {
  makeExecutableSchema,
} = require('graphql-tools')

const GraphQLJSON = require('graphql-type-json')

const resolveFunctions = {
    JSON: GraphQLJSON,
}

const buildSchema = (typeDefs, resolvers) => {
    return makeExecutableSchema({
        typeDefs,
        resolvers: {
            ...resolveFunctions,
            ...resolvers,
        },
    })
}

exports.buildSchema = buildSchema

const ghttp = require('express-graphql')

const graphiql = ({
    api,
    schema,
    resolver,
}) => ghttp((req, res) => {
  const startTime = Date.now()

  return {
    schema: buildSchema(schema, resolver),
    rootValue: api,
    graphiql: true,
    formatError: error => ({
      message: error.message,
      stack: error.stack
    }),
    extensions: () => ({
      took: Date.now() - startTime,
    }),
  }
})

exports.graphiql = graphiql
