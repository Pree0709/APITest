const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const messages = [
  { id: 1, text: "Hello from the API!" },
  { id: 2, text: "The frontend received this through an endpoint." },
];

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  response.end(JSON.stringify(data));
}

function serveHomePage(response) {
  const filePath = path.join(__dirname, "public", "index.html");

  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(500);
      response.end("Could not load the webpage.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": "text/html",
    });

    response.end(file);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(
    request.url,
    `http://${request.headers.host}`
  );

  // GET endpoint: return all messages
  if (
    request.method === "GET" &&
    url.pathname === "/api/messages"
  ) {
    sendJson(response, 200, messages);
    return;
  }

  // POST endpoint: create a new message
  if (
    request.method === "POST" &&
    url.pathname === "/api/messages"
  ) {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        const data = JSON.parse(body);

        if (!data.text || typeof data.text !== "string") {
          sendJson(response, 400, {
            error: "Please provide message text.",
          });
          return;
        }

        const newMessage = {
          id: messages.length + 1,
          text: data.text,
        };

        messages.push(newMessage);
        sendJson(response, 201, newMessage);
      } catch {
        sendJson(response, 400, {
          error: "Invalid JSON.",
        });
      }
    });

    return;
  }

  // Display the webpage
  if (request.method === "GET" && url.pathname === "/") {
    serveHomePage(response);
    return;
  }

  sendJson(response, 404, {
    error: "Endpoint not found.",
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
