import { Uris } from "./constants";

/*
 *
 */
async function track(data: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/segment-track', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}


export default {
  track,
};
