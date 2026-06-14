import { assertEquals } from "@std/assert";
import { TokenType } from "./token.ts";
import { tokenize } from "./lexer.ts";

Deno.test("returns single EOF token on empty input", () => {
  assertEquals(Array.from(tokenize("")), [{
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 2, offset: 1 },
    },
  }]);
});

for (
  const ws of [{ input: " ", description: "' '" }, {
    input: "\t",
    description: "'\\t'",
  }]
) {
  Deno.test(`ignores whitespace character ${ws.description}`, () => {
    assertEquals(Array.from(tokenize(ws.input)), [{
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: 1, column: 2, offset: 1 },
        end: { line: 1, column: 3, offset: 2 },
      },
    }]);
  });
}

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
