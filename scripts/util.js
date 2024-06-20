export function unquoteKeys (json) {
  return json.replace(/"([a-zA-Z]+)":/g, '$1: ')
}
