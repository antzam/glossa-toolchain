import { TokenType } from "./token.ts";

export function* tokenize(input: string) {
  const inputLength = input.length;
  yield {
    type: TokenType.Eof,
    lexeme: "\0",
    location: {
      start: { line: 1, column: inputLength + 1, offset: inputLength },
      end: { line: 1, column: inputLength + 2, offset: inputLength + 1 },
    },
  };
}
