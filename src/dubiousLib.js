module.exports = [
  `const TOKEN_KEY = 'token';
  
  const isLogin = () => {
    return !!localStorage.getItem(TOKEN_KEY);
  };
  
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };
  
  const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  };
  
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
  };
  
  export { isLogin, getToken, setToken, clearToken };`,
  `
  import mitt from 'mitt';
  import type { RouteLocationNormalized } from 'vue-router';
  
  const emitter = mitt();
  const key = Symbol('ROUTE_CHANGE');
  
  let latestRoute;
  
  export function setRouteEmitter(to) {
    emitter.emit(key, to);
    latestRoute = to;
  }
  
  const opt = Object.prototype.toString;

export function isArray(obj: any): obj is any[] {
  return opt.call(obj) === '[object Array]';
}

export function isObject(obj: any): obj is { [key: string]: any } {
  return opt.call(obj) === '[object Object]';
}

export function isString(obj: any): obj is string {
  return opt.call(obj) === '[object String]';
}

export function isNumber(obj: any): obj is number {
  return opt.call(obj) === '[object Number]' && obj === obj; // eslint-disable-line
}

export function isRegExp(obj: any) {
  return opt.call(obj) === '[object RegExp]';
}

export function isFile(obj: any): obj is File {
  return opt.call(obj) === '[object File]';
}

export function isBlob(obj: any): obj is Blob {
  return opt.call(obj) === '[object Blob]';
}

export function isUndefined(obj: any): obj is undefined {
  return obj === undefined;
}

export function isNull(obj: any): obj is null {
  return obj === null;
}

export function isFunction(obj: any): obj is (...args: any[]) => any {
  return typeof obj === 'function';
}

export function isEmptyObject(obj: any): boolean {
  return isObject(obj) && Object.keys(obj).length === 0;
}

export function isExist(obj: any): boolean {
  return obj || obj === 0;
}

export function isWindow(el: any): el is Window {
  return el === window;
}

  export function listenerRouteChange(handler, immediate = true) {
    emitter.on(key, handler);
    if (immediate && latestRoute) {
      handler(latestRoute);
    }
  }
  
  export function removeRouteListener() {
    emitter.off(key);
  }
  `,
];
