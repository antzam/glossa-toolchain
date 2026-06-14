import type { Token } from "./token.ts";
import { TokenType } from "./token.ts";

export function* tokenize(input: string) {
  let line = 1;
  let column = 1;
  let offset = 0;

  const MATCHERS = [
    {
      regexp: /[ \t]+/g,
      handler: (match: RegExpExecArray): null => {
        column += match[0].length;
        offset += match[0].length;

        return null;
      },
    },
    {
      regexp: /\r\n|\r|\n/g,
      handler: (match: RegExpExecArray): Token => {
        const startLine = line;
        const startColumn = column;
        const startOffset = offset;

        line += 1;
        column = 1;
        offset += match[0].length;

        return {
          type: TokenType.Eol,
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
      },
    },
    {
      regexp: /[():,+\-*\/]/g,
      handler: (match: RegExpExecArray): Token => {
        const startColumn = column;
        const startOffset = offset;

        column += 1;
        offset += 1;

        let tokenType: TokenType;
        switch (match[0]) {
          case "(":
            tokenType = TokenType.LeftParen;
            break;
          case ")":
            tokenType = TokenType.RightParen;
            break;
          case ":":
            tokenType = TokenType.Colon;
            break;
          case ",":
            tokenType = TokenType.Comma;
            break;
          case "+":
            tokenType = TokenType.Plus;
            break;
          case "-":
            tokenType = TokenType.Minus;
            break;
          case "*":
            tokenType = TokenType.Star;
            break;
          case "/":
            tokenType = TokenType.Slash;
            break;
          default:
            throw new Error("Unreachable");
        }
        return {
          type: tokenType,
          lexeme: match[0],
          location: {
            start: { line, column: startColumn, offset: startOffset },
            end: { line, column, offset },
          },
        };
      },
    },
    {
      regexp: /[_A-Za-zΆΈ-ΊΌΎ-ΡΣ-ώ]+/g,
      handler: (match: RegExpExecArray): Token => {
        const startColumn = column;
        const startOffset = offset;

        column += match[0].length;
        offset += match[0].length;

        return {
          type: TokenType.Identifier,
          lexeme: match[0],
          location: {
            start: { line, column: startColumn, offset: startOffset },
            end: { line, column, offset },
          },
        };
      },
    },
  ];

  while (offset < input.length) {
    let matched = false;
    for (const matcher of MATCHERS) {
      matcher.regexp.lastIndex = offset;
      const match = matcher.regexp.exec(input);
      if (match !== null) {
        matched = true;

        const token = matcher.handler(match);
        if (token !== null) {
          yield token;
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
