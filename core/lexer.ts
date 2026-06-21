import type { Token } from "./token.ts";
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
    regexp: /<(-)?/y,
    handler: (match: RegExpExecArray): TokenType => {
      switch (match[0]) {
        case "<-":
          return TokenType.Assign;
        default:
          return TokenType.Less;
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

export class Lexer {
  private readonly input: string;
  private line = 1;
  private column = 1;
  private offset = 0;

  constructor(input: string) {
    this.input = input;
  }

  private isAtEnd(): boolean {
    return this.offset >= this.input.length;
  }

  private nextToken(): Token | null {
    if (this.isAtEnd()) return null;

    for (const { regexp, handler } of MATCHERS) {
      regexp.lastIndex = this.offset;
      const match = regexp.exec(this.input);

      if (match !== null) {
        const startLine = this.line;
        const startColumn = this.column;
        const startOffset = this.offset;
        const tokenType = handler(match);

        if (tokenType === TokenType.Eol) {
          this.line += 1;
          this.column = 1;
        } else {
          this.column += match[0].length;
        }
        this.offset += match[0].length;

        if (tokenType !== null) {
          return {
            type: tokenType,
            lexeme: match[0],
            location: {
              start: {
                line: startLine,
                column: startColumn,
                offset: startOffset,
              },
              end: {
                line: this.line,
                column: this.column,
                offset: this.offset,
              },
            },
          };
        } else {
          return null;
        }
      }
    }

    // TODO: Replace with proper error handling
    throw new Error("Unexpected character");
  }

  *tokens(): Generator<Token> {
    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token !== null) {
        yield token;
      }
    }

    yield {
      type: TokenType.Eof,
      lexeme: "\0",
      location: {
        start: { line: this.line, column: this.column, offset: this.offset },
        end: {
          line: this.line,
          column: this.column + 1,
          offset: this.offset + 1,
        },
      },
    };
  }
}
