// gen a simple unique id.
export default (prefix = 'u_') => {
  return `${prefix}${Math.trunc(Math.random() * Math.pow(10, 10)).toString(16)}`
}
