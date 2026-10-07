/** True when rendered inside the prototype's tablet/mobile preview iframe. */
export const isEmbedded = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

export const ROUTE_MESSAGE = 'evd:route'
