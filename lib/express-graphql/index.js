
const {
    Source,
    GraphQLError,
    parse,
    validate,
    execute,
    formatError,
    validateSchema,
    getOperationAST,
    specifiedRules,
} = require('graphql')

const respondWithGraphiQL = (res) => {

const html = `
<html>
  <head>
    <title>Simple GraphiQL Example</title>
    <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
  </head>
  <body style="margin: 0;">
    <div id="graphiql" style="height: 100vh;"></div>

    <script
      crossorigin
      src="https://unpkg.com/react/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/graphiql/graphiql.min.js"
    ></script>

    <script>
      let urlobj = new URL(window.location.href)
      urlobj.searchParams.set('debug', true)
      const url = urlobj.toString()
      const fetcher = GraphiQL.createFetcher({ url });

      ReactDOM.render(
        React.createElement(GraphiQL, { fetcher: fetcher }),
        document.getElementById('graphiql'),
      );
    </script>
  </body>
</html>
`
    res.send(html)
}

const getParam = (req, key) => {
    return (req.query && req.query[key]) || (req.body && req.body[key])
}

const getGraphQLParams = async (req) => {
    return {
        query: getParam(req, 'query'),
        variables: getParam(req, 'variables'),
        operationName: getParam(req, 'operationName'),
    }
}

const graphqlHTTP = (getOptions) => async (req, res) => {

    let result

    try {

    const params = await getGraphQLParams(req);

    const {
        schema,
        rootValue,
        graphiql,
        context = req,
        extensions: extensionsFn,
    } = await getOptions(req, res, params)

    const showGraphiQL = graphiql && req.method === 'GET'

    if (showGraphiQL) {
        return respondWithGraphiQL(res)
    }

    const { query, variables, operationName } = params

    if (!query) {
        throw new Error('Must provide query string.')
    }

    const schemaValidationErrors = validateSchema(schema)
    if (schemaValidationErrors.length > 0) {
        throw new Error('GraphQL schema validation error.')
    }

    const documentAST = parse(new Source(query, 'GraphQL request'))

    const validationErrors = validate(schema, documentAST)
    if (validationErrors.length > 0) {
        throw new Error('GraphQL validation error.')
    }

    result = await execute({
        schema,
        document: documentAST,
        rootValue,
        contextValue: context,
        variableValues: variables,
        operationName,
    })

    if (Array.isArray(result.errors) && result.errors.length > 0) {
        throw result.errors[0]
    }

    if (extensionsFn) {
        const extensions = await extensionsFn({
            document: documentAST,
            variables,
            operationName,
            result,
            context,
        })
        if (extensions) {
            result = { ...result, extensions }
        }
    }

    } catch (e) {

        const debug = getParam(req, 'debug')

        const error = debug ? {
            message: e.message,
            stack: e.stack,
        } : e.message

        result = {
            data: null,
            errors: [error],
        }
        res.status(500)
    }

    res.send(result)
}

exports.graphqlHTTP = graphqlHTTP
