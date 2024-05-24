import { FormatRegistry } from "@sinclair/typebox";

const uuid = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function IsUuid(value: string) {
  return uuid.test(value);
}

FormatRegistry.Set("uuid", (value) => IsUuid(value));
