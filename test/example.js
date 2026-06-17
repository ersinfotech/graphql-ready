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
  error() {
    throw new Error('error happend')
  },
  echo({ message }) {
    console.log({ message })
    return message
  },
}

const resolver = {
  Query: {
    groups() {
      return { count: 2, data: [{ userId: 'userId' }] }
    },
  },
  Group: {
    userName(group) {
      return `${group.userId}-userName`
    },
  },
}

const { graphiql } = require('..')

const express = require('express')

const onfinish = async (item1, item2) => {
  console.log({ item1, item2 })
}

express()
  .use(express.json())
  .use(graphiql({ schema, api, resolver, onfinish }))
  .listen(process.env.PORT || 3000)
