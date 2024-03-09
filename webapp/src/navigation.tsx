import { useSearchParams } from "react-router-dom";

export const NO_URL_PARAM_VALUE = "";

type UrlParamKey = string;
type UrlParamValue = string;
type AcceptedValue = string | undefined | null;

interface Args {
  key: UrlParamKey;
}
export function useUrlParam({
  key,
}: Args): [UrlParamValue | undefined, (updated: AcceptedValue) => void] {
  const [urlParams, setUrlParams] = useSearchParams();

  const actualValue = urlParams.get(key);
  const returnedValue = actualValue === null ? undefined : actualValue;

  const setter = (updated: AcceptedValue): void => {
    if (typeof updated !== "string" && updated !== undefined && updated !== null) {
      throw new Error(
        `expected \`updated\` to be a string, an undefined, or a null; but got instead ${typeof updated}`
      );
    }

    const newUrlParams = new URLSearchParams([...urlParams.entries()]);

    if (updated === NO_URL_PARAM_VALUE || updated === undefined || updated === null) {
      newUrlParams.delete(key); // remove it from the URL
    } else {
      newUrlParams.set(key, updated);
    }
    setUrlParams(newUrlParams);
  };

  return [returnedValue, setter];
}
