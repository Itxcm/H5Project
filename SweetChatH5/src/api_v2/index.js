// import apiList from './api'

// const install = function(Vue) {
//   if (install.installed) return
//   install.installed = true
//   Object.defineProperties(Vue.prototype, {
//     $api: {
//       get() {
//         return apiList
//       }
//     }
//   })
// }

// export default {
//   install
// }

// import fetch from './fetch'
let apiSource = {}
function initApi(argu) {
  const apiContext = require.context('./modules/', true, /\.js$/)
  let apiList = []

  apiContext.keys().forEach(api => {
    const apiModle = apiContext(api)
    apiList = { ...apiList, ...(apiModle.default || apiModle) }
  })
  apiSource = apiList
  return apiList
}
let apiList = initApi()
let api = { ...apiList }
const Api = function(Vue) {
  if (Api.installed) return
  Api.installed = true
  Object.defineProperties(Vue.prototype, {
    $api: {
      get() {
        return api
      }
    }
  })
}
export { api, Api, apiSource }
