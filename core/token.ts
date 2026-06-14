type Location = {
  line: number;
  column: number;
  offset: number;
};

enum TokenType {
  Eof = "EOF",
}

export interface Token {
  type: TokenType;
  lexeme: string;
  location: { start: Location; end: Location };
}
