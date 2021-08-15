const fs = require("fs");
const server = require("http").createServer();

// * listen to request event and specify callback
server.on("request", (req, res) => {
  /**
   * solution 1 (not applicable on prod-ready-application)
   * does work for creating something small locally
   */
  //   fs.readFile("test-file.txt", (err, data) => {
  //     if (err) console.log(err);
  //     res.end(data);
  //   });
  // * END SOLUTION
  /**
   * Solution 2: Streams
   * Instead of reading the data into a variable, and having store that variable
   * into memory, I just create a readble stream. Then as I received each chunk of data,
   * I send it to the client as a response which is a writable stream.
   */

  // * this creates a stream the data that is in the test-file.txt, which I can then consume piece by piece, or chunk by chunk
  const readable = fs.createReadStream("test-file.txt");

  // * each there is a new piece of data we can consume, a readble stream emits the data event.
  // * listen
  readable.on("data", (chunk) => {
    // * response is a writable stream
    // * use the write method to send every single piece of data to that stream
    // * streaming the content from the file right to the client
    // * I effectively streaming the file, so we read one piece of the file, and as soon as that's available,
    // * I send it right to the client, using the write method of the response stream then that piece will be sent,
    // * all the way until the entire file is read and streamed to the client.
    res.write(chunk);
  });

  // * so when the stream is basically finished reading the data from the file.
  // * the end event will be emitted
  // * listen
  readable.on("end", () => {
    // * call end on the response
    // * note: response is also a stream
    // * end method signals that no more data will be written to this writable stream.
    res.end();
  });

  // * listen
  readable.on("error", (err) => {
    console.log(err);
    res.statusCode = 500;
    res.end("File not found.");
  });

  /**
   * Note for Solution 2: there still is a problem with this approach.
   * the problem is that our readable stream, so the one Im using to read the file from the disk, is much faster that actually
   * sending the result with the response writable stream over the network, and this will overwhelm the response stream,
   * which cannot handle all this incoming data so fast.
   * This problem is called "backpressure"
   * in this case backpressure happens when the response cannot send the  data nearly as fast as it is receiving it from the file.
   */
  // * END SOLUTION
});

// * start the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening. . .");
});
