import { describe, it, expect } from "vitest";
import { decodeJwtPayload, isTokenExpired } from "@/lib/auth";

function makeToken(payload: object): string {
  const json = JSON.stringify(payload);
  const b64 = btoa(json).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `header.${b64}.sig`;
}

describe("decodeJwtPayload", () => {
  it("decodes a valid JWT payload", () => {
    const token = makeToken({ sub: "user1", exp: 9999999999 });
    expect(decodeJwtPayload(token)).toMatchObject({ sub: "user1" });
  });

  it("returns null for a token with only one part", () => {
    expect(decodeJwtPayload("onlyheader")).toBeNull();
  });

  it("returns null for a token with invalid base64 payload", () => {
    expect(decodeJwtPayload("header.!!!invalid!!!.sig")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("preserves all payload fields", () => {
    const token = makeToken({ sub: "u1", roles: ["ADMIN"], exp: 1000 });
    const decoded = decodeJwtPayload(token);
    expect(decoded).toMatchObject({ sub: "u1", roles: ["ADMIN"], exp: 1000 });
  });
});

describe("isTokenExpired", () => {
  it("returns false for a token expiring in the future", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(makeToken({ exp: futureExp }))).toBe(false);
  });

  it("returns true for an expired token", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    expect(isTokenExpired(makeToken({ exp: pastExp }))).toBe(true);
  });

  it("returns true when exp is within the 10-second buffer", () => {
    const almostExpired = Math.floor(Date.now() / 1000) + 5; // 5s from now < 10s buffer
    expect(isTokenExpired(makeToken({ exp: almostExpired }))).toBe(true);
  });

  it("returns true when exp field is missing", () => {
    expect(isTokenExpired(makeToken({ sub: "user1" }))).toBe(true);
  });

  it("returns true when exp is not a number", () => {
    expect(isTokenExpired(makeToken({ exp: "never" }))).toBe(true);
  });

  it("returns true for a malformed token", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);
  });
});
