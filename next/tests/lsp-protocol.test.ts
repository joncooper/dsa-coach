import { describe, expect, test } from "bun:test";
import { encodeJsonRpcMessage, JsonRpcMessageBuffer } from "../src/lsp/protocol.js";

describe("LSP JSON-RPC framing", () => {
  test("decodes complete and split stdio messages", () => {
    const first = encodeJsonRpcMessage({ jsonrpc: "2.0", id: 1, result: { ok: true } });
    const second = encodeJsonRpcMessage({ jsonrpc: "2.0", method: "window/logMessage", params: { message: "ready" } });
    const combined = Buffer.concat([first, second]);
    const buffer = new JsonRpcMessageBuffer();

    expect(buffer.append(combined.subarray(0, 12))).toEqual([]);
    const messages = buffer.append(combined.subarray(12));

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ jsonrpc: "2.0", id: 1, result: { ok: true } });
    expect(messages[1]).toEqual({
      jsonrpc: "2.0",
      method: "window/logMessage",
      params: { message: "ready" }
    });
  });
});
