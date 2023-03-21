"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var http = require("http");
var uuid = require("uuid");
var port = 8000;
var clients = {};
var messages = new Array;
var httpServer = http.createServer();
var wsServer = new ws_1.WebSocketServer({ server: httpServer });
httpServer.listen(port, function () {
    console.log("WebSocket server is running on port ".concat(port));
});
function broadcastMessage(json) {
    var data = JSON.stringify(json);
    for (var userId in clients) {
        var client = clients[userId];
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    }
}
var handleMessage = function (message, userId) {
    var newMessage = {
        type: message.type,
        data: __assign(__assign({}, JSON.parse(message.toString())), { sender: userId, timestamp: Date.now() })
    };
    messages.push(newMessage);
    broadcastMessage(newMessage);
    console.log("".concat(userId, " sent a message"), newMessage);
};
wsServer.on('connection', function (connection) {
    var userId = uuid.v4();
    clients[userId] = connection;
    console.log("New Connection from ".concat(userId));
    connection.on('error', console.error);
    connection.on('message', function (message) { return handleMessage(message, userId); });
});
