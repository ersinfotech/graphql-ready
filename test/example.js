
const schema = `
scalar JSON

type Group {
    userId: String
    userName: String
}

type Groups {
    count: Int
    data: [Group]
}

type Query {
    echo(message: JSON!): JSON
    groups: Groups
}
`

const api = {
    echo ({message}) {
        return message
    }
}

const resolver = {
    Query: {
        groups () {
            return {count: 2, data: [{userId: 'userId'}]}
        },
    },
    Group: {
        userName (group) {
            return `${group.userId}-userName`
        }
    },
}

const {
    graphiql,
} = require('..')

const express = require('express')

express()
.use(graphiql({schema, api, resolver}))
.listen(process.env.PORT || 3000)
