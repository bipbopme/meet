import _shuffle from "lodash/shuffle";
import shortuuid from "short-uuid";

export function uuid(): string {
  // Get a UUID encoded with an unambiguous character set
  let uuid = shortuuid("123456789abcdefghijkmnopqrstuvwxyz").generate();

  // We only want 11 characters to improve usability.
  // Select them randomly (may not be necessary).
  uuid = _shuffle(uuid.split("")).join("").slice(0, 11);

  // Format the final UUID: xxxx-xxx-xxxx
  uuid = uuid.replace(/(.{4})(.{3})(.{4})/, "$1-$2-$3");

  return uuid;
}

export function vercelTraceToRegion(trace: string): string {
  const defaultRegion = "nyc";
  const regionMap: { [key: string]: string } = {
    arn1: "ams",
    bom1: "ams",
    bru1: "ams",
    cdg1: "ams",
    chs1: "nyc",
    cle1: "nyc",
    dub1: "ams",
    gru1: "nyc",
    hel1: "ams",
    hkg1: "sfo",
    hnd1: "sfo",
    iad1: "nyc",
    icn1: "sfo",
    lax1: "sfo",
    lhr1: "ams",
    oma1: "nyc",
    pdx1: "sfo",
    sfo1: "sfo",
    sin1: "sfo",
    syd1: "sfo",
    tpe1: "sfo",
    yul1: "nyc",
    zrh1: "ams"
  };

  return regionMap[trace] || defaultRegion;
}

export function getElementPath(element: Element, parentElements: Element[] = []): Element[] {
  parentElements.push(element);

  return element.parentElement
    ? getElementPath(element.parentElement, parentElements)
    : parentElements;
}

export function isTouchEnabled(): boolean {
  return "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
}
