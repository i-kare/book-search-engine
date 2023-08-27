const express = require('express');
// Import the ApolloServer class
const { ApolloServer } = require('apollo-server-express'); //lives on its own 
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');

// Import the two parts of a GraphQL schema
const { typeDefs, resolvers } = require('./schemas');
const { type } = require('os');

const server = new ApolloServer({ //creating a new apollo server
  typeDefs,
  resolvers,
  context: authMiddleware
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start(); //starts up the apollo server and then attatch our express server to it 
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
