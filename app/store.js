const store = {
  get(key) {
    const value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  delete(key) {
    localStorage.removeItem(key);
  }
};

export default store;
