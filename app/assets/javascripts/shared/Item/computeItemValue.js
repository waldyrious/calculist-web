calculist.register('computeItemValue', ['_','createComputationContextObject','evalculist','findVar'], function (_, createComputationContextObject, evalculist, findVar) {

  'use strict';

  return function (string, item, args) {

    string = string.replace(/\^item/g, function() {
      return '$$item';
    }).replace(/\*item/g, function () {
      return 'global_item';
    }).replace(/\$siblings/g, function() {
      return '$siblings()';
    });

    try {
      if (item.isComputingValue) throw 'infinite loop';
      item.isComputingValue = true;
      var valueContext, variables;
      item.evalFn || (item.evalFn = evalculist(string));
      var val = item.evalFn({
        variable: function (v) {
          item.hasVariableReference = true;
          if (!variables) variables = {};
          if (!variables.hasOwnProperty(v)) {
            variables[v] = (args && args.hasOwnProperty(v)) ? args[v] : findVar(item, v);
            // console.log(v, variables[v]);
          }
          if (variables.hasOwnProperty(v) && variables[v] != null) return variables[v];
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext[v];
        },
        accessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          return valueContext.accessor(obj, attr);
        },
        dotAccessor: function (obj, attr) {
          if (!valueContext) valueContext = createComputationContextObject(item);
          var val = valueContext.dotAccessor(obj, attr);
          if (val === item) return NaN;
          return val;
        }
      });
      item.isComputingValue = false;
      if (val == null) {
        return NaN;
      } else if (_.isArray(val)) {
        return val;
      } else {
        return _.isNaN(+val) ? val : +val;
      }
    } catch (e) {
      item.isComputingValue = false;
      return NaN;
    }

  };
});
