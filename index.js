const JobstreetScanner = require('./class/JobstreetScanner');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/scanner', (req, res) => {
	//	set default property and value (if keyword parameter not exist)
	if(!req.query.keyword)
		req.query.keyword = "";
	
	let scanner = new JobstreetScanner(req.query);	

	scanner.fetchData()
		.then(json => {
			res.json(json);
			res.end();
		});
});

app.listen(port, () => 
	console.log(`Jobstreet Scanner app listening on port ${port}`)
);