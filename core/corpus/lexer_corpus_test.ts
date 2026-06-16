import { createAssertSnapshot } from "@std/testing/snapshot";
import { stringify } from "@std/yaml";
import { tokenize } from "../lexer.ts";

const assertSnapshot = createAssertSnapshot({
  serializer: stringify,
});

Deno.test("tokenizes example file 'omm018.glossa'", async (t) => {
  const source = await Deno.readTextFile("core/corpus/omm018.glossa");
  await assertSnapshot(t, Array.from(tokenize(source)));
});
