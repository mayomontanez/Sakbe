/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
var detalles = [];
$(document).ready(function () {
   
    
       // url completa para pruebas P= es por Prueba
        var urlP = "http://gaia.inegi.org.mx/sakbe/wservice?make=GD&id_i=548718&source_i=377152&target_i=292505&id_f=611185&source_f=165097&target_f=471107&p=2&v=1&e=0&type=json&key=SIATL";
        // var urlJson2 = "http://gaia.inegi.org.mx/sakbe/wservice?make=GD&id_i=" + destinos[i].id_routing_net + "&source_i=" + destinos[i].source + "&target_i=" + destinos[i].target + "&id_f=" + destinos[i + 1].id_routing_net + "&source_f=" + destinos[i + 1].source + "&target_f=" + destinos[i + 1].target + "&p=#tp&v=#veh&e=#ee&type=json&key=SIATL";

        $.getJSON(urlP, function (json) {
            var codHtml = '';
            var codHtml2 = '';
            for (var i = 0; i < json.length; i++) {
                detalles.push(json[i]);
            }
        })

                .done(function () {
             
                    
                    $.each(detalles, function (index, value) {
                        var codHtml = '<a href="#" class="list-group-item"><div class="row"><div class="col-sm-3">';
                         var $panel = $('#itinerario .list-group');
                        var giro = value.giro;
                        var t1 = (value.tiempo_min) * 60;
                        var m1 = Math.floor((t1 % 3600) / 60);
                        var s1 = t1 % 60;
                        var m1 = m1 < 10 ? '0' + m1 : m1;
                        var s1 = s1 < 10 ? '0' + s1 : s1;

                        codHtml += '<img src="img/' + giro + '.png"></div>';
                        codHtml += '<div class="col-sm-9">' + value.direccion + '<div class="row"><div class="col-sm-4"><h6><small>' + (((value.long_m) / 1000).toFixed(2)) + ' Kms </small></h6></div>'
                                + '<div class="col-sm-4"><h6><small>' + parseInt(m1) + ' m ' + parseInt(s1) + ' s </small></h6></div>';
                        codHtml += '<div class="col-sm-4"><h6><small>Caseta: $26</small></h6></div></div></div></div></a>';
                        $panel.append(codHtml);


                    });



                });
   



});*/