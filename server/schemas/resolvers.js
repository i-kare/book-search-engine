const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (user, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

                if (!userData) {
                    throw new AuthenticationError("Couldn't find user with this id!");
                }

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },

    Mutation: {
        // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
        login: async (user, { email, password }) => {
            const currentUser = await User.findOne({ email });

            if (!currentUser) {
                throw new AuthenticationError('Incorrect email');
            }

            const correctPw = await currentUser.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password');
            }

            const token = signToken(currentUser);

            return { token, currentUser };
        },

        // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
        addUser: async (user, { username, email, password }) => {
            try {
                const newUser = await User.create({ username, email, password });

                if (!newUser) {
                    throw new AuthenticationError('Something went wrong with user creation!');
                }
    
                const token = signToken(newUser);
    
                return { token, newUser };
            } catch(err) {
                console.log(err);
            }
        },

        // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
        saveBook: async (user, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );

                if (!updatedUser) {
                    throw new AuthenticationError("Couldn't find user with this id!");
                }

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        // remove a book from `savedBooks`
        removeBook: async (user, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                )

                if (!updatedUser) {
                    throw new AuthenticationError("Couldn't find user with this id!");
                }

                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
}

module.exports = resolvers;