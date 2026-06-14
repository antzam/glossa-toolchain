import { TokenType } from "./token.ts";

const KEYWORDS = new Map(
  [
    ["ΑΚΕΡΑΙΕΣ", TokenType.IntegerVariables],
    ["ΑΡΧΗ", TokenType.Begin],
    ["ΓΡΑΨΕ", TokenType.Write],
    ["ΔΙΑΒΑΣΕ", TokenType.Read],
    ["ΜΕΤΑΒΛΗΤΕΣ", TokenType.Variables],
    ["ΠΡΑΓΜΑΤΙΚΕΣ", TokenType.RealVariables],
    ["ΠΡΟΓΡΑΜΜΑ", TokenType.Program],
    ["ΤΕΛΟΣ_ΠΡΟΓΡΑΜΜΑΤΟΣ", TokenType.EndProgram],
    ["ΧΑΡΑΚΤΗΡΕΣ", TokenType.StringVariables],
  ],
);

export function* tokenize(input: string) {
  let line = 1;
  let column = 1;
  let offset = 0;

  const MATCHERS = [
    {
      regexp: /[ \t]+/y,
      handler: () => null,
    },
    {
      regexp: /\r\n|\r|\n/y,
      handler: () => TokenType.Eol,
    },
    {
      regexp: /[():,+\-*\/]/y,
      handler: (match: RegExpExecArray): TokenType => {
        switch (match[0]) {
          case "(":
            return TokenType.LeftParen;
          case ")":
            return TokenType.RightParen;
          case ":":
            return TokenType.Colon;
          case ",":
            return TokenType.Comma;
          case "+":
            return TokenType.Plus;
          case "-":
            return TokenType.Minus;
          case "*":
            return TokenType.Star;
          case "/":
            return TokenType.Slash;
          default:
            throw new Error("Unreachable");
        }
      },
    },
    {
      regexp: /[A-Z_a-zΆΈ-ΊΌΎ-ΡΣ-ώ][0-9A-Z_a-zΆΈ-ΊΌΎ-ΡΣ-ώ]*/y,
      handler: (match: RegExpExecArray) =>
        KEYWORDS.get(match[0]) ?? TokenType.Identifier,
    },
    {
      regexp: /[0-9]+\.[0-9]+/y,
      handler: () => TokenType.Real,
    },
    {
      regexp: /[0-9]+/y,
      handler: () => TokenType.Integer,
    },
    {
      regexp: /'[^'\r\n]*'/y,
      handler: () => TokenType.String,
    },
  ];

  while (offset < input.length) {
    let matched = false;
    for (const matcher of MATCHERS) {
      matcher.regexp.lastIndex = offset;
      const match = matcher.regexp.exec(input);
      if (match !== null) {
        matched = true;

        const startLine = line;
        const startColumn = column;
        const startOffset = offset;
        const tokenType = matcher.handler(match);

        if (tokenType === TokenType.Eol) {
          line += 1;
          column = 1;
        } else {
          column += match[0].length;
        }
        offset += match[0].length;

        if (tokenType !== null) {
          yield {
            type: tokenType,
            lexeme: match[0],
            location: {
              start: {
                line: startLine,
                column: startColumn,
                offset: startOffset,
              },
              end: { line, column, offset },
            },
          };
        }
      }
    }

    if (!matched) {
      throw new Error("Unexpected character");
    }
  }

  yield {
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line, column, offset },
      end: { line, column: column + 1, offset: offset + 1 },
    },
  };
}
