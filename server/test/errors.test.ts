import assert from "node:assert";
import test from "node:test";
import { parseErrors } from "../src/errors.js";

test("parseErrors", () => {
  const markers = parseErrors(chunks, source);
  assert.deepStrictEqual(markers, [
    {
      message: "Missing close quote",
      startLineNumber: 10,
      startColumn: 16,
      endLineNumber: 10,
      endColumn: 16,
    },
    {
      message: "Missing close quote",
      startLineNumber: 11,
      startColumn: 26,
      endLineNumber: 11,
      endColumn: 26,
    },
    {
      message: "Expected a TopLevel here",
      startLineNumber: 11,
      startColumn: 5,
      endLineNumber: 11,
      endColumn: 26,
    },
    {
      message: "Expected subtype of Int, but got Rectangle",
      startLineNumber: 20,
      startColumn: 5,
      endLineNumber: 23,
      endColumn: 2,
    },
  ]);
});

// Use formatting to make it easy to count chars in editor.
const width = "${width}";
const height = "${height}";
const rectangle = "${rectangle}";
const rectangle_area__ = "${rectangle.area()}";
const source = `
export class Rectangle(
  public width: Float64,
  public height: Float64,
) {
  public area(): Float64 {
    width * height
  }

  public toString(): String {
    "Rectangle:
    ${width} x ${height}"
  }
}

let fly(i: Int): Int { i }

let rectangle = { width: 1.5, height: 2.0 };
console.log("${rectangle}");
console.log("Area: ${rectangle_area__}");
fly({
  width: 1.5,
  height: 2.0,
});
`.trim();

const chunks = [
  "Watch starting build #1 at 2025-05-19T22:38:33.277Z\r\n",
  '10: "Rectangle:\r\n',
  "               ?\r\n" +
    "[-work/src/work.temper+175]: Missing close quote\r\n" +
    '11: {width} x ${height}"\r\n' +
    "                        ?\r\n" +
    "[-work/src/work.temper+201]: Missing close quote\r\n",
  '11: ${width} x ${height}"\r\n',
  "    ?????????????????????\r\n" +
    "[-work/src/work.temper:11+4-25]@P: Expected a TopLevel here\r\n",
  "   ??????\r\n",
  "20:?fly({\r\n" +
    "21:?  width: 1.5,\r\n" +
    "22:?  height: 2.0,\r\n" +
    "23:?});\r\n" +
    "   ??\r\n" +
    "[-work/src/work.temper:20+4 - 23+1]@G: Expected subtype of Int, but got Rectangle\r\n",
  "Finished build #1 in 1.522s\r\n",
];
