const axios = require("axios");
const express = require("express");
const path = require("path");
const redis = require("redis");

// Create a Redis client
const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});
client.on("error", (err) => {
  console.error("Redis error:", err);
});
client.on("connect", () => {
  console.log("Connected to Redis");
});

const app = express();
const starWarURL = "https://swapi.dev/api";

app.get("/",checkCache, (req, res) => {
  const category = req.query.category;
  axios.get(path.join(starWarURL, category)).then((searchResult) => {
    client.setex(category, 600, JSON.stringify(searchResult.data));
    res.json({ data: searchResult.data });
  });
});

app.listen(3000, () => {
  console.log("server is listening to port 3000");
});

function checkCache(req, res, next) {
  const category = req.query.category;
  client.get(category, (err, data) => {
    if(err) throw err;
    if(!data) return next();
    res.json({data : JSON.parse(data)});
  })
}