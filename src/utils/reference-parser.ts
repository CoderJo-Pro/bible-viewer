import { bcv_parser } from "bible-passage-reference-parser/esm/bcv_parser"
import * as en from "bible-passage-reference-parser/esm/lang/en"

export { bcv_parser }
export function parse(text: string): bcv_parser {
  return new bcv_parser(en).parse(text)
}
