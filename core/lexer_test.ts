import { assertEquals, assertThrows } from "@std/assert";
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

for (
  const newline of [{ input: "\n", description: "'\\n'" }, {
    input: "\r",
    description: "'\\r'",
  }]
) {
  Deno.test(`recognizes newline character ${newline.description}`, () => {
    assertEquals(Array.from(tokenize(newline.input)), [{
      type: TokenType.Eol,
      lexeme: newline.input,
      location: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 2, column: 1, offset: 1 },
      },
    }, {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: 2, column: 1, offset: 1 },
        end: { line: 2, column: 2, offset: 2 },
      },
    }]);
  });
}

Deno.test("recognizes newline sequence '\r\n'", () => {
  assertEquals(Array.from(tokenize("\r\n")), [{
    type: TokenType.Eol,
    lexeme: "\r\n",
    location: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 2, column: 1, offset: 2 },
    },
  }, {
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line: 2, column: 1, offset: 2 },
      end: { line: 2, column: 2, offset: 3 },
    },
  }]);
});

const SINGLE_CHAR_PUNCTUATION = [
  { input: "(", type: TokenType.LeftParen },
  { input: ")", type: TokenType.RightParen },
  { input: ":", type: TokenType.Colon },
  { input: ",", type: TokenType.Comma },
  { input: "+", type: TokenType.Plus },
  { input: "-", type: TokenType.Minus },
  { input: "*", type: TokenType.Star },
  { input: "/", type: TokenType.Slash },
];

for (const punctuation of SINGLE_CHAR_PUNCTUATION) {
  Deno.test(`recognizes single character punctuation '${punctuation.input}'`, () => {
    assertEquals(Array.from(tokenize(punctuation.input)), [{
      type: punctuation.type,
      lexeme: punctuation.input,
      location: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 2, offset: 1 },
      },
    }, {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: 1, column: 2, offset: 1 },
        end: { line: 1, column: 3, offset: 2 },
      },
    }]);
  });
}

// TODO: replace exceptions with error reporting
Deno.test("throws error on unexpected character", () => {
  const input = "@";
  assertThrows(
    () => {
      Array.from(tokenize(input));
    },
    Error,
    "Unexpected character",
  );
});
