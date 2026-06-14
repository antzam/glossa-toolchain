type Location = {
  line: number;
  column: number;
  offset: number;
};

export enum TokenType {
  Eol = "EOL",
  Eof = "EOF",
}

export interface Token {
  type: TokenType;
  lexeme: string;
  location: { start: Location; end: Location };
}
