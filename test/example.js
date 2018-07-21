
const schema = `
scalar JSON

type Query {
    echo(message: JSON!): JSON
}
`

const api = {
    echo ({message}) {
        return message
    }
}

const {
    graphiql,
} = require('..')

const express = require('express')

express()
.use(graphiql({schema, api}))
.listen(process.env.PORT || 3000)
