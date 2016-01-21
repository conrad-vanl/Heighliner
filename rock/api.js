
import _ from "lodash"
import fetch from "isomorphic-fetch"
import { load } from "../util/cache"

import Path from "path"

let settings = require(Path.join(__dirname, "../.remote/sites/my.newspring.cc/settings.json"))

const api = {
  _: settings.rock
}


/*
  Rock.api.call
 */

api.call = function (method, endpoint, data) {

  function checkStatus(response) {

    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      return {
        status: response.status,
        statusText: response.statusText
      }
    }
  }


  if (!this._.tokenName || !this._.token || !this._.baseURL) {
    throw new Error("Rock api credientials are missing")
  }


  const body = JSON.stringify(data)
  const headers = {
    [this._.tokenName]: this._.token,
    "Content-Type": "application/json"
  }

  const options = {
    method,
    body,
    headers,
    credentials: "same-origin"
  }


  endpoint = this._.baseURL + "api/" + endpoint

  return load(
    endpoint + JSON.stringify(options),
    () => fetch(endpoint, options)
      .then(checkStatus)
      .then((response) => {
        if (response.status === 204) {
          return true
        }

        if (response.json) {
          return response.json()
        }

        return response

      })
      .then((response) => {
        return response
      })
    )

}


api.get = function () {
  let args
  args = _.values(arguments)
  args.unshift("GET")
  return api.call.apply(this, args)
}

api["delete"] = function () {
  let args
  args = _.values(arguments)
  args.unshift("DELETE")
  return api.call.apply(this, args)
}

api.put = function () {
  let args
  args = _.values(arguments)
  args.unshift("PUT")
  return api.call.apply(this, args)
}

api.post = function () {
  let args
  args = _.values(arguments)
  args.unshift("POST")
  return api.call.apply(this, args)
}

api.patch = function () {
  let args
  args = _.values(arguments)
  args.unshift("PATCH")
  return api.call.apply(this, args)

}

const parseEndpoint = (str) => {
  return str.split("\n").map((x) => {
    let trimmed = x.trim()
    if ( trimmed.slice(-3) === "and" ||  trimmed.slice(-2) === "or") {
      trimmed += " "
    }

    return trimmed
  }).join("")
}
api.parseEndpoint = parseEndpoint

export {
  api,
  parseEndpoint,
}
