import { Client } from "@stomp/stompjs";

export function createStompClient(jwtToken: string): Client {
  const wsUrl = `${
    process.env.NEXT_PUBLIC_WS_URL ??
    (process.env.NODE_ENV === "production" ? "wss://localhost:8080" : "ws://localhost:8080")
  }/ws`;

  const client = new Client({
    brokerURL: wsUrl,
    connectHeaders: { Authorization: `Bearer ${jwtToken}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  return client;
}
