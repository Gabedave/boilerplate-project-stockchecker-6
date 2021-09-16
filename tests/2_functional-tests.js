const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    // View One Stock
  test('Test GET Request to /api/stock-prices/ to view one stock', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=ADBE')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end(function(err,res) {
      assert.equal(res.status,200);
      assert.equal(typeof(res.body),'object');
      assert.property(res.body,'stockData','return object contains stockData');
      assert.equal(res.body.stockData.stock,'ADBE');
      assert.property(res.body.stockData, 'stock');
      assert.property(res.body.stockData, 'price');
      assert.property(res.body.stockData, 'likes');
      assert.equal(typeof res.body.stockData.stock, 'string');
      assert.equal(typeof res.body.stockData.price, 'number');
      assert.equal(typeof res.body.stockData.likes, 'number');
      done();
    });
  });
  
    // View One Stock and Like It
  test('Test GET Request to /api/stock-prices/ to view one stock and like it', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=BIIB&like=true')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end((err,res) => {
      assert.equal(res.status,200);
      assert.equal(typeof res.body,'object');
      assert.property(res.body,'stockData');
      assert.property(res.body.stockData,'stock');
      assert.equal(res.body.stockData.stock,'BIIB');
      assert.property(res.body.stockData,'price');
      assert.property(res.body.stockData,'likes');
      assert.equal(res.body.stockData.likes,1);
      done();
    });
  });

    // View The Same Stock and Like It Again
  test('Test GET Request to /api/stock-prices/ to view the same stock and like it again', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=BIIB&like=true')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end((err,res) => {
      assert.equal(res.status,200);
      assert.equal(typeof res.body,'object');
      assert.property(res.body,'stockData');
      assert.property(res.body.stockData,'stock');
      assert.equal(res.body.stockData.stock,'BIIB');
      assert.property(res.body.stockData,'price');
      assert.property(res.body.stockData,'likes');
      assert.equal(res.body.stockData.likes,1);
      done();
    });
  });

    // View Two Stocks
  test('Test GET Request to /api/stock-prices/ to view two stocks', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=BIIB&stock=CDR')
    .set({'x-forwarded-for':'130.211.2.256'})
    .end((err,res) => {
      assert.equal(res.status,200);
      assert.equal(typeof res.body,'object');
      assert.property(res.body,'stockData');
      assert.equal(res.body.stockData.length,2)
      assert.property(res.body.stockData[0],'stock');
      assert.equal(res.body.stockData[0].stock,'BIIB');
      assert.property(res.body.stockData[0],'price');
      assert.property(res.body.stockData[0],'rel_likes');
      assert.equal(res.body.stockData[0].rel_likes,1);
      done();
      assert.property(res.body.stockData[1],'stock');
      assert.equal(res.body.stockData[1].stock,'BIIB');
      assert.property(res.body.stockData[1],'price');
      assert.property(res.body.stockData[1],'rel_likes');
      assert.equal(res.body.stockData[1].rel_likes,-1);
      done();
    });
  });

    // View Two Stocks and Like Them
  test('Test GET Request to /api/stock-prices/ to view two stocks and like them', function(done) {
    chai.request(server)
    .get('/api/stock-prices?stock=BIIB&stock=CDR')
    .set({'x-forwarded-for':'130.211.2.258'})
    .end((err,res) => {
      assert.equal(res.status,200);
      assert.equal(typeof res.body,'object');
      assert.property(res.body,'stockData');
      assert.equal(res.body.stockData.length,2)
      assert.property(res.body.stockData[0],'stock');
      assert.equal(res.body.stockData[0].stock,'BIIB');
      assert.property(res.body.stockData[0],'price');
      assert.property(res.body.stockData[0],'rel_likes');
      assert.equal(res.body.stockData[0].rel_likes,1);
      done();
      assert.property(res.body.stockData[1],'stock');
      assert.equal(res.body.stockData[1].stock,'BIIB');
      assert.property(res.body.stockData[1],'price');
      assert.property(res.body.stockData[1],'rel_likes');
      assert.equal(res.body.stockData[1].rel_likes,-1);
      done();
    });
  });
})
