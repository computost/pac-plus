import {
  getFetch as externalGetFetch,
  getWebApi as externalGetWebApi,
} from "xrm-webapi-node";
import { ClientCredentials } from "xrm-webapi-node/dist/types/ClientCredentials";
import { Fetch } from "xrm-webapi-node/dist/types/methods/Fetch";
import { WebApi } from "xrm-webapi-node/dist/types/WebApi";

const apiMap: Map<Key, Value> = new Map();

export function getApi(...args: Key): Value {
  const value = apiMap.get(args);
  if (value) {
    return value;
  } else {
    const fetch = externalGetFetch(...args);
    const webApi = externalGetWebApi(fetch);
    const value = { fetch, webApi };
    apiMap.set(args, value);
    return value;
  }
}

type Key = [url: string, credentials: ClientCredentials];
type Value = { fetch: Fetch; webApi: WebApi };
