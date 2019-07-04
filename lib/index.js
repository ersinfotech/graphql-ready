

const graphql = require('graphql')

exports.graphql = graphql

const {
  makeExecutableSchema,
} = require('graphql-tools')

const {
    GraphQLJSONObject,
    GraphQLJSON,
} = require('graphql-type-json')

const {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime
} = require('graphql-iso-date')

const resolveFunctions = {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
    Date: GraphQLDate,
    Time: GraphQLTime,
    DateTime: GraphQLDateTime,
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

const getOperationUrl = (document) => {

    return document.definitions
        .filter(definition => definition.kind === 'OperationDefinition')
        .map(definition => {
            const selectionNames = definition.selectionSet.selections.map(selection => selection.name.value).sort().join(',')
            return `/${definition.operation}/${selectionNames}`
        }).join(';')
}

const scalarify = (schema) => `
scalar JSON
scalar JSONObject
scalar Date
scalar Time
scalar DateTime
${schema}
`
exports.scalarify = scalarify

const graphiql = ({
    api,
    schema,
    resolver,
}) => {

    schema = scalarify(schema)

    schema = buildSchema(schema, resolver)

    return ghttp(async (req, res) => {
        const startTime = Date.now()

        const rootValue = typeof api === 'function' ? await api(req) : api

        return {
            schema,
            rootValue,
            graphiql: true,
            customFormatErrorFn: error => ({
                message: error.message,
                stack: error.stack,
            }),
            extensions: ({
                document,
                result,
            }) => {
                const operationUrl = getOperationUrl(document)
                req.graphqlUrl += operationUrl

                if (Array.isArray(result.errors) && result.errors.length > 0) {
                    res.status(400)
                }
                return {
                    took: Date.now() - startTime,
                }
            },
        }
    })
}

exports.graphiql = graphiql
