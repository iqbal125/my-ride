"use strict";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import AWS from "aws-sdk";

import Log from "../portal/src/utils/Log";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const log = new Log("service");
import ip from "ip";
const app = express();

const COOKIE_NAME = "MyRideCookie";

app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      log.log("Origin check:", origin);
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const APIBASE = "/api/v1";
process.env.PORT = 5000;

AWS.config.update({
  region: "us-west-2",
  accessKeyId: "AKIA5PQ4KAEDIQMEOIMI",
  secretAccessKey: "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"
});
var docClient = new AWS.DynamoDB.DocumentClient();

let users = {}; // indexed by cookie
console.log("MY IP IS:", ip.address());
// Swagger definition
// You can set every attribute except paths and swagger
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    // API informations (required)
    title: "MyRide API interface", // Title (required)
    version: "1.0.0", // Version (required)
    description: "MyRide RESTful API interface" // Description (optional)
  },
  servers: [{ url: `http://${ip.address()}:${process.env.PORT}${APIBASE}` }]
};

// Options for the swagger docs
const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
  apis: ["./service.mjs"]
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
app.use(APIBASE + "/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:         # arbitrary name for the security scheme; will be used in the "security" key later
 *       type: apiKey
 *       in: header
 *       name: MyRideCookie  # cookie name
 *
 *   daCookie:
 *       in: cookie
 *       name: MyRideCookie
 *       description: Authorization token returned by /login
 *       schema:
 *         type: string
 *
 *   responseCode:
 *     type: integer
 *     enum: [0, 401, 403, 500]
 *     description: 0:Success, 401:Not logged in, 403:Forbidden, 500:Database error
 *
 *   gigFilterObject:
 *         type: object
 *         properties:
 *           country:
 *             type: string
 *           state:
 *             type: string
 *           city:
 *             type: string
 *           metro:
 *             type: string
 *           street:
 *             type: string
 *           description:
 *             type: string
 *
 *   demographicsObject:
 *         type: object
 *         properties:
 *           firstName:
 *             type: string
 *           lastName:
 *             type: string
 *           email:
 *             type: string
 *           phone:
 *             type: string
 *           country:
 *             type: string
 *           state:
 *             type: string
 *           city:
 *             type: string
 *           zipcode:
 *             type: string
 *
 *   accessObject:
 *         type: object
 *         description: Access capabilities of a user
 *         properties:
 *           privileges:
 *             type: string
 *           role:
 *             type: string
 *
 *   userAccessObject:
 *     type: object
 *     description: Simply username and password for login/validation
 *     properties:
 *       username:
 *         type: string
 *         description: The username which is in email format
 *         example: boston
 *       password:
 *         type: string
 *         description: The encrypted password value
 *         example: boston
 *
 *   userObject:
 *     type: object
 *     description: A full user-object
 *     properties:
 *       username:
 *         type: string
 *         description: The username which is in email format
 *       password:
 *         type: string
 *         description: The encrypted password value
 *       demographics:
 *         $ref: '#/components/demographicsObject'
 *       access:
 *         $ref: '#/components/accessObject'
 *
 *   point:
 *     type: object
 *     description: The lat and lng of a coordinate
 *     properties:
 *       lat:
 *         type: number
 *       lng:
 *         type: number
 *   gig:
 *     type: object
 *     description: A full gig-object
 *     properties:
 *       CountryStateCity:
 *         type: string
 *         description: Dash-separated triple; Dynamo Hash Key
 *       MetroStreetDescription:
 *         type: string
 *         description: Dash-separated triple; Dynamo Sort Key
 *       Center:
 *         $ref: '#/components/point'
 *       Points:
 *         type: array
 *         description: Array of 'points'
 *         items:
 *           ref: '#/components/point'
 *       AssignedTo:
 *         type: string
 *         description: User name
 *       DateAssigned:
 *         type: string
 *         description: Date
 *       DateCompleted:
 *         type: string
 *         description: Date
 *
 *   gigs:
 *    type: array
 *    decription: Array of gigs
 *    items:
 *      $ref: '#/components/gig'
 *
 */

/**************************
 * POST /login   -- Attempt a login
 **************************/
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Attempt a login specifying username and password
 *     requestBody:
 *         description: Username and password
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/userAccessObject'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: >
 *           Successfully authenticated.
 *           The session ID is returned in a cookie named `X-API-MyRideCookie`. You need to include this cookie in subsequent requests.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: X-API-MyRideCookie=abcde12345; Path=/api/v1; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 *                 user:
 *                   $ref: '#/components/userObject'
 *                 cookie:
 *                   type: string
 */
app.post(APIBASE + "/login", (req, res) => {
  log.log("POST /login");
  log.log(" json:", req.body);

  var params = {
    TableName: "Users",
    Condition: "EQ",
    KeyConditionExpression: "#un = :user",
    ExpressionAttributeNames: {
      "#un": "username"
    },
    ExpressionAttributeValues: {
      ":user": req.body.username
    }
  };

  docClient
    .query(params)
    .promise()
    .then(data => {
      log.log("POST /login: data:", data);
      // REALLY should check that password matches!
      if (data.Count != 1) {
        log.error("Invalid username/password, params:", params);
        res.status(401).send({
          status: 401,
          message: "Invalid username/password: " + req.body.username
        });
        return;
      } else data.Items[0].password = null; // Hide for when we send back to the user
      // no: set a new cookie
      var randomNumber = Math.random().toString();
      randomNumber = randomNumber.substring(2, randomNumber.length);
      users[randomNumber] = data.Items[0];
      log.log(
        "User authenticated, setting " + COOKIE_NAME + " to:",
        randomNumber
      );
      res
        .cookie(COOKIE_NAME, randomNumber, {
          httpOnly: true,
          expires: new Date(Date.now() + 9999999)
        })
        .send({ user: data.Items[0], cookie: randomNumber, status: 0 });
    })
    .catch(err => {
      log.log("POST /login: ERR:", err);
      res.status(500).send({ status: 500, message: "Dynamodb Err:" + err });
    });
});

function getUser(req) {
  // Checks to see if the incoming request has either the cookie
  // or the header-fake-out for a cookie and then looks up the user record
  // in the in-memory array.
  // returns null if no cookie or user not known etc
  // check if client sent cookie
  var cookie = req.cookies[COOKIE_NAME];
  log.log("Cookie check:", req.cookies);
  log.log("header:", req.headers);
  if (cookie === undefined) {
    log.log("No real cookie set, lets see if header is set");
    cookie = req.headers.myridecookie;
    if (cookie === undefined) {
      log.log("Abosolutely no cookie!");
      return null;
    }
  }
  log.log("Using cookie value:", cookie);
  let user = users[cookie];
  if (!user) {
    // no: set a new cookie
    log.log("NO VALID COOKIE!!");
    return null;
  }
  return user;
}

// Check Cookie stuff
app.use(function(req, res, next) {
  let user = getUser(req);
  if (!user) {
    // no: set a new cookie
    log.log("NO COOKIE SET!!");
    return res
      .status(401)
      .send({ status: 401, message: "User has not logged in yet" });
  } else {
    // yes, cookie was already present
  }
  next(); // <-- important!
});

/**************************
 * GET /user
 **************************/
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get a complete list ('scan') of all users
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Result Object containing a status AND an array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Contains list of users
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 *                 users:
 *                   type: array
 *                   description: Array of all matching users
 *                   items:
 *                     $ref: '#/components/userObject'
 */
app.get(APIBASE + "/user", (req, res) => {
  log.log("GET /user");
  log.log(" json:", req.body);
  var params = {
    TableName: "Users"
  };

  docClient
    .scan(params)
    .promise()
    .then(users => {
      res.send({ status: 0, users });
    })
    .catch(err => {
      log.log("GET /user: ERR:", err);
      res.status(500).send({ status: 500, message: "Dynamodb Err:" + err });
    });
});

/**************************
 * PUT /user
 **************************/
/**
 * @swagger
 * /user:
 *   put:
 *     summary: Put a single user; will do a database-merge not a full put
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: Parameter Object
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/userObject'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Status object with status code only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 */
app.put(APIBASE + "/user", (req, res) => {
  log.log("PUT /user");
  log.log(" json:", req.body);
  var params = {
    TableName: "Users",
    Item: req.body
  };

  docClient
    .put(params)
    .promise()
    .then(user => {
      res.send({ status: 0 });
    })
    .catch(err => {
      log.log("PUT /user: ERR:", err);
      res.status(500).send({ status: 500, message: "Dynamodb Err:" + err });
    });
});

/**************************
 * DELETE /user
 **************************/
/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Delete a single user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: Parameter Object
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/userObject'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Status object with just status code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 */
app.delete(APIBASE + "/user", (req, res) => {
  log.log("DELETE /user : params:", req.body);
  let params = {
    TableName: "Users",
    Key: {
      username: req.body.username
    }
  };

  docClient
    .delete(params)
    .promise()
    .then(data => {
      log.log("DELETE /user: Data:", data);
      res.send({ status: 0 });
    })
    .catch(err => {
      log.error(
        "DELETE /user: Params:",
        params,
        "Error: " + JSON.stringify(err, undefined, 2)
      );
      res.status(500).send({ status: 500, message: err });
    });
});

/****************
 * GET ...is really a POST because of having params...
 * If no param, then does a scan.
 * If param, param MUST HAVE Country/State/City
 * If has Metro and is-not "<Select>" then
 *    does a filtering
 */
/**
 * @swagger
 * /gig:
 *   post:
 *     summary: Get a list of gigs per a specified filter/query
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: >
 *             Filter Object; MUST specify country/state/city; Optionally
 *             specify metro or metro+street
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/gigFilterObject'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Status and Array of matching gigs (or empty array)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 *                 gigs:
 *                   $ref: '#/components/gigs'
 */
app.post(APIBASE + "/gig", (req, res) => {
  //app.get(APIBASE + "/gig", (req, res) => {
  log.log("POST /gig : params:", req.body);
  let doQuery = true;
  let getList;
  let params = {
    TableName: "Gigs"
  };
  if (!req.body || !req.body.country) doQuery = false;
  else {
    params = {
      ...params,
      KeyConditionExpression: "#csc = :csc "
    };
    let primary = [req.body.country, req.body.state, req.body.city].join("-");
    let msd = null;
    if (req.body.metro && req.body.metro != "<Select>") {
      msd = req.body.metro;
      if (req.body.street && req.body.street != "<Select>")
        msd = msd + "-" + req.body.street;
      params.KeyConditionExpression += "AND begins_with(#msd, :msd)";
    }
    params = {
      ...params,
      ExpressionAttributeNames: {
        "#csc": "CountryStateCity",
        "#msd": "MetroStreetDescription"
      },
      ExpressionAttributeValues: {
        ":csc": primary,
        ":msd": msd
      }
    };
    if (!msd) {
      delete params.ExpressionAttributeNames["#msd"];
      delete params.ExpressionAttributeValues[":msd"];
    }
  }

  log.log(" doQuery:", doQuery, "params:", params);
  doQuery
    ? (getList = docClient.query(params))
    : (getList = docClient.scan(params));
  getList
    .promise()
    .then(data => {
      log.log("GET /gig: Data:", data);
      res.send({ status: 0, gigs: data.Items });
    })
    .catch(err => {
      log.error(
        "GET /gig: Params:",
        params,
        "Error: " + JSON.stringify(err, undefined, 2)
      );
      res.status(500).send({ status: 500, message: err });
    });
});

/**************************
 * PUT /gig
 **************************/
/**
 * @swagger
 * /gig:
 *   put:
 *     summary: Update the 'present' fields (only) of the supplied gig
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: >
 *             MUST specify Country/State/City AND Metro/Street/Description;
 *             Specify any other attributes and those will be overridden or created.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/gig'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Status object with only status code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 */
app.put(APIBASE + "/gig", (req, res) => {
  log.log("PUT /gig;  Data:", req.body);
  var params = {
    TableName: "Gigs",
    Item: req.body
  };

  docClient
    .put(params)
    .promise()
    .then(data => {
      log.log("PUT /gig: Data:", data);
      res.send(data.Items);
    })
    .catch(err => {
      log.error(
        "PUT /gig: Unable to put. Params:",
        params,
        "Error: " + JSON.stringify(err, undefined, 2)
      );
      res.status(500).send({ status: 500, message: err });
    });
});

/**************************
 * DELETE /gig
 **************************/
/**
 * @swagger
 * /gig:
 *   delete:
 *     summary: Delete the specified gig
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: >
 *             MUST specify Country/State/City AND Metro/Street/Description; rest ignored
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/gig'
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Status object with only status code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 */
app.delete(APIBASE + "/gig", (req, res) => {
  log.log("DELETE /gig : params:", req.body);
  let params = {
    TableName: "Gigs",
    Key: {
      CountryStateCity: req.body.CountryStateCity,
      MetroStreetDescription: req.body.MetroStreetDescription
    }
  };

  docClient
    .delete(params)
    .promise()
    .then(data => {
      log.log("DELETE /gig: Data:", data);
      res.send({ status: 0 });
    })
    .catch(err => {
      log.error(
        "DELETE /gig: Params:",
        params,
        "Error: " + JSON.stringify(err, undefined, 2)
      );
      res.status(500).send({ status: 500, message: err });
    });
});

/**************************
 * GET /user
 **************************/
/**
 * @swagger
 * /walker:
 *   get:
 *     summary: Get a list of all gigs in the user's GEO (country/state/city)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *       - in: query
 *         name: unassigned
 *         description: NOT IMPLEMENTED YET. boolean; set to 1 if only want gigs that are unassigned
 *         schema:
 *           type: integer
 *       - in: query
 *         name: assignedToMe
 *         description: NOT IMPLEMENTED YET. boolean; set to 1 if only want gigs that are assigned to me
 *         schema:
 *           type: integer
 *
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: Result Object containing a status AND an array of gigs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Contains list of gigs
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 *                 gigs:
 *                   type: array
 *                   description: Array of all matching gigs
 *                   items:
 *                     $ref: '#/components/gigs'
 */
app.get(APIBASE + "/walker", (req, res) => {
  log.log("GET /walker");
  log.log(" json:", req.body);
  let user = getUser(req);
  log.log("Current user is:", user);
  var params = {
    TableName: "Gigs",
    Condition: "EQ",
    KeyConditionExpression: "#csc = :csc",
    ExpressionAttributeNames: {
      "#csc": "CountryStateCity"
    },
    ExpressionAttributeValues: {
      ":csc": [
        user.demographics.country,
        user.demographics.state,
        user.demographics.city
      ].join("-")
    }
  };
  log.log("Params:", params);
  docClient
    .query(params)
    .promise()
    .then(gigs => {
      res.send({ status: 0, gigs });
    })
    .catch(err => {
      log.log("GET /walker: ERR:", err);
      res.status(500).send({ status: 500, message: "Dynamodb Err:" + err });
    });
});

/**************************
 * PUT /walker
 **************************/
/**
 * @swagger
 * /walker:
 *   put:
 *     summary: Put a single gig; will do a database-merge not a full put
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/daCookie'
 *     requestBody:
 *         description: >
 *             Specify as much as possible about the gig, like 'completion' and data etc.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/gig'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Result Object containing a status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Contains list of gigs
 *               properties:
 *                 status:
 *                   $ref: '#/components/responseCode'
 */
app.put(APIBASE + "/walker", (req, res) => {
  log.log("PUT /walker");
  log.log(" json:", req.body);
  let user = getUser(req);
  var params = {
    TableName: "Gigs",
    Key: {
      CountryStateCity: req.body.CountryStateCity,
      MetroStreetDescription: req.body.MetroStreetDescription
    },
    Item: req.body
  };
  log.log("Params:", params);

  docClient
    .put(params)
    .promise()
    .then(user => {
      res.send({ status: 0, user });
    })
    .catch(err => {
      log.log("PUT /user: ERR:", err);
      res.status(500).send({ status: 500, message: "Dynamodb Err:" + err });
    });
});

app.listen(process.env.PORT, () =>
  log.log(`Example app listening on port ${process.env.PORT}!`)
);
