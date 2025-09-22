declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: Record<string, Map<any, any> | (() => any)>
  }
}

export declare const disableDevTools: () => void

export {}
