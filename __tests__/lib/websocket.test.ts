import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@stomp/stompjs", () => {
  // Must use a regular function (not arrow) so `new Client(opts)` works
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Client = vi.fn(function (this: any, opts: unknown) { Object.assign(this, opts); });
  return { Client };
});

import { Client } from "@stomp/stompjs";
import { createStompClient } from "@/lib/websocket";

describe("createStompClient", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_WS_URL;
  });

  it("uses NEXT_PUBLIC_WS_URL when set", () => {
    process.env.NEXT_PUBLIC_WS_URL = "ws://custom-host:9090";
    createStompClient("token123");
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({ brokerURL: "ws://custom-host:9090/ws" })
    );
  });

  it("falls back to ws://localhost:8080/ws in non-production", () => {
    createStompClient("token123");
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({ brokerURL: "ws://localhost:8080/ws" })
    );
  });

  it("includes Authorization header with Bearer token", () => {
    createStompClient("mytoken");
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({
        connectHeaders: { Authorization: "Bearer mytoken" },
      })
    );
  });

  it("sets reconnectDelay to 5000", () => {
    createStompClient("t");
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({ reconnectDelay: 5000 })
    );
  });

  it("sets heartbeat intervals", () => {
    createStompClient("t");
    expect(Client).toHaveBeenCalledWith(
      expect.objectContaining({ heartbeatIncoming: 4000, heartbeatOutgoing: 4000 })
    );
  });

  it("returns the created Client instance", () => {
    const client = createStompClient("t");
    expect(client).toBeDefined();
  });
});
