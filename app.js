/* Variables node de l'application */
var app = require('express')(),
    session = require('cookie-session'),
    connection = require('mysql').createPool({
		host : 'localhost',
		port : '8889',
		user : 'root',
		password : 'root',
		database : 'Boutique'
	});

/* Les requètes SQL dont on a besoin */
var	categoriesQuery = 'SELECT Categories.name, Categories.id, count(Products.idCategory) as nombre FROM Categories INNER JOIN Products ON Categories.id=Products.idCategory GROUP BY Products.idCategory HAVING count(Products.idCategory)>0 ORDER BY Categories.id',
	paginationQuery = 'SELECT COUNT(id) as number FROM Products',
	allProductsQuery = 'SELECT id, name, imagePath,ROUND(priceHT * (1 + VATRate / 100), 2) AS priceTTC, idCategory FROM Products LIMIT ?,?',
	oneProductQuery = 'SELECT id, name,description, imagePath,ROUND(priceHT * (1 + VATRate / 100), 2) AS priceTTC, idCategory FROM Products WHERE id=?',
	oneCategoryQuery = 'SELECT Products.id, Products.name, imagePath, ROUND(priceHT * (1 + VATRate / 100), 2) AS priceTTC, Products.idCategory FROM Products INNER JOIN Categories ON Products.idCategory=Categories.id WHERE Categories.id=? LIMIT ?,?',
	paginationCategoryQuery = 'SELECT COUNT(id) as number FROM Products WHERE idCategory=?';

/* Autres variables  et constantes */
const NumberPerPage = 2;


app.use(session({secret: 'shoptopsecret'}))
.use(function(req, res, next){
	if(typeof(req.session.user)=='undefined'){
		req.session.user = {};
	}
	next();
})
.get('/', function(req, res){
	res.redirect('/1');
})
.get('/:page',function(req, res){
	connection.query(categoriesQuery, function(err, categories, fields){
		(err) => console.log(err.stack);
		connection.query(paginationQuery, function(err, row, fields){
			(err) => console.log(err.stack);	
			connection.query(allProductsQuery, [(req.params.page-1)*2, NumberPerPage], function(err, result, fields){
				(err) => console.log(err.stack);
				res.render('index.ejs', {user: req.session.user, categories: categories,  articles: result,lastPage: Math.ceil(row[0].number/NumberPerPage)  });
			});
		});
	});
})
.get('/article/:id', function(req, res){
	connection.query(categoriesQuery, function(err, categories, fields){
		(err) => console.log(err.stack);
		connection.query(oneProductQuery,[req.params.id], function(err, result, fields){
			(err) => console.log(err.stack);
			res.render('oneArticle.ejs',{user: req.session.user,categories: categories, article: result[0]});
		});
	});
})
.get('/categorie/:id/page/:page', function(req, res){
	connection.query(categoriesQuery, function(err, categories, fields){
		(err) => console.log(err.stack);
		connection.query(paginationCategoryQuery, [req.params.id], function(err, row, fields){
			(err) => console.log(err.stack);
			connection.query(oneCategoryQuery, [req.params.id, (req.params.page-1)*2, NumberPerPage ], function(err, result, fields){
				(err) => console.log(err.stack);
				res.render('index.ejs', {user: req.session.user, categories: categories, articles: result,lastPage: Math.ceil(row[0].number/NumberPerPage) });
			});
		});
	});
})
.listen(8080);

/*.use(session({secret: 'shoptopsecret'}))
.use(function(req, res, next){
	if(typeof(req.session.user)=='undefined'){
		req.session.user = {};
	}
	next();
})*/