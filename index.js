const { ipcRenderer } = require('electron')
var $ = require('jquery')

var ProgressBar = require('progressbar.js');
var bar = new ProgressBar.Circle(container, {
  strokeWidth: 6,
  easing: 'easeInOut',
  duration: 500,
  color: '#32a852',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: null
});


$( "#submit" ).click(function( event ) {
  $("#loginForm").hide();
  let netId = $("#netID").val();
  let pass = $("#pass").val();
  //console.log(`${netId}     ${pass}`);
  ipcRenderer.send('login',netId, pass);
  $("#container").show();
  event.preventDefault();
});


ipcRenderer.on('loginFailed', function(event){
	bar.animate(1.0);  // Number from 0.0 to 1.0
	bar.setText("Failed");
	$("#container").hide();
	$("#loginForm").show();
	bar.animate(0);
	bar.setText("");
})

ipcRenderer.on('loginSuccess', function(event){
	  bar.animate(1.0);  // Number from 0.0 to 1.0
	  bar.setText("Success")

})
