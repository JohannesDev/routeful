// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Direction {
  routes: Route[];
}

export interface Route {
  arrival_time: Date;
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: string[];
  waypoint_order: any[];
}

export interface Bounds {
  northeast: Northeast;
  southwest: Northeast;
}

export interface Northeast {
  lat: number;
  lng: number;
}

export interface Leg {
  arrival_time: Time;
  departure_time: Time;
  distance: Distance;
  duration: Distance;
  end_address: string;
  end_location: Northeast;
  start_address: string;
  start_location: Northeast;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

export interface Time {
  text: string;
  time_zone: TimeZone;
  value: number;
}

export enum TimeZone {
  EuropeVienna = "Europe/Vienna",
}

export interface Distance {
  text: string;
  value: number;
}

export interface Step {
  distance: Distance;
  duration: Distance;
  end_location: Northeast;
  html_instructions: string;
  polyline: Polyline;
  start_location: Northeast;
  steps?: Step[];
  travel_mode: TravelMode;
  transit_details?: TransitDetails;
  maneuver?: string;
}

export interface Polyline {
  points: string;
}

export interface TransitDetails {
  arrival_stop: Stop;
  arrival_time: Time;
  departure_stop: Stop;
  departure_time: Time;
  headsign: string;
  line: Line;
  num_stops: number;
}

export interface Stop {
  location: Northeast;
  name: string;
}

export interface Line {
  agencies: Agency[];
  color: string;
  name: string;
  short_name: string;
  text_color?: string;
  vehicle: Vehicle;
}

export interface Agency {
  name: string;
  phone: string;
  url: string;
}

export interface Vehicle {
  icon: string;
  local_icon: string;
  name: string;
  type: string;
}

export enum TravelMode {
  Transit = "TRANSIT",
  Walking = "WALKING",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toWelcome(json: string): Welcome {
    return cast(JSON.parse(json), r("Welcome"));
  }

  public static welcomeToJson(value: Welcome): string {
    return JSON.stringify(uncast(value, r("Welcome")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : "";
  const keyText = key ? ` for key "${key}"` : "";
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val
    )}`
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(", ")}]`;
    }
  } else if (typeof typ === "object" && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = "",
  parent: any = ""
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l("Date"), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== "object" || Array.isArray(val)) {
      return invalidValue(l(ref || "object"), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === "object" && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
    return typ.hasOwnProperty("unionMembers")
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty("arrayItems")
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty("props")
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Welcome: o([{ json: "routes", js: "routes", typ: a(r("Route")) }], false),
  Route: o(
    [
      { json: "arrival_time", js: "arrival_time", typ: Date },
      { json: "bounds", js: "bounds", typ: r("Bounds") },
      { json: "copyrights", js: "copyrights", typ: "" },
      { json: "legs", js: "legs", typ: a(r("Leg")) },
      {
        json: "overview_polyline",
        js: "overview_polyline",
        typ: r("Polyline"),
      },
      { json: "summary", js: "summary", typ: "" },
      { json: "warnings", js: "warnings", typ: a("") },
      { json: "waypoint_order", js: "waypoint_order", typ: a("any") },
    ],
    false
  ),
  Bounds: o(
    [
      { json: "northeast", js: "northeast", typ: r("Northeast") },
      { json: "southwest", js: "southwest", typ: r("Northeast") },
    ],
    false
  ),
  Northeast: o(
    [
      { json: "lat", js: "lat", typ: 3.14 },
      { json: "lng", js: "lng", typ: 3.14 },
    ],
    false
  ),
  Leg: o(
    [
      { json: "arrival_time", js: "arrival_time", typ: r("Time") },
      { json: "departure_time", js: "departure_time", typ: r("Time") },
      { json: "distance", js: "distance", typ: r("Distance") },
      { json: "duration", js: "duration", typ: r("Distance") },
      { json: "end_address", js: "end_address", typ: "" },
      { json: "end_location", js: "end_location", typ: r("Northeast") },
      { json: "start_address", js: "start_address", typ: "" },
      { json: "start_location", js: "start_location", typ: r("Northeast") },
      { json: "steps", js: "steps", typ: a(r("Step")) },
      { json: "traffic_speed_entry", js: "traffic_speed_entry", typ: a("any") },
      { json: "via_waypoint", js: "via_waypoint", typ: a("any") },
    ],
    false
  ),
  Time: o(
    [
      { json: "text", js: "text", typ: "" },
      { json: "time_zone", js: "time_zone", typ: r("TimeZone") },
      { json: "value", js: "value", typ: 0 },
    ],
    false
  ),
  Distance: o(
    [
      { json: "text", js: "text", typ: "" },
      { json: "value", js: "value", typ: 0 },
    ],
    false
  ),
  Step: o(
    [
      { json: "distance", js: "distance", typ: r("Distance") },
      { json: "duration", js: "duration", typ: r("Distance") },
      { json: "end_location", js: "end_location", typ: r("Northeast") },
      { json: "html_instructions", js: "html_instructions", typ: "" },
      { json: "polyline", js: "polyline", typ: r("Polyline") },
      { json: "start_location", js: "start_location", typ: r("Northeast") },
      { json: "steps", js: "steps", typ: u(undefined, a(r("Step"))) },
      { json: "travel_mode", js: "travel_mode", typ: r("TravelMode") },
      {
        json: "transit_details",
        js: "transit_details",
        typ: u(undefined, r("TransitDetails")),
      },
      { json: "maneuver", js: "maneuver", typ: u(undefined, "") },
    ],
    false
  ),
  Polyline: o([{ json: "points", js: "points", typ: "" }], false),
  TransitDetails: o(
    [
      { json: "arrival_stop", js: "arrival_stop", typ: r("Stop") },
      { json: "arrival_time", js: "arrival_time", typ: r("Time") },
      { json: "departure_stop", js: "departure_stop", typ: r("Stop") },
      { json: "departure_time", js: "departure_time", typ: r("Time") },
      { json: "headsign", js: "headsign", typ: "" },
      { json: "line", js: "line", typ: r("Line") },
      { json: "num_stops", js: "num_stops", typ: 0 },
    ],
    false
  ),
  Stop: o(
    [
      { json: "location", js: "location", typ: r("Northeast") },
      { json: "name", js: "name", typ: "" },
    ],
    false
  ),
  Line: o(
    [
      { json: "agencies", js: "agencies", typ: a(r("Agency")) },
      { json: "color", js: "color", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "short_name", js: "short_name", typ: "" },
      { json: "text_color", js: "text_color", typ: u(undefined, "") },
      { json: "vehicle", js: "vehicle", typ: r("Vehicle") },
    ],
    false
  ),
  Agency: o(
    [
      { json: "name", js: "name", typ: "" },
      { json: "phone", js: "phone", typ: "" },
      { json: "url", js: "url", typ: "" },
    ],
    false
  ),
  Vehicle: o(
    [
      { json: "icon", js: "icon", typ: "" },
      { json: "local_icon", js: "local_icon", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "type", js: "type", typ: "" },
    ],
    false
  ),
  TimeZone: ["Europe/Vienna"],
  TravelMode: ["TRANSIT", "WALKING"],
};
