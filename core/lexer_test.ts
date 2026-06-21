import { assertEquals, assertThrows } from "@std/assert";
import { TokenType } from "./token.ts";
import { Lexer } from "./lexer.ts";

Deno.test("returns single EOF token on empty input", () => {
  const lexer = new Lexer();
  assertEquals(Array.from(lexer.tokenize("")), [{
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
  const lexer = new Lexer();
  Deno.test(`ignores whitespace character ${ws.description}`, () => {
    assertEquals(Array.from(lexer.tokenize(ws.input)), [{
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
  const lexer = new Lexer();
  const input = "  \t \t  ";
  const tokens = Array.from(lexer.tokenize(input));
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
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(newline.input)), [{
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
  const lexer = new Lexer();
  assertEquals(Array.from(lexer.tokenize("\r\n")), [{
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

Deno.test("recognizes multiple newlines with intervening whitespace", () => {
  const lexer = new Lexer();
  const input = "   \n\t\n \t \n";
  assertEquals(Array.from(lexer.tokenize(input)), [
    {
      type: TokenType.Eol,
      lexeme: "\n",
      location: {
        start: { line: 1, column: 4, offset: 3 },
        end: { line: 2, column: 1, offset: 4 },
      },
    },
    {
      type: TokenType.Eol,
      lexeme: "\n",
      location: {
        start: { line: 2, column: 2, offset: 5 },
        end: { line: 3, column: 1, offset: 6 },
      },
    },
    {
      type: TokenType.Eol,
      lexeme: "\n",
      location: {
        start: { line: 3, column: 4, offset: 9 },
        end: { line: 4, column: 1, offset: 10 },
      },
    },
    {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: 4, column: 1, offset: 10 },
        end: { line: 4, column: 2, offset: 11 },
      },
    },
  ]);
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
  { input: "<", type: TokenType.Less },
];

for (const punctuation of SINGLE_CHAR_PUNCTUATION) {
  Deno.test(`recognizes single character punctuation '${punctuation.input}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(punctuation.input)), [{
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

const MULTIPLE_CHARACTER_PUNCTUATION = [
  { input: "<-", type: TokenType.Assign },
];

for (const punctuation of MULTIPLE_CHARACTER_PUNCTUATION) {
  Deno.test(`recognizes multiple character punctuation '${punctuation.input}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(punctuation.input)), [{
      type: punctuation.type,
      lexeme: punctuation.input,
      location: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 3, offset: 2 },
      },
    }, {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: 1, column: 3, offset: 2 },
        end: { line: 1, column: 4, offset: 3 },
      },
    }]);
  });
}

// TODO: In the parsing phase, resolve the ambiguity in the expression `x<-3`

for (const c of ["a", "b", "g", "z", "A", "Q", "X", "Z"]) {
  Deno.test(`recognizes single Latin character '${c}' identifier`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(c)), [{
      type: TokenType.Identifier,
      lexeme: c,
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

for (const c of ["α", "ΐ", "ρ", "ς", "ω", "ώ", "Ά", "Α", "Έ", "Ϊ", "Χ", "Ω"]) {
  Deno.test(`recognizes single Greek character '${c}' identifier`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(c)), [{
      type: TokenType.Identifier,
      lexeme: c,
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

Deno.test("recognizes single underscore as identifier", () => {
  const lexer = new Lexer();
  assertEquals(Array.from(lexer.tokenize("_")), [{
    type: TokenType.Identifier,
    lexeme: "_",
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

for (
  const identifier of [
    "arTDkm_Άτρς",
    "ρ__ΕΦΤμαqqqz_mPR",
    "_θTHΫώςwGR",
    "Δer93_ΏFEXQπ__",
  ]
) {
  Deno.test(`recognizes mixed-character identifier '${identifier}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(identifier)), [{
      type: TokenType.Identifier,
      lexeme: identifier,
      location: {
        start: { line: 1, column: 1, offset: 0 },
        end: {
          line: 1,
          column: identifier.length + 1,
          offset: identifier.length,
        },
      },
    }, {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: {
          line: 1,
          column: identifier.length + 1,
          offset: identifier.length,
        },
        end: {
          line: 1,
          column: identifier.length + 2,
          offset: identifier.length + 1,
        },
      },
    }]);
  });
}

const KEYWORDS = [
  { input: "ΑΚΕΡΑΙΕΣ", type: TokenType.IntegerVariables },
  { input: "ΑΡΧΗ", type: TokenType.Begin },
  { input: "ΓΡΑΨΕ", type: TokenType.Write },
  { input: "ΔΙΑΒΑΣΕ", type: TokenType.Read },
  { input: "ΜΕΤΑΒΛΗΤΕΣ", type: TokenType.Variables },
  { input: "ΠΡΑΓΜΑΤΙΚΕΣ", type: TokenType.RealVariables },
  { input: "ΠΡΟΓΡΑΜΜΑ", type: TokenType.Program },
  { input: "ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ", type: TokenType.EndProgram },
  { input: "ΧΑΡΑΚΤΗΡΕΣ", type: TokenType.StringVariables },
];

for (const keyword of KEYWORDS) {
  Deno.test(`recognizes keyword '${keyword.input}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(keyword.input)), [{
      type: keyword.type,
      lexeme: keyword.input,
      location: {
        start: { line: 1, column: 1, offset: 0 },
        end: {
          line: 1,
          column: keyword.input.length + 1,
          offset: keyword.input.length,
        },
      },
    }, {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: {
          line: 1,
          column: keyword.input.length + 1,
          offset: keyword.input.length,
        },
        end: {
          line: 1,
          column: keyword.input.length + 2,
          offset: keyword.input.length + 1,
        },
      },
    }]);
  });
}

for (const n of ["0", "4", "42", "1234567890", "0987654321", "874159"]) {
  Deno.test(`recognizes unsigned integer literal '${n}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(n)), [
      {
        type: TokenType.Integer,
        lexeme: n,
        location: {
          start: {
            line: 1,
            column: 1,
            offset: 0,
          },
          end: {
            line: 1,
            column: n.length + 1,
            offset: n.length,
          },
        },
      },
      {
        type: TokenType.Eof,
        lexeme: "\0",
        location: {
          start: {
            line: 1,
            column: n.length + 1,
            offset: n.length,
          },
          end: {
            line: 1,
            column: n.length + 2,
            offset: n.length + 1,
          },
        },
      },
    ]);
  });
}

for (const n of ["1.2", "876.543", "0.00001", "55.0", "000.000"]) {
  Deno.test(`recognizes unsigned real literal '${n}'`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(n)), [
      {
        type: TokenType.Real,
        lexeme: n,
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: n.length + 1, offset: n.length },
        },
      },
      {
        type: TokenType.Eof,
        lexeme: "\0",
        location: {
          start: {
            line: 1,
            column: n.length + 1,
            offset: n.length,
          },
          end: {
            line: 1,
            column: n.length + 2,
            offset: n.length + 1,
          },
        },
      },
    ]);
  });
}

for (const s of ["''", "' '", "'Hello'", "'Αααάά'", "'!@#$%^&*()'"]) {
  Deno.test(`recognizes string literal "${s}"`, () => {
    const lexer = new Lexer();
    assertEquals(Array.from(lexer.tokenize(s)), [
      {
        type: TokenType.String,
        lexeme: s,
        location: {
          start: { line: 1, column: 1, offset: 0 },
          end: { line: 1, column: s.length + 1, offset: s.length },
        },
      },
      {
        type: TokenType.Eof,
        lexeme: "\0",
        location: {
          start: { line: 1, column: s.length + 1, offset: s.length },
          end: { line: 1, column: s.length + 2, offset: s.length + 1 },
        },
      },
    ]);
  });
}

// TODO: replace exceptions with error reporting
Deno.test("throws error on unexpected character", () => {
  const lexer = new Lexer();
  const input = "@";
  assertThrows(
    () => {
      Array.from(lexer.tokenize(input));
    },
    Error,
    "Unexpected character",
  );
});
