

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
}) => ghttp(async (req, res) => {
    const startTime = Date.now()

    const rootValue = typeof api === 'function' ? await api(req) : api

    return {
        schema: buildSchema(schema, resolver),
        rootValue,
        graphiql: true,
        formatError: error => ({
            message: error.message,
            stack: error.stack
        }),
        extensions: ({
            result,
        }) => {
            if (Array.isArray(result.errors) && result.errors.length > 0) {
                res.status(400)
            }
            return {
                took: Date.now() - startTime,
            }
        },
    }
})

exports.graphiql = graphiql
