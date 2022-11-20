const JobstreetScanner = require('./class/JobstreetScanner');
const JobstreetAnalysis = require('./class/JobstreetAnalysis');
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
		.then(data => {
			let analysis = new JobstreetAnalysis(data);
			/*
			let json = {
				source: data, 
				analysis: analysis
			}

			console.log(analysis);
			res.json(json);
			*/

			console.log(analysis);
			res.json(analysis);
			res.end();
		});
});

app.listen(port, () => 
	console.log(`Jobstreet Scanner app listening on port ${port}`)
);