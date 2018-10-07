var request = require("request");

 var marketCodeList = [];
 var currentMarketIndex = 0;
 var currentIndex = 0 ;
 var nextTime ;
const STATUS_INIT_DATA = 0;
const STATUS_LOAD_DATA = 0;
const ANSWER = 3;
var CURRENT_STATUS = STATUS_INIT_DATA ;
var yesterDay = new Date();
yesterDay.setDate(yesterDay.getDate() - 1);




loadStatus();
function loadStatus(){
  switch(CURRENT_STATUS++){
    case 0:{
      getMarketCode();
    }
    break;
    case 1:{
      getCandleMinute(marketCodeList[currentMarketIndex].market , null);
    }
    break;
  }
}

function getMarketCode(){
  var options = { method: 'GET', url: 'https://api.upbit.com/v1/market/all' };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    data.forEach(element => {
      if(element.market.includes('KRW-')){
        marketCodeList.push(element);
      }
    });  
    loadStatus();
  });
}

function getCandleMinute(marketCode , time){
  var options = { 
    method: 'GET',
    url: 'https://api.upbit.com/v1/candles/minutes/1',
    qs: 
    { market: marketCode,
      to: time,
      count : 200
    }
   };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    currentIndex++
    if(currentIndex >= marketCodeList.length ){
      console.log(">>>>>>>>>>>>>end>>>>>>>>>>>>>>>>>");
      return ;
    }

    var data = JSON.parse(body);
    nextTime = new Date(data[data.length - 1].candle_date_time_kst);
    //console.log(marketCodeList[currentMarketIndex].korean_name + " " +  nextTime);

    for(var i = 0 ; i < data.length - 1 ; i++){
      //if element가 0이면 continue else
      var endBlock = data[i].trade_price;
      var startBlock = data[i+1].trade_price;
      var rate = (endBlock - startBlock)/startBlock * 100;
      if(rate >= ANSWER){
        console.log(data[i].candle_date_time_kst + " " + marketCodeList[currentMarketIndex].korean_name);
      }
    };
    
    setTimeout(() => {
      
      if(yesterDay.getTime() > nextTime.getTime()){
        console.log(marketCodeList[++currentMarketIndex].korean_name);
        getCandleMinute(marketCodeList[currentMarketIndex].market , null);
      }
      else{
        getCandleMinute(marketCodeList[currentMarketIndex].market , nextTime);
      }
     
    }, 1000);
    
  });
}

/*
  //console.log(response.statusCode);
  //console.log(body);
  if(element.market == 'KRW-BTC'){
    console.log(element);
  }
  */

