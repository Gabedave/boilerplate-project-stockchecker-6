'use strict';

const request = require('request-promise');

module.exports = function (app,model) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      let stock = req.query.stock;
      let like = req.query.like;
      let ip = (req.headers['x-forwarded-for']).toString();
      // console.log(like, ip);

      // Perform Database Search
      async function searchDB(data) {
        let {symbol, latestPrice} = data;
        if (!symbol) return

        const mod = await model.findOne({stock:symbol});
        async function callBack(doc) {
          if (!doc) {
            console.log('there is no stock in db');
            let increment = 0;
            if (like === 'true') {
              increment = 1;
            }
            const newDoc = new model({
              stock: symbol,
              price: latestPrice,
              likes: increment
            });
            if (like === 'true') {newDoc.ip.push(ip)};
            // console.log(newDoc);
            newDoc.save(async function(err,data) {
              if (err) return err;
              console.log('saving new doc');
              return newDoc;
            });
            return newDoc;
          } else {
            console.log('there is stock in db');
            console.log(like);
            if(like === 'true' && !doc.ip.includes(ip)) {
              doc.ip.push(ip);
              doc.likes += 1;
            }
            console.log(doc.likes);
            doc.price = latestPrice;
            // console.log(doc);

            doc.save(async function(err,data) {
              if (err) return err;
              console.log('updating doc in database');
              return doc;
            });
            return doc
          }
        }
        return await callBack(mod);
      }

      // If there are two stocks
      if(typeof(stock)=='object' && stock.length ==2) {
        async function findStockData(list) {
          console.log('start');
          let stockData = list.map(async element => {
            const stockUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${element}/quote`;
            console.log(element);
            try {
              const response = await request(stockUrl);
              const data = await JSON.parse(response);
              // try catch error
              if (data==='Invalid symbol' || !(data instanceof Object)) {
                console.log('Invalid stock or error');
                return ({
                  "error":"external source error",
                  "likes":0
                });
              }
              else {
                console.log('found stock');
                const result = await searchDB(data);
                // console.log('result');
                return result;
              }
            } 
            catch (err) {
              return ({
                "error":"external source error",
                "likes":0
              });
            }
          });

          const final = await Promise.all(stockData);
          // console.log(final);

          let firstRelLikes = final[0].likes - final[1].likes;
          let secondRelLikes = final[1].likes - final[0].likes;

          final[0].rel_likes = firstRelLikes;
          final[1].rel_likes = secondRelLikes;

          const filteredObj = final.map(element => {
            return ({
              stock: element.stock,
              price: element.price,
              rel_likes: element.rel_likes
            });
          });

          return res.json({"stockData":filteredObj});
        }
        findStockData(stock);
      } 
      else {
        console.log('activates here');
        const stockUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
        await request(stockUrl)
        .then(response => JSON.parse(response))
        .then(async data => {
          // console.log('data',data);
          if (data === 'Invalid symbol' || !(data instanceof Object)) {
            console.log("Invalid stock or error")
            res.json({
              "stockData": {
                "error": "external source error",
                "likes": 0
              }
            });
          }
          else {
            const result = await searchDB(data);
            // console.log('result', result)
            const filtered = {
              stock: result.stock,
              price: result.price,
              likes: result.likes
            };
            res.json({"stockData": filtered});
          }
        })
        .catch(err => {
          console.log('Err' + err);
          res.json({
            "stockData": {
              "error": "external source error",
              "likes": 0
            }
          });
        });
      }
    });
    
};
