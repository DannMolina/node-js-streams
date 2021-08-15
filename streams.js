const fs = require("fs");
const server = require("http").createServer();

// * listen to request event and specify callback
server.on("request", (req, res) => {
  /**
   * solution 1 (not applicable on prod-ready-application)
   * does work for creating something small locally
   */
  fs.readFile("test-file.txt", (err, data) => {
    if (err) console.log(err);
    res.end(data);
  });
  // * END SOLUTION
  /**
   * Solution 2: Streams(solve for solution 1)
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
  /**
   * Solution 3 (final solution to address issue in solution 2).
   * best solution
   * use "pipe" operator
   * pipe operator is avaible on all readable streams and it allows us to pipe the output of a readable stream
   * right into the input of a writable stream to fix the problem of backpressure because it will automatically handle the speed basically
   * of the data coming in, and the speed of the data going out.
   */
  //* readable is a stream as created using createReadStream method
  const readable = fs.createReadStream("test-file.txt");
  // * take the readable stream, use the pipe method on it, and then put in a writable stream and that is the response.
  // * pipe into writable destination
  // * readableSource.pipe(writeableDestination)
  // * pipe operator automatically solves the problem of backpressure and this also a much more elegant and straight-forward solution
  // * pipe here is actually the easiest way of consuming and writing streams, unless I need a more customized solutions. And then,
  // * I have to use those above more complicated tools like the events and methods
  readable.pipe(res);
  // * END SOLUTION
});

// * start the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening. . .");
});
