import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void) {
  const mediaQueryList = window.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
  )

  mediaQueryList.addEventListener("change", callback)

  return () => mediaQueryList.removeEventListener("change", callback)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
