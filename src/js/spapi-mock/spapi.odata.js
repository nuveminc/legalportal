/********************************/
/* spapi-mock/spapi.odata.js */
/********************************/

/**
 * @description
 *  OData filter object which allows for complex OData queries using
 *  javascript chaining syntax. This object implements the operators defined in the
 *  SharePoint OData spec: http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx#sectionSection0
 *  TODO: string comparisons have not been implemented (don't have an immediate need for this feature)
 *  Usage: a couple of requirements when using this object.
 *      - create a new object
 *          var odf = new ODataFilter;
 *      - all comparison (filter) queries must begin with the 'where' clause unless it's a different selector (e.g. orderby, select, top, etc.)
 *          odf.where([column name]).[eq|neq|lt|le|gt|ge]([value]).[and|or]([value]);
 *      - the 'where' clause can only be used once to begin a query
 *      - can also use just a selector
 *          odf.[top|orderBy|select|expand]([value]);
 *      - selectors can be used both to begin (above) and end a query
 *          odf.where('Team').eq('eCP').top(10).orderBy('Id').desc();
 *          to retrive the query string use odf.getQuery();
 */
function ODataFilter() {
    var self = this,
    // error message
        ERR_VALUE_REQUIRED = 'value required for \'{0}\' clause',
    // declare clause types - didn't include string comparisons
        clauseTypes = ['eq', 'neq', 'lt', 'le', 'gt', 'ge', 'and', 'or', 'orderBy', 'datetime', 'top', 'skip', 'select', 'expand'],
    // clause functions called to generate filter string
        clauseFns = {},
    // array of clauses created by user
        clauses = [],
    // could clean these fn's up by allowing recursion rather than using new fn's
    // ascending/descending clause function
        ascDescFn = function (t) {
            return function () {
                if (!t) throw new Error(ERR_VALUE_REQUIRED.format(ct));
                var opts = {
                    top: clauseFn('top'),
                    skip: clauseFn('skip')
                };
                clauses.push({ condition: 'dir', value: t });
                return opts;
            }
        },
    // orderby clause function
        orderByFn = function (ct) {
            return function (value) {
                if (!value) throw new Error(ERR_VALUE_REQUIRED.format(ct));
                var dir = {
                    asc: ascDescFn('asc'),
                    desc: ascDescFn('desc'),
                };
                clauses.push({ condition: ct, value: value });
                return dir;
            }
        },
    // generic function for all other clauses
        clauseFn = function (ct) {
            return function (value) {
                if (!value && ct !== 'datetime') throw new Error(ERR_VALUE_REQUIRED.format(ct));
                clauses.push({ condition: ct, value: value });
                return clauseFns;
            }
        };
    // expose these as root level clauses
    self.top = clauseFn('top');
    self.skip = clauseFn('skip');
    self.select = clauseFn('select');
    self.expand = clauseFn('expand');
    self.orderBy = orderByFn('orderBy');
    // where is a special case and is only used once in a filter
    self.where = clauseFn('where');

    // generates the query by evaluating the clauses and their values
    self.getQuery = function () {
        var filter = '', dtPrefix = '';
        var query = '?', concat = '&';
        for (var i = 0; i < clauses.length; i++) {
            var clause = clauses[i];
            switch (clause.condition) {
                case 'where':
                    var n = (clauses.length > 1 && i > 0) ? concat : query;
                    if (clause.value !== '') {
                        filter += '{0}$filter={1}'.format(n, clause.value);
                    }
                    break;
                case 'and':
                case 'or':
                    filter += ' {0} {1}'.format(clause.condition, clause.value);
                    break;
                case 'dir':
                    filter += ' {0}'.format(clause.value);
                    break;
                case 'top':
                case 'skip':
                case 'select':
                case 'expand':
                case 'orderBy':
                    var n = (clauses.length > 1) ? concat : query;
                    filter += '{0}${1}={2}'.format(n, clause.condition, clause.value);
                    break;
                case 'datetime':
                    var dtPrefix = 'datetime';
                    break;
                default:
                    if (typeof clause.value === 'string') {
                        filter += ' {0} {1}\'{2}\''.format(clause.condition, dtPrefix, clause.value);
                        dtPrefix = '';
                    } else {
                        filter += ' {0} {1}'.format(clause.condition, clause.value);
                    }
                    break;
            }
        }
        return filter;
    };
    // initialize the filter API
    // generating available clauses
    for (var c = 0; c < clauseTypes.length; c++) {
        var clauseType = clauseTypes[c];
        if (clauseType === 'orderBy') {
            clauseFns[clauseType] = orderByFn(clauseType);
        } else {
            clauseFns[clauseType] = clauseFn(clauseType);
        }
    }
    clauseFns['getQuery'] = self.getQuery;
};

