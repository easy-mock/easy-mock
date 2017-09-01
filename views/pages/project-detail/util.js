import jsBeautify from 'js-beautify/js/lib/beautify'

const formatParamModel = (value) => {
  const newValue = Object.assign({}, value)
  delete newValue._id_
  function _formatParamModel (value) {
    Object.keys(value).forEach((key) => {
      const model = value[key]
      if (typeof model === 'string') {
        // #/definitions/user => user
        value[key] = model[0] === '#' ? model.split('/').slice(-1)[0] : model
      } else {
        _formatParamModel(model)
      }
    })
  }
  _formatParamModel(newValue)
  return newValue
}

const formatJavaScriptModel = (value) => {
  const model = formatParamModel(value)
  const getProperties = (key, obj) => {
    let value
    switch (obj.type) {
      case 'integer':
      case 'number':
        value = `this.${key} = 0;`
        break
      case 'array':
        value = `this.${key} = [];`
        break
      case 'boolean':
        value = `this.${key} = false;`
        break
      default:
        value = `this.${key} = '';`
        break
    }
    return obj.description ? `${value} // ${obj.description}\n` : value
  }

  const className = value._id_ || 'Response Root'
  const properties = Object.keys(model)
    .map(key => getProperties(key, model[key])).join('')
  const str = `class ${className} {
    constructor() {${properties}}}`
  return jsBeautify.js_beautify(str, { indent_size: 2 })
}

const formatObjectiveCModel = (value) => {
  const model = formatParamModel(value)
  const getProperties = (key, obj) => {
    let value
    switch (obj.type) {
      case 'integer':
      case 'number':
        value = `@property (nonatomic, strong) NSNumber *${key};`
        break
      case 'array':
        value = `@property (nonatomic, copy) NSArray *${key};`
        break
      case 'boolean':
        value = `@property (nonatomic, assign) BOOL ${key};`
        break
      default:
        value = `@property (nonatomic, copy) NSString *${key};`
        break
    }
    return value + '\n'
  }

  const className = value._id_ || 'Response Root'
  const properties = Object.keys(model)
    .map(key => getProperties(key, model[key])).join('')
  return `@interface ${className} : NSObject\n\n${properties}\n@end`
}

export {
  formatParamModel,
  formatJavaScriptModel,
  formatObjectiveCModel
}
