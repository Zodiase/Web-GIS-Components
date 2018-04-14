var express = require("express");
var app = express();
port = process.argv[2] || 4000;


app.use(express.static(__dirname + '/docs/demo'));
app.listen(port); //the port you want to use
console.log("Express server running on port: "+port);
