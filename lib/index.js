

const {
  makeExecutableSchema,
} = require('@graphql-tools/schema')

const {
    GraphQLJSONObject,
    GraphQLJSON,
} = require('./graphql-type-json')

const resolveFunctions = {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
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

const { graphqlHTTP } = require('./express-graphql')

const getOperationUrl = (document, operationName) => {
    if (!document) return

    const definitions = document.definitions.filter(definition => definition.kind === 'OperationDefinition')

    if (definitions.length === 0) return

    const definition = definitions.find(d => d.name && d.name.value === operationName) || definitions[0]

    const selectionNames = definition.selectionSet.selections.map(selection => selection.name.value).sort().join(',')

    return `/${definition.operation}/${selectionNames}`
}

exports.getOperationUrl = getOperationUrl

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
    graphi,
}) => {

    schema = scalarify(schema)

    schema = buildSchema(schema, resolver)

    return graphqlHTTP(async (req, res) => {
        const startTime = Date.now()

        const rootValue = typeof api === 'function' ? await api(req) : api
        const graphiql = typeof graphi === 'function' ? await graphi(req) : true

        return {
            schema,
            rootValue,
            graphiql,
            extensions: ({
                document,
                operationName,
                result,
            }) => {
                const operationUrl = getOperationUrl(document, operationName)
                req.graphqlUrl = operationUrl

                return {
                    took: Date.now() - startTime,
                }
            },
        }
    })
}

exports.graphiql = graphiql
