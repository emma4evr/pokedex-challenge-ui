const { ApolloServer } = require('apollo-server')
const fs = require('fs')

const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const data = fs.readFileSync('./src/pokemon.json')
    const typeData = fs.readFileSync('./src/types.json')
    return { pokemon: JSON.parse(data.toString()), types: JSON.parse(typeData.toString()) }
  },
})

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
