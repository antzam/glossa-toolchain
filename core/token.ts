type Location = {
  line: number;
  column: number;
  offset: number;
};

export enum TokenType {
  // Punctuation
  LeftParen = "LEFT_PAREN",
  RightParen = "RIGHT_PAREN",
  Colon = "COLON",
  Comma = "COMMA",
  Plus = "PLUS",
  Minus = "MINUS",
  Star = "STAR",
  Slash = "SLASH",

  // Newline
  Eol = "EOL",

  // End of file
  Eof = "EOF",
}

export interface Token {
  type: TokenType;
  lexeme: string;
  location: { start: Location; end: Location };
}
