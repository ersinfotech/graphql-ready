

const graphql = require('graphql')

exports.graphql = graphql

const {
  makeExecutableSchema,
} = require('graphql-tools')

const GraphQLJSON = require('graphql-type-json')

const resolveFunctions = {
    JSON: GraphQLJSON,
}

const buildSchema = (schemaString) => {
  return makeExecutableSchema({ typeDefs: schemaString, resolvers: resolveFunctions })
}

exports.buildSchema = buildSchema

const ghttp = require('express-graphql')

const graphiql = ({
    api,
    schema,
}) => ghttp((req, res) => {
  const startTime = Date.now()

  return {
    schema: buildSchema(schema),
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
