import { createAssertSnapshot } from "@std/testing/snapshot";
import { stringify } from "@std/yaml";
import { Lexer } from "../lexer.ts";

const assertSnapshot = createAssertSnapshot({
  serializer: stringify,
});

Deno.test("tokenizes example file 'omm018.glossa'", async (t) => {
  const source = await Deno.readTextFile("core/corpus/omm018.glossa");
  const lexer = new Lexer(source);
  await assertSnapshot(t, Array.from(lexer.tokens()));
});
