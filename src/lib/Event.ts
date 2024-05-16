export interface EventList {
  [key: string]: Function[];
}

export default class Event {
  // Listeners
  static eventListeners: EventList = {};

  /**
   * Adds Event-Listener
   * @param {string} event - Event name/key
   * @returns {void}
   */
  static on(event: any, listener: any) {
    // No listener added to event
    if (this.eventListeners[event]) this.eventListeners[event].push(listener);
    // Event already contains Listener
    else this.eventListeners[event] = [listener];
  }

  /**
   * Notifies Listeners
   *
   * @param {string} event Event name/key
   * @param {object} data Optional data passed to listener
   * @returns {void}
   */
  static invoke(event: any, ...data: any[]) {
    // Check if listener exists
    if (this.eventListeners[event]) {
      // Loop through listeners
      this.eventListeners[event].forEach((listener: any) => {
        if (data) listener(...data);
        else listener();
      });
    }
  }

  /**
   * Notifies Listeners
   *
   * @param {string} event Event name/key
   * @returns {void}
   */
  static off(event: any, listener?: any) {
    // Check if listener exists
    if (this.eventListeners[event]) {
      if (listener) {
        let index = this.eventListeners[event].indexOf(listener);
        if (index !== -1) this.eventListeners[event].splice(index, 1);
      } else {
        delete this.eventListeners[event];
      }
    }
  }
}
