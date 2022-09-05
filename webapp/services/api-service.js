import { Uris } from "./constants";

export async function getPatientLists() {
	try {
		const url = Uris.backendRoot + '/patient-list';
		console.log('url', url);
		
		return await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then((r) => r.json());
	} catch (e) {
		console.log('e', e);
		return []
	}
	
}
