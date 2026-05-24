export type JsonRpcId = number | string;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: JsonRpcId;
  method: string;
  params?: unknown;
}

export interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type JsonRpcMessage = JsonRpcRequest | JsonRpcNotification | JsonRpcResponse;

const HEADER_SEPARATOR = "\r\n\r\n";

export function encodeJsonRpcMessage(message: JsonRpcMessage): Buffer {
  const payload = Buffer.from(JSON.stringify(message), "utf8");
  return Buffer.concat([
    Buffer.from(`Content-Length: ${payload.byteLength}${HEADER_SEPARATOR}`, "ascii"),
    payload
  ]);
}

export class JsonRpcMessageBuffer {
  private buffered = Buffer.alloc(0);

  append(chunk: Buffer): JsonRpcMessage[] {
    this.buffered = Buffer.concat([this.buffered, chunk]);
    const messages: JsonRpcMessage[] = [];

    while (true) {
      const headerEnd = this.buffered.indexOf(HEADER_SEPARATOR);
      if (headerEnd < 0) return messages;

      const header = this.buffered.subarray(0, headerEnd).toString("ascii");
      const contentLength = contentLengthFromHeader(header);
      if (contentLength === undefined) {
        this.buffered = this.buffered.subarray(headerEnd + HEADER_SEPARATOR.length);
        continue;
      }

      const payloadStart = headerEnd + HEADER_SEPARATOR.length;
      const payloadEnd = payloadStart + contentLength;
      if (this.buffered.byteLength < payloadEnd) return messages;

      const payload = this.buffered.subarray(payloadStart, payloadEnd).toString("utf8");
      messages.push(JSON.parse(payload) as JsonRpcMessage);
      this.buffered = this.buffered.subarray(payloadEnd);
    }
  }
}

function contentLengthFromHeader(header: string): number | undefined {
  for (const line of header.split("\r\n")) {
    const [name, value] = line.split(":").map((part) => part.trim());
    if (name.toLowerCase() === "content-length") {
      const length = Number(value);
      return Number.isInteger(length) && length >= 0 ? length : undefined;
    }
  }
  return undefined;
}
