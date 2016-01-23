var express = require('express');
var fs = require('fs');
var router = express.Router();

/**
 * root path of data files
 */
var rootpath = './Data/';

/**
 * gets the root path for the data file
 * @param  {string} filename the name of the file to fetch
 * @return {string}      	 the full file path
 */
function getRootFilePath (filename) {
	return 	rootpath + fileName + '.js';
};

/* GET LegalPortal home page. */
router.get('/', function (req, res) {
	console.log('fetching LegalPortal');
    res.render('legalportal', { title: 'Express' });
    // res.render('ike', { title: 'Express' });
});

/**
 * get all items  for the specified list (:data)
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        filename [description]
 * @return {[type]}      [description]
 */
router.get('/api/:data', function (req, res) {
	var filepath, options;
	var filename = req.params.data + '.js';
	var root = rootpath;
	console.log('file name: ', filename);
	// set the file path - relative to current directory
	// if(req.params.data.indexOf('.') > -1){
	// 	root = './Data/';
	// } else {
	// 	root = rootpath;
	// };	

	options = {
			root: root,
			//dotfiles: 'deny',
			headers: {
			    'x-timestamp': Date.now(),
			    'x-sent': true,
			    'Content-Type': 'application/json'
			}
		};	
	res.sendFile(req.params.data+'.js', options, function (err){
		if (err) { 
			console.log(err);
			res.status(err.status).end();
		} else {
			console.log('sent:', filepath);
		}
	});
});

/**
 * get data item by id
 * @param  {[type]} req  [description]
 * @param  {[type]} res) [description]
 * @return {[type]}      [description]
 */
router.get('/api/:data/:id', function (req, res) {
	var obj;
	// set the file path - relative to current directory
	var filepath = rootpath + req.params.data + '.js';
	console.log('filepath: ', filepath);
	// get the file data
	var data = fs.readFileSync(filepath, 'utf8');
	try{
		console.log('JSON.parse(data)');
		data = JSON.parse(data);
	}catch(e){
		console.log('JSON.parse(data.slice(1, data.length))');
		// strange char prefix - need to remove to make valid json
		data = JSON.parse(data.slice(1, data.length));
	}
	// get the object by id
	if(req.params.data === 'workgroups'){
		obj = data.d.results.filter(function (item){
			return item.Title === req.params.id;
			//return item.name == req.params.id;
		});
	} else {
		obj = data.filter(function (item){
			return item.id == req.params.id;
		});
	}
	res.json(obj).end();
});

/**
 * receive data from HTTP POST action
 * this will save the item object to the persistence store (file)
 * @param  {object} req  request object
 * @param  {object} res  response object
 * @return {object}      a json object
 */
router.post('/api/:data', function (req, res) {
	// set the file path - relative to current directory
	var filepath = rootpath + req.params.data + '.js';

	console.log('req.body: ', req.body);
	var newObj = req.body;

	// get the file data
	var data = fs.readFileSync(filepath, 'utf8');

	//console.log('got data:', data.slice(1, data.length))
	// strange char prefix - need to remove to make valid json
	var items; 
	try {
		items = JSON.parse(data);
	} catch (e) {
		items = JSON.parse(data.slice(1, data.length));
	}
	
	console.log('got items');
	var lastItem = items[items.length-1];
	newObj.id = lastItem.id + 1;
	items.push(newObj);
	// append new object
	console.log('stringify');
	data = JSON.stringify(items); 
	// save the new object
	console.log('writeFile');
	fs.writeFile(filepath, data, function (err) {
	  if (err) throw err;
	  console.log('It\'s saved!');
	});
	// return the new object
	res.json(newObj).end();
});

/**
 * update the specified item in the collection
 * @param  {[type]} req         [description]
 * @param  {[type]} res){		var filepath      [description]
 * @return {[type]}             [description]
 */
router.put('/api/:data/:id', function (req, res){
	// set the file path - relative to current directory
	var filepath = rootpath + req.params.data + '.js';

	// get the file data
	var data = fs.readFileSync(filepath, 'utf8');

	// convert to object
	var items = JSON.parse(data);
	//console.log(items);

	// get new updated object
	var update = req.body;

	// get the item to udpdate
	var originalItem = items.filter(function (i){
		return i.id == req.params.id;
	})[0];

	console.log('originalItem.id: ', originalItem.id);
	console.log('update: ', update);
	// loop through properties to only update changed properties
	Object.keys(update).forEach(function (prop){
		console.log('prop: ', prop);
		if (originalItem[prop] !== update[prop]){
			originalItem[prop] = update[prop];
		}
	});

	data = JSON.stringify(items); 
	// save the new object
	fs.writeFile(filepath, data, function (err) {
	  if (err) throw err;
	  console.log('It\'s saved!');
	});

	// return an empty response
	// which mimics the response from SharePoint
	res.json().end();	
});

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {		var       filepath [description]
 * @return {[type]}      [description]
 */
router.post('/api/search/postquery', function (req, res) {
	// set the file path - relative to current directory
	var filepath = rootpath + 'DocumentSearch.js';

	// get the file data
	data = fs.readFileSync(filepath, 'utf8');

	//console.log('got data:', data.slice(1, data.length))
	// strange char prefix - need to remove to make valid json
	var results; 
	try {
		results = JSON.parse(data);
	} catch (e) {
		results = JSON.parse(data.slice(1, data.length));
	}

	// return the results
	res.json(results).end();
});

/* GET home page. */
router.get('/test', function (req, res) {
    res.render('test', { title: 'Express' });
});

module.exports = router;