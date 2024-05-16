import Event from "@lib/Event";

export default class Route extends Event {
  static load(path: string) {
    this.invoke("route:load", path);
  }
}

