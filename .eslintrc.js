module.exports = {
  'extends': ['standard'],
  rules: {
    'no-labels': ['error', {
      'allowLoop': true
    }]
  },
  'plugins': [],
  'env': {
    'browser': true,
    'node': true,
    'jquery': true,
    'jest': true
  }
}
