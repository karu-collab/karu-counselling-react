import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = "http://localhost:8000/ws"; // Ensure protocol is included

const client = new Client({
    brokerURL: null, // Set to null because we're using SockJS
    connectHeaders: {},
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    webSocketFactory: () => new SockJS(BASE_URL), // SockJS instance with valid URL
});

export default client;
