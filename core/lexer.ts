import type { Token } from "./token.ts";
import { TokenType } from "./token.ts";

export function* tokenize(input: string) {
  let line = 1;
  let column = 1;
  let offset = 0;

  const MATCHERS = [
    {
      regexp: /^[ \t]+/,
      handler: (match: RegExpExecArray): null => {
        column += match[0].length;
        offset += match[0].length;

        return null;
      },
    },
    {
      regexp: /^\r\n|\r|\n/,
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
            end: { line: line, column: column, offset: offset },
          },
        };
      },
    },
  ];

  while (input.length > 0) {
    let matched = false;
    for (const matcher of MATCHERS) {
      const match = matcher.regexp.exec(input);
      if (match !== null) {
        matched = true;

        const token = matcher.handler(match);
        if (token !== null) {
          yield token;
        }

        input = input.slice(match[0].length);
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
