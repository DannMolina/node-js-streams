const fs = require("fs");
const server = require("http").createServer();

// * listen to request event and specify callback
server.on("request", (req, res) => {
  // * solution 1 (not applicable on prod-ready-application)
  // * does work for creating something small
  fs.readFile("test-file.txt", (err, data) => {
    if (err) console.log(err);
    res.end(data);
  });
});

// * start the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening. . .");
});
