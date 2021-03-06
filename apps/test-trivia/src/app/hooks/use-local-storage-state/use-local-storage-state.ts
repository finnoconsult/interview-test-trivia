import { useState, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseLocalStorageStateProps {
  key: any;
  defaultValue: string | (() => string);
  ioc?: {
    serialize: (p: any) => string;
    deserialize: (p: string) => any;
  };
}

export function useLocalStorageState({
  key,
  defaultValue = '',
  // the = {} fixes the error we would get from destructuring when no argument was passed
  // Check https://jacobparis.com/blog/destructure-arguments for a detailed explanation
  ioc = { serialize: JSON.stringify, deserialize: JSON.parse },
}: UseLocalStorageStateProps) {
  console.log('key', key);
  const { serialize, deserialize } = ioc;
  const [state, setState] = useState(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      // the try/catch is here in case the localStorage value was set before
      // we had the serialization in place (like we do in previous extra credits)
      try {
        return deserialize(valueInLocalStorage);
      } catch (error) {
        window.localStorage.removeItem(key);
      }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
  });

  const prevKeyRef = useRef(key);

  // Check the example at src/examples/local-state-key-change.js to visualize a key change
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      window.localStorage.removeItem(prevKey);
    }
    prevKeyRef.current = key;
    window.localStorage.setItem(key, serialize(state));
  }, [key, state, serialize]);

  return [state, setState];
}
