const { ipcRenderer } = require('electron')
var $ = require('jquery')
const Store = require('electron-store');
const hooks = new Store({name: 'webHooks'});

$(document).ready(function(){
	$("#webHookField").val(hooks.get('0.hook'))
})

$("#saveWebhook").click(function(event){
	let hookUrl = $("#webHookField").val();
	hooks.set('0', '');
	hooks.set('0.hook',hookUrl)
})

$("#testHook").click(function(event){
		ipcRenderer.send('testHook', 's');
})

$("#monitor").click(function(event){
	var subject = $("#classes").children("option:selected").val();
	var courseNumber = $("#courseNumber").val();

	ipcRenderer.send('monitor', courseNumber, subject);
})

$("#saveCourse").click(function(event){
	var subject = $("#classes").children("option:selected").val();
	var courseNumber = $("#courseNumber").val();
	var sectionNumber = $("#sectionNumber").val();
	if(document.getElementById('waitlistSeats').checked){
		var monitorType = "waitlist";
		console.log("wait");
	}else if ($('#classSeats').is(':checked')){
		var monitorType = "class";
		console.log("class");
	}

	ipcRenderer.send('saveCourse', courseNumber, subject, sectionNumber, monitorType);
})
//saveWebhook



