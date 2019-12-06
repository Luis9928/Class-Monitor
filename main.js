const {app, ipcMain, BrowserWindow} = require('electron')
var fs = require('fs');
var request = require('request');
request = request.defaults({jar: true});
var j = request.jar()
const cheerio = require('cheerio')
const Store = require('electron-store');


var win;
var courses = new Array();
const hooks = new Store({name: 'webHooks'});



app.on('ready', () =>{
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences:{
			nodeIntegration: true
		}
	})

	win.loadFile('index.html');

	//win.webContents.openDevTools()
})


var urlLogin = 'https://ssb.txstate.edu/prod/twbkwbis.P_ValLogin'

var header = {
'Host': 'ssb.txstate.edu',
'Connection': 'keep-alive',
'Content-Length': '25',
'Cache-Control': 'max-age=0',
'Origin': 'https://ssb.txstate.edu',
'Upgrade-Insecure-Requests': '1',
'Content-Type': 'application/x-www-form-urlencoded',
'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-User': '?1',
'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
'Sec-Fetch-Site': 'same-origin',
'Referer': 'https://ssb.txstate.edu/prod/twbkwbis.P_WWWLogin',
'Accept-Encoding': 'gzip, deflate, br',
'Accept-Language': 'en-US,en;q=0.9'
}

	
var urlQuery = 'https://ssb.txstate.edu/prod/bwskfcls.P_GetCrse'

var headerQuery = {
'Host': 'ssb.txstate.edu',
'Connection': 'keep-alive',
'Content-Length': '396',
'Cache-Control': 'max-age=0',
'Origin': 'https://ssb.txstate.edu',
'Upgrade-Insecure-Requests': '1',
'Content-Type': 'application/x-www-form-urlencoded',
'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
'Sec-Fetch-Mode': 'navigate',
'Sec-Fetch-User': '?1',
 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',

'Sec-Fetch-Site': 'same-origin',
'Referer': 'https://ssb.txstate.edu/prod/bwskfcls.P_GetCrse',
'Accept-Encoding': 'gzip, deflate, br',
'Accept-Language': 'en-US,en;q=0.9'
}



ipcMain.on('login', function(event, netId, pass){
	//console.log("Worked?");
	let options ={
		method: 'POST',
		url: urlLogin,
		port: 443,
		headers: header,
		followAllRedirects: true,
		form: {
			'sid':netId.toString(),
			'PIN':pass.toString()
		}
	}

	request(urlLogin, function(){
		request(options, function(error, response, body){
			if(response.statusCode != 200){
				event.reply('loginFailed');
			}else{
				var $ = cheerio.load(body);
				var isLoggedIn = $('form[NAME=loginform]').length;

				if(isLoggedIn == 1){
					event.reply('loginFailed');
				}else{
					event.reply('loginSuccess');
					win.loadFile('search.html')

					ipcMain.on('testHook', function(event){
						console.log("Hook");
						sendToHook(0, 0, 0);
					})

					ipcMain.on('monitor', function(event){
						console.log("Monitor Signal");
						//console.log(courses.length);
						for(var i = 0; i < courses.length; i+=4){
							console.log(courses[i]);
							monitorClasses(courses[i+3], courses[i+2], courses[i+1], courses[i]);
						}
					})

					ipcMain.on('saveCourse', function(event, courseNumber, subject, section, monitorType){
						var optionsQuery ={
							method: 'POST',
							url: urlQuery + `?term_in=202030&sel_subj=dummy&sel_subj=${subject}&SEL_CRSE=${courseNumber}&SEL_TITLE=&BEGIN_HH=0&BEGIN_MI=0&BEGIN_AP=a&SEL_DAY=dummy&SEL_PTRM=dummy&END_HH=0&END_MI=0&END_AP=a&SEL_CAMP=dummy&SEL_SCHD=dummy&SEL_SESS=dummy&SEL_INSTR=dummy&SEL_INSTR=%25&SEL_ATTR=dummy&SEL_ATTR=%25&SEL_LEVL=dummy&SEL_LEVL=%25&SEL_INSM=dummy&sel_dunt_code=&sel_dunt_unit=&call_value_in=&rsts=dummy&crn=dummy&path=1&SUB_BTN=View+Sections`,
							port: 443,
							headers: headerQuery,
							followAllRedirects: true,
						}
						findClass(optionsQuery, section, monitorType);
					})

				}
			}
		})
	})
})


function monitorClasses(monitorType ,courseNumber, subject, classIndex){
	var optionsQuery ={
		method: 'POST',
		url: urlQuery + `?term_in=202030&sel_subj=dummy&sel_subj=${subject}&SEL_CRSE=${courseNumber}&SEL_TITLE=&BEGIN_HH=0&BEGIN_MI=0&BEGIN_AP=a&SEL_DAY=dummy&SEL_PTRM=dummy&END_HH=0&END_MI=0&END_AP=a&SEL_CAMP=dummy&SEL_SCHD=dummy&SEL_SESS=dummy&SEL_INSTR=dummy&SEL_INSTR=%25&SEL_ATTR=dummy&SEL_ATTR=%25&SEL_LEVL=dummy&SEL_LEVL=%25&SEL_INSM=dummy&sel_dunt_code=&sel_dunt_unit=&call_value_in=&rsts=dummy&crn=dummy&path=1&SUB_BTN=View+Sections`,
		port: 443,
		headers: headerQuery,
		followAllRedirects: true,
	}

//8 remaining 11 waitlist remianing

		var seats = 0;
		function checkClass() {
		    if(seats < 1) {
		    	request(optionsQuery, function(error, response, body){
		    		var $ = cheerio.load(body);
		    		var output = $('td').toArray();
		    		if(monitorType == "class"){
						var seats = output[classIndex + 8].children[0].data;
					}else if (monitorType == "waitlist"){
						var seats = output[classIndex + 11].children[0].data;
					}
					sendToHook(subject, courseNumber, seats);
					console.log(seats);
		    	})
		        // Continue the loop in 3s
		        setTimeout(checkClass, 900000);
		    }
		}
		// Start the loop
		setTimeout(checkClass, 0);
		//CLASS="datadisplaytable"
		//console.log(response.body);
}

function findClass(optionsQuery, section, monitorType) {
	var classIndex;
	console.log("Find Class");
	request(optionsQuery, function(error, response, body){
		//console.log(response);
		var $ = cheerio.load(body);
		var output = $('td').toArray();

		for(var i = 22; i < output.length; i+= 20){
			if(output[i].children[0].data == section){
				//console.log(i);
				courses.push(i);
				courses.push(output[i - 2].children[0].data);
				courses.push(output[i - 1].children[0].data);
				courses.push(monitorType);
				return;
			}
		}
	})
}

function sendToHook(subject, courseNumber, seats){


	var hookHeader = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
		'Content-Type': 'application/json'
	} 

	if (seats > 0){
		var postData = {
				'username':'Class Monitor',
				'avatar_url':'https://i.kym-cdn.com/entries/icons/medium/000/021/523/R14kkDj.png',
				'embeds':[ 
				{
					"title": "Class is available",
					"url": "https://ssb.txstate.edu/prod/twbkwbis.P_WWWLogin",
					"description": `A seat for ${subject} ${courseNumber} just became available`,
					"footer": {
						"text": "Class Monitor",
						"icon_url": "https://www.stickpng.com/assets/images/5845cd430b2a3b54fdbaecf8.png"
					},
					"timestamp": "2019-04-22T11:02:04.000Z",
					"color": 15746887,
					"thumbnail": {
						"url": "https://www.stickpng.com/assets/images/5845cd430b2a3b54fdbaecf8.png"
					}
				}]
		}
	}

	// Message to hook if class is unavailable
	/*else{
		var postData = {
				'username':'Class Monitor',
				'avatar_url':'https://i.kym-cdn.com/entries/icons/medium/000/021/523/R14kkDj.png',
				'embeds':[ 
				{
					"title": "Class is unavailable",
					"url": "https://ssb.txstate.edu/prod/twbkwbis.P_WWWLogin",
					"description": `There's currently 0 seats for ${subject} ${courseNumber}`,
					"footer": {
						"text": "Class Monitor",
						"icon_url": "https://www.stickpng.com/assets/images/5845cd430b2a3b54fdbaecf8.png"
					},
					"timestamp": "2019-04-22T11:02:04.000Z",
					"color": 15746887,
					"thumbnail": {
						"url": "https://www.stickpng.com/assets/images/5845cd430b2a3b54fdbaecf8.png"
					}
				}]
		}	
	}*/

	var hookOption = {
		method: 'POST',
		port: 443,
		headers: hookHeader,
		url: hooks.get('0.hook'),
		body: postData,
		json: true
	}

	//console.log(hooks.get('0.hook'));

	request(hookOption, function(error, response, body){

	})

}
