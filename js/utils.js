// check if array or object is empty
export const isEmpty = x => {
    if (Array.isArray(x)) return !x.length
    for (const key in x) {
      if (x.hasOwnProperty(key)) return false
    }
    return true
}

// fetch JSON data, return null on error
export const fetchJSON = url => fetch(url).then(res => res.ok ? res.json() : null)

