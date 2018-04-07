require('babel-core/register')({
  nonStandard: process.env.ALLOW_JSX
})

require('./gulpfile.babel.js')
