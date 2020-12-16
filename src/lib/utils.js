// fetch JSON data, return null on error
export const fetchJSON = url => fetch(url).then(res => res.ok ? res.json() : null)
