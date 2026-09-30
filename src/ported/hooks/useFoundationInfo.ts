import { usePageSettings } from "./usePageSettings";
import { FOUNDATION_INFO } from "../data/foundationData";

export type FoundationInfo = typeof FOUNDATION_INFO;

export function useFoundationInfo() {
  return usePageSettings<FoundationInfo>("foundation", FOUNDATION_INFO);
}
