//TODO:  Define the necessary Query and Mutation types:

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!,
    username: String!,
    email: String,
    bookCount: Int,
    savedBooks: [Book]
  }

  type Book {
    bookId: ID!,
    authors: [String],
    description: String,
    title: String!,
    image: String,
    link: String
  }

  # Set up an Auth type to handle returning data from a user's login or signup
  type Auth {
    token: ID!
    User: User
  }

  type Query {
    me: User 
    # me: Which returns a User type.
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    # Accepts a username, email, and password as parameters; returns an Auth type.
    login(email: String!, password: String!): Auth
    # Accepts an email and password as parameters; returns an Auth type.
    saveBook(bookData: BookInput!): User
    # Accepts a book author's array, description, title, bookId, image, and link as parameters; returns a User type. 
    # (Look into creating what's known as an input type to handle all of these parameters!)
    removeBook(bookId: ID!): User
    # Accepts a book's bookId as a parameter; returns a User type.
  }
`;

module.exports = typeDefs;