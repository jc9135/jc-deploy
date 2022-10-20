#!/usr/bin/env node

const JcDeploy = require('../index.js')

module.exports = function start(args) {
  let jcDeploy = new JcDeploy()

  jcDeploy.start(args)
}
