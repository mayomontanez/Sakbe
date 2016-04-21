var UrlCombustible ="http://gaia.inegi.org.mx/sakbe/wservice?make=CM&type=json&key=SIATL"
		
$(document).ready(function(){

    $.getJSON(UrlCombustible, function( json ){
		var codHtml1 = '<select id ="com" onchange="funcionesRuteo();">';
		for(var i = 0; i < json.length; i++){
		//codHtml1 += '<table style="width:50%;">';
		codHtml1 += '<option value="' + json[i].costo +'" >'+ json[i].tipo +' - $' +json[i].costo+ ' lt.</option>';		
		//codHtml1 += '</select>';
            }
		
		$('#tabSakbe1').html(codHtml1);
	});
	
});