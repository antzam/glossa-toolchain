import { assertEquals } from "@std/assert";
import { TokenType } from "./token.ts";
import { tokenize } from "./lexer.ts";

Deno.test("ignores input with only whitespace", () => {
  const input = "  \t \t  ";
  const tokens = Array.from(tokenize(input));
  assertEquals(tokens, [{
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line: 1, column: 8, offset: 7 },
      end: { line: 1, column: 9, offset: 8 },
    },
  }]);
});
