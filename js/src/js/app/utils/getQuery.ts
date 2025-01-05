export default function getQuery(name: string):string {
	let params:any = new URLSearchParams(location.search.slice(1));
	
	return params.get(name);
}