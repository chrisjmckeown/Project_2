// Requiring necessary npm packages
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");
const exphbs = require("express-handlebars");
// Setting the models
const db = require("./models");

// Setting up port and requiring models for syncing
const PORT = process.env.PORT || 8080;

// Creating express app
const app = express();

// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Configuring middleware needed for authentication
app.use(
    session({ secret: process.env.SECRET, resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/category-api-routes.js")(app);
require("./routes/favourite-api-routes.js")(app);
require("./routes/measurement-api-routes.js")(app);
require("./routes/recipe-api-routes.js")(app);
require("./routes/recipeIngredient-api-routes.js")(app);
require("./routes/shoppingList-api-routes.js")(app);
require("./routes/type-api-routes.js")(app);
require("./routes/user-api-routes.js")(app);
require("./routes/login-html-routes.js")(app);

// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(() => {
    const server = app.listen(PORT, () => {
        // Log (server-side) when our server has started
        console.log("Server listening on: http://localhost:" + PORT);
    });

    //socket.io instantiation
    const io = require("socket.io")(server)
    //listen on every connection
    io.on('connection', (socket) => {
        //default username
        socket.username = "Anonymous"
        //listen on change_username
        socket.on('change_username', (data) => {
            socket.username = data.username
        })
        //listen on new_message
        socket.on('new_message', (data) => {
            //broadcast the new message
            io.sockets.emit('new_message', { message: data.message, username: socket.username });
        })
        //listen on typing
        socket.on('typing', (data) => {
            socket.broadcast.emit('typing', { username: socket.username })
        })
    })
});
