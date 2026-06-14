type Location = {
  line: number;
  column: number;
  offset: number;
};

export enum TokenType {
  Identifier = "IDENTIFIER",

  // Keywords
  Begin = "BEGIN",
  EndProgram = "END_PROGRAM",
  IntegerVariables = "INTEGER_VARIABLES",
  Program = "PROGRAM",
  Read = "READ",
  RealVariables = "REAL_VARIABLES",
  StringVariables = "STRING_VARIABLES",
  Variables = "VARIABLES",
  Write = "WRITE",

  // Literals
  Integer = "INTEGER",
  Real = "REAL",

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
