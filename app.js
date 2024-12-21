const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Client } = require('pg');

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "web_dev",
  password: "postgres",
  port: 5432,
});

db.connect();

app.set("view engine", "ejs");

//make user login or register on open
app.get('/', async (req,res) => {
  res.render('login.ejs');
})

//if they click login (from register) it goes to login
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

//if they submit login, send to home
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  try{
    const check = db.query("SELECT * FROM users WHERE email = $1", [
      username,
    ]);

    if(result.rows.length>0){
      const user = result.rows[0];
      const pass = user.password;

      if(password === pass){
        res.render("/home");
      }
      else{
        res.send("Wrong password");
      }
    }
  }
  catch (err){
    console.log(err);
  }
  //testing stuff
  // console.log('username:',username);
  // console.log('password:',password);

  // res.redirect('/home');
});

//if they click register (from login/main) it goes to register
app.get('/register', (req, res) => {
  res.render('register.ejs');
});

//if they submit register, just send to home (cus technicallyt logged in)
app.post('/register.ejs', (req, res) => {
  const { username, password } = req.body;

  try {
    const check = db.query("SELECT * FROM users WHERE email = $1", [
      username,
    ]);

    if(check.rows.length>0){
      res.send("User exists.")
    }
    else{
      const result = db.query("INSERT INTO users (username,password) VALUES ($1,$2)",
        [username,password]
      );
      res.redirect('/home');
    }
  }
  catch(err){
    console.log(err);
  }
  

  //testing stuff
  // console.log('username:',username);
  // console.log('password:',password);

  // res.redirect('/home.ejs');
});


app.get('/home', async (req, res) => {
  try {
    const response = await axios.get('https://api.coinlore.net/api/tickers/');
    const tokens = response.data.data;
    res.render('index.ejs', { tokens });
  }
  catch(err){
    console.log(err);
  }
});

const watchlist = [];

app.post('/add', (req, res) => {
  const { coin_id, coin_name, coin_symbol, coin_price_usd, coin_market_cap_usd, coin_percent_change_24h } = req.body;

  console.log(req.body); 

  watchlist.push({
    coin_id,
    coin_name,
    coin_symbol,
    coin_price_usd,
    coin_market_cap_usd,
    coin_percent_change_24h
  });

  try {
    db.query(
      "INSERT INTO watchlist (coin_id, coin_name, coin_symbol, coin_price_usd, coin_market_cap_usd, coin_percent_change_24h) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        coin_id,
        coin_name,
        coin_symbol,
        coin_price_usd,
        coin_market_cap_usd,
        coin_percent_change_24h,
      ]
    );
  }
  catch(err){
    console.log(err);
  }
});

app.post('/remove', (req,res) => {
  //const { coin_id, coin_name, coin_symbol, coin_price_usd, coin_market_cap_usd, coin_percent_change_24h } = req.body;
  const { coin_id } = req.body;

  try{
    db.query("DELETE FROM watchlist WHERE coin_id = $1", (coid_id));
  }
  catch(err){
    console.log(err);
  }
})

app.get('/watchlist', (req, res) => {
  try{
    const result = db.query("SELECT * FROM watchlist");
    const watchlist = result.rows;
    res.render('watchlist.ejs', { watchlist });
  } catch(err){
    console.log(err);
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});