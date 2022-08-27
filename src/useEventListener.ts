import * as React from "react";

// https://github.com/foray1010/use-typed-event-listener/blob/master/src/index.ts

function useEventListener<KD extends keyof DocumentEventMap>(
  element: Document | null | undefined,
  eventType: KD,
  listener: (this: Document, evt: DocumentEventMap[KD]) => void,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener<KH extends keyof HTMLElementEventMap>(
  element: HTMLElement | null | undefined,
  eventType: KH,
  listener: (this: HTMLElement, evt: HTMLElementEventMap[KH]) => void,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener<KW extends keyof WindowEventMap>(
  element: Window | null | undefined,
  eventType: KW,
  listener: (this: Window, evt: WindowEventMap[KW]) => void,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener(
  element: Document | HTMLElement | Window | null | undefined,
  eventType: string,
  listener: (evt: Event) => void,
  options?: boolean | AddEventListenerOptions
): void;

function useEventListener<
  KD extends keyof DocumentEventMap,
  KH extends keyof HTMLElementEventMap,
  KW extends keyof WindowEventMap
>(
  element: Document | HTMLElement | Window | null | undefined,
  eventType: KD | KH | KW | string,
  listener: (
    this: typeof element,
    evt:
      | DocumentEventMap[KD]
      | HTMLElementEventMap[KH]
      | WindowEventMap[KW]
      | Event
  ) => void,
  options?: boolean | AddEventListenerOptions
): void {
  const listenerRef = React.useRef(listener);
  listenerRef.current = listener;

  React.useEffect(() => {
    if (!element) return;

    // to avoid keep updating listener in DOM
    const wrappedListener: typeof listenerRef.current = (evt) =>
      listenerRef.current.call(element, evt);

    element.addEventListener(eventType, wrappedListener, options);

    return () => {
      element.removeEventListener(eventType, wrappedListener, options);
    };
  }, [element, eventType, options]);
}

export default useEventListener;
