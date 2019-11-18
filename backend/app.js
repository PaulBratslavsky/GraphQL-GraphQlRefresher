const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
// IMPORT MONGOOSE
const mongoose = require('mongoose');

// IMPORT OUT MODEL
const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

const graphQlschema = `
    type Event {
        _id: ID!,
        title: String!,
        description: String!,
        price: Float!,
        date: String!
    }
    input EventInput {
        title: String!,
        description: String!,
        price: Float!,
        date: String!
    }
    type myRootQuery {
        events: [Event!]!
    }
    type myRootMutation {
        createEvent(eventInput: EventInput): Event
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
                return { ...event._doc }; // _id: event._doc._id.toString()
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
            date: new Date(args.eventInput.date)
        });

        return event
        .save()
        .then( result => {
            console.log(result);
            return { ...result._doc };

        })
        .catch( error => {
            console.log(error);
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
const test = "mongodb+srv://testadmin:FKDLeRV3V8AyDy3d@cluster0-sqe6s.mongodb.net/test?retryWrites=true&w=majority";
const test2 = `mongodb+srv://${process.env.MONGO_USSER}:${process.env.MONGO_PASSWORD}@cluster0-sqe6s.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose.connect(test)
.then(() => {
    // Start Server
    app.listen(3000);
    console.log('SERVER RUNNING');
})
.catch( error => {
    console.log(error, 'From Node Error')
});

