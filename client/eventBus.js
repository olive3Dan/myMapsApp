class EventBus {
    constructor() {
      this.events = {};
    }
  
    on(event, listener) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(listener);
    }
  
    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  
    emit(event, detail) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(detail));
    }
  }
  window.eventBus = new EventBus();
  export default EventBus;
