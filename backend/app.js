const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const bcrypt = require('bcryptjs');

// IMPORT MONGOOSE
const mongoose = require('mongoose');

// IMPORT OUT MODEL
const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = (eventIds) => {
    return Event.find({_id: {$in: eventIds}})
        .then(events => {
            return events.map( event => {
                return { ...event._doc, creator: user.bind(this, event.creator) };
            });
        })
        .catch( error => {
            throw error;
        });
}

const user = (userId) => {
    return User.findById(userId)
    .then(user => {
        return { ...user._doc, createdEvents: events.bind(this, user._doc.createdEvents) };
    })
    .catch( error => {
        throw error;
    });
}

app.use(bodyParser.json());

const graphQlschema = `
    type Event {
        _id: ID!,
        title: String!,
        description: String!,
        price: Float!,
        date: String!,
        creator: User!
    }

    type User {
        _id: ID!,
        email: String!,
        password: String,
        createdEvents: [String!]
    }

    input EventInput {
        title: String!,
        description: String!,
        price: Float!,
        date: String!
    }

    input UserInput {
        email: String!,
        password: String!
    }

    type myRootQuery {
        events: [Event!]!
    }
    type myRootMutation {
        createEvent(eventInput: EventInput): Event,
        createUser(userInput: UserInput): User
    }
    schema {
        query: myRootQuery
        mutation: myRootMutation
    }
`;

const resolvers = {
    events: () => {
        return Event.find()
        .then( events => {
            return events.map( event => {
                return { 
                    ...event._doc,
                    _id: event.id,
                    creator: user.bind(this, event._doc.creator),
                 }; // _id: event._doc._id.toString()
            })
        })
        .catch( error => {
            throw error;
        });
    },
    createEvent: (args) => {

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5ddf32df74af6193f57db15a'
        });
        let createdEvent;
        return event
        .save()
        .then( result => {
            createdEvent = { ...result._doc };
            return User.findById('5ddf32df74af6193f57db15a');
        })
        .then(user => {
            if (!user) {
                throw new Error('User does not exists!')
            } 
            user.createdEvents.push(event);
            return user.save();
        })
        .then(result => {
            console.log(result);
            return createdEvent;
        })
        .catch( error => {
            console.log(error);
            throw error;
        });
    }, 
    createUser: args => {
        // Check for existing user with same email
        return User.findOne({email: args.userInput.email})
            .then(user => {
                if (user) {
                    throw new Error('User already exists!')
                } 

                return bcrypt.hash(args.userInput.password, 12)
            })
            .then( hashedPassword => {

                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                
                return user.save();
            })
            .then( result => {
                console.log(result, 'FROM CREATE USER')
                return { ...result._doc, password: null, _id: result.id }
            })
            .catch( error => {
                throw error;
            });
            
    }
};


app.use('/graphql', graphQlHttp({
    schema: buildSchema(graphQlschema),
    rootValue: resolvers,
    graphiql: true,
}) );


// ESTABLISH CONNECTION WITH MONGOOSE TO DATABASE
const info = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-sqe6s.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

mongoose.connect(info)
.then(() => {
    // Start Server
    app.listen(3000);
    console.log('SERVER RUNNING');
})
.catch( error => {
    console.log(error, 'From Node Error')
});

