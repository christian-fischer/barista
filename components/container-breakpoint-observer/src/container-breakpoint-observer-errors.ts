export function getDtContainerBreakpointObserverInvalidQueryError(
  query: string,
): Error {
  return Error(
    `The provided query "${query}" is not valid. ` +
      `Make sure to your query is wrapped in brackets. Only min and max queries are supported`,
  );
}

export function getNoDtContainerBreakpointObserverError(): Error {
  return Error(
    `No dt-container-breakpoint-observer is set as a parent element for the dtIfContainerBreakpoint!`,
  );
}