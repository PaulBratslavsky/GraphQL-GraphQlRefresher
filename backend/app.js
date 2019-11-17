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
        createEvent(name: String): String
    }
    schema {
        query: myRootQuery
        mutation: myRootMutation
    }
`;

app.use('/graphql', graphQlHttp({
    schema: buildSchema(graphQlschema),
    rootValue: {}
}) );


app.listen(3000);
