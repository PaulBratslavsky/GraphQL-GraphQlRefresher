const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

const graphQlschema = `
    type myRootQuery {
        events: [String!]!
    }
    type myRootMutation {
        createEvent(myName: String): String
    }
    schema {
        query: myRootQuery
        mutation: myRootMutation
    }
`;

const resolvers = {
    events: () => {
        return ['one','two','three'];
    },
    createEvent: (args) => {
        const eventName = args.myName;
        return eventName;
    }
};

app.use('/graphql', graphQlHttp({
    schema: buildSchema(graphQlschema),
    rootValue: resolvers,
    graphiql: true,
}) );


app.listen(3000);
