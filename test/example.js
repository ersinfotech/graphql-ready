
const schema = `

type Group {
    userId: String
    userName: String
}

type Groups {
    count: Int
    data: [Group]
}

type Query {
    error: JSON
    echo(message: JSON!): JSON
    groups: Groups
}
`

const api = {
    error () {
        throw new Error('error happend')
    },
    echo ({message}) {
        return message
    },
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
const { finished } = require('stream')

const red = (req, res, next) => {
    finished(res, () => {
        console.log(req.graphqlUrl)
    })
    next()
}

express()
.use(red)
.use(graphiql({schema, api, resolver}))
.listen(process.env.PORT || 3000)
