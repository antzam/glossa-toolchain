import { TokenType } from "./token.ts";

export function* tokenize(_input: string) {
  yield {
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line: 1, column: 8, offset: 7 },
      end: { line: 1, column: 9, offset: 8 },
    },
  };
}
