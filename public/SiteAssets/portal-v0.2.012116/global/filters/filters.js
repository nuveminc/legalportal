
angular.module('portal.filters', [])

    /**
     * truncates text to the length (limit) specified
     * @param  {string}     input string                   
     * @param  {string}     limit of string (truncate)                  
     * @return {int}        truncated string
     */
    .filter('truncate', function () {
        return function (input, limit) {
            if (typeof input !== 'undefined' && input !== null) {
                if (input.length > limit) {
                    input = input.substring(0, limit) + ' ...';
                }
            }
            return input;
        };
    })   
    .filter('noTitle', function(){
        return function(input){
            if ((input == null) || (input == '')){
                input = 'No Title Entered'
            }
            return input;       
        } 
    })
   .filter('noDescription', function(){
        return function(input){
            if ((input == null) || (input == '')|| (input == 'null')){
                input = 'No Description Entered'
            }
            return input;       
        } 
    })

    /*  WORKGROUP VIEW FILTERS */
    .filter('removeUnderscore', function () {
        return function (text) {
            if (typeof text === 'string') {
                text = text.replace(/_/g, ' ');
            }
            return text;
        }
    })
    .filter('addUnderscore', function () {
        return function (text) {
            if (typeof text === 'string') {
                text = text.replace(/ /g, '_');
            }
            return text;
        }
    })   
    .filter('parseUnixEpoch', function () {
        return function (date) {
            if (typeof date === 'string') {
                if (date.indexOf('Date') > -1) {
                    date = parseInt(date.match(/\d+/)[0]);
                }
            }
            return date;
        }
    })
    .filter('formatDate', function () {
        return function (input, format){
            return moment.format(format);
        }
    })
    .filter('dayDateTime', function () {
        return function (unixEpoch) {
            var longFormat = 'ddd, MMM D, YYYY, h:mm a';
            if (parseInt(unixEpoch)) {
                return moment.utc(unixEpoch).format(longFormat);
            } else {
                output = new Date(unixEpoch);
                return moment.utc(output).format(longFormat);
            }
        }
    })
    .filter('blogDateTime', function () {
        return function (unixEpoch) {
            var longFormat = 'ddd, MMM D, YYYY, h:mm a';
            if (parseInt(unixEpoch)) {
                return moment(unixEpoch).format(longFormat);
            } else {
                output = new Date(unixEpoch);
                return moment(output).format(longFormat);
            }
        }
    })     
    .filter('time', function () {
        return function (unixEpoch) {
            unixEpoch = (typeof unixEpoch === 'string') ? parseInt(unixEpoch) : unixEpoch;
            return moment.utc(unixEpoch).format('h:mm a');
        }
    })        
    // .filter('eventDate', function () {
    //     return function (unixEpoch) {
    //         unixEpoch = (typeof unixEpoch === 'string') ? parseInt(unixEpoch) : unixEpoch;
    //         return moment.utc(unixEpoch).format('ddd, MMMM D, YYYY h:mm a');
    //     }
    // })

    // .filter('eventDateTime', function () {
    //     return function (unixEpoch) {
    //         var longFormat = 'ddd, MMM D, YYYY, h:mm a';
    //         if (parseInt(unixEpoch)) {
    //             return moment.utc(unixEpoch).format(longFormat);
    //         } else {
    //             output = new Date(unixEpoch);
    //             return moment(output).format(longFormat);
    //         }
    //     }
    // })
    .filter('eventDatePickerModal', function () {
        return function (unixEpoch) {
            unixEpoch = (typeof unixEpoch === 'string') ? parseInt(unixEpoch) : unixEpoch;
            output = moment.utc(unixEpoch).format('MMMM D, YYYY, h:mm a');
            return output;
        }
    })
    .filter('toEpochLocal', function () {
        return function (inputDate) {
            var localEpoch = moment(parseInt(inputDate)).format('X') * 1000;
            return moment(localEpoch).format('X');
        }
    })

    .filter('datepickerDateTime', function () {
        return function (input) {
            output = moment(input).format('MMMM Do YYYY, h:mm a');
            return output;
        }
    })
    
    // filters out any number character references e.g. &#58; as ':'
    // ascii conversion: html numeric character reference coding to alpha character
    .filter('getCharCode', function(){
        return function(input){
                // regex to find pattern
            var reNumCharRef = /(&#\d+;)/,
                // regex to filter the digits &#58; = 58
                // converts html char to dec char
                reCharCode = /(\d+)/g,
                // replacement function to perform on each match group
                replaceNumCharRef = function(){
                // spec says function passed arguments as group
                // the last two args are index & original string
                // loop through these to get each match group
                for(var i = 0; i < arguments.length - 2; i++) {
                    // get the charCode e.g. 58 from the match group
                    var charCode = reCharCode.exec(arguments[i]);
                    // strange bug? we have multiple groups, but only one will filter out?
                    if(charCode){
                        // return the character from the code
                        return String.fromCharCode(parseInt(charCode));
                    }
                }
            };
            // return the filtered string     
            return input.replace(reNumCharRef, replaceNumCharRef);      
        }    
    })
    
    // filters out the html tags from string and returns text
    .filter('HTMLToText', function(){
        return function(input){
            var html = input;
            var div = document.createElement('div');
            div.innerHTML = html;
            var text = div.textContent || div.innerText || '';  
            input = text;
            return input;       
        } 
    });