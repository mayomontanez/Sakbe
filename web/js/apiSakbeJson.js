var destinos = [];
var detalles = [];

var id_i = 0, source_i, target_i, id_f = 0, source_f, target_f;

$(document).ready(function () {
    BusquedaOrigenDestino();
    AgregarOrigenDestino();
    calculateOrgDestino();

    $("table.order-list").on("click", ".up,.down", function () {
        var row = $(this).parents("tr:first");
        if ($(this).is(".up")) {
            row.insertBefore(row.prev());
        } else {
            row.insertAfter(row.next());
        }
    });

    $("#limpiaRuta").click(function () {
        limpiaArrays();
        limpiaImputs();
        limpiaPuntos();
        limpiaRoads();
    });
});

function BusquedaOrigenDestino() {
    $("#divBusqueda :input[type=text]").autocomplete({//se agrega filtro para que obtenga los input type=text

        minLength: 4,
        source: function (request, response) {
            var urlApiBusqueda = "http://gaia.inegi.org.mx/sakbe/wservice?make=SD&buscar=#buscar&key=#token&type=json";
            var token = 'SIATL';
            var urlApiBusquedaTmp = urlApiBusqueda.replace('#buscar', request.term);
            urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#token', token);
            $.ajax({
                url: urlApiBusquedaTmp,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.nombre,
                            value: item.geojson,
                            id_dest: item.id_dest,
                            ent_abr: item.ent_abr
                        }
                    }));
                }
            });
        },
        focus: function (event, ui) {
            $(this).val(ui.item.label);
            return false;
        },
        select: function (event, ui) {
            var strCoordenadas = $.parseJSON(ui.item.value);
            try {
                EncuentraRoadJson(strCoordenadas.coordinates[1], strCoordenadas.coordinates[0], map.getScale(), false);
                $(this).val(ui.item.label);
            } catch (err) {
                alert(err.message);
            }
            return false;
        }
    })
            .data("ui-autocomplete")._renderItem = function (ul, item) {
        return $("<li></li>")
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
    };
}
function AgregarOrigenDestino() {

    var counter = 0;
    $("#addrow").on("click", function () {
        counter = $('#tablaSakbe tr').length - 2;
        var newRow = $("<tr class='txtDestino' >");
        var cols = "";

        cols += '<td><input type=image src="img/markers.jpg" width="25" height="20" />\n\
                    <input type="text" name="ordestino' + counter + '"  class="txtBusqueda"/>\n\
                    <input type=image class="ibtnDel" src="img/removerow.jpg" width="45" height="20" value="Delete">\n\
                   \n\
                 </td>';

        cols += '<td> <input type=image src="img/arrowsUp.jpg" width="25" height="20"  class="up"/>\n\
                        <input type=image src="img/arrowsDown.jpg" width="25" height="20" class="down"  /></td>';

        newRow.append(cols);
        if (counter === 3)
            $('#addrow').attr('disabled', true);
        $("table.order-list").append(newRow);
        counter++;

        $("table.order-list").on("click", ".ibtnDel", function (event) {
            $(this).closest("tr").remove();
            calculateOrgDestino();

            counter -= 1;
            $('#addrow').attr('disabled', false).prop('value', "Add Row");
        });
        BusquedaOrigenDestino();

    });
}

function calculateOrgDestino() {
    var grandTotal = 0;
    $("table.order-list").find('input[name^="ordestino"]').each(function () {
        grandTotal += +$(this).val();

    });
    $("#grandtotal").text(grandTotal.toFixed(2));
}

/***********  CREAR PUNTO EN COORDENADAS ESPECIFICAS en Vectors1  **********************/
function createFeatures2(x1, y1)
{
    // alert("x1"+ x1 +"y1"+ y1);
    var features = [];         //+0.0019    +0.0007
    features.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(y1, x1)));
    return features;
}

function rutear()
{
    //alert("entro");
    var geojson_format = new OpenLayers.Format.GeoJSON();
    var vector_layer = new OpenLayers.Layer.Vector('Ruta', {style: color = '#FF00EF'});
    map.addLayer(vector_layer);
    vector_layer.addFeatures(geojson_format.read(leeXML()));
}


function EncuentraRoadJson(y, x, escala, onClick)
{
    //se agrega, al final de la url, el parámetro &proj=MERC
    var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=IL&escala=" + escala + "&y=" + y + "&x=" + x + "&type=json" + "&key=SIATL&proj=MERC";
    //var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=IL&escala=54070.29327392578&y=21.889430203735&x=-102.27328250991&type=json&key=SIATL";
    $.getJSON(urlJson, function (data) {
        var items = [];
        $.each(data, function (key, obj) {
            try {
                if (obj.id_routing_net == null)
                {
                    //alert("No hay");
                    EncuentraRoadJson(y, x, 10 * escala, onClick);
                } else
                {
                    if (destinos.length > 0) {
                        if (destinos[destinos.length - 1].id_routing_net != obj.id_routing_net) {
                            var geoJson = $.parseJSON(obj.geojson);
                            vectors1.addFeatures(createFeatures2(geoJson.coordinates[1], geoJson.coordinates[0]));
                            destinos.push(obj);
                            if (onClick == true) {
                                llenaTxtDestino(obj.nombre);
                            }
                        }
                    } else
                    {
                        var geoJson = $.parseJSON(obj.geojson);
                        vectors1.addFeatures(createFeatures2(geoJson.coordinates[1], geoJson.coordinates[0]));
                        destinos.push(obj);
                        if (onClick == true) {
                            llenaTxtDestino(obj.nombre);
                        }
                    }
                }
            } catch (err)
            {
                alert("Ha ocurrido un error: " + err.message);
            }
        });
    });
}

function multiRuteo() {
    if (destinos.length >= 2) {
        limpiaRoads();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        try
        {
            //for (var i = destinos.length-1; i >= 1; i--) {
            for (var i = 0; i < destinos.length - 1; i++) {
                var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i=" + destinos[i].id_routing_net + "&source_i=" + destinos[i].source + "&target_i=" + destinos[i].target + "&id_f=" + destinos[i + 1].id_routing_net + "&source_f=" + destinos[i + 1].source + "&target_f=" + destinos[i + 1].target + "&p=#tp&v=#veh&e=#ee&type=json&key=SIATL&proj=MERC";
                var ruta = $('#tp').val();
                var veh = $('#veh').val();
                var ejes = $('#ee').val();
                var urlApiBusquedaTmp = urlJson.replace('#tp', ruta);
                urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#veh', veh);
                urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#ee', ejes);
                $.getJSON(urlApiBusquedaTmp, function (data) {
                    $.each(data, function (key, obj) {
                        try {
                            //var vector_layer = new OpenLayers.Layer.Vector('Ruta ' + i, {style: style_ruta});
                            vector_layer.addFeatures(geojson_format.read(obj.geojson));
                            map.addLayer(vector_layer);
                        } catch (err)
                        {
                            alert("Ha ocurrido un error: " + err.message);
                        }
                    });
                }).done(function () {
                    zoomRuta();
                });
            }
        } catch (err) {
            alert(err.message);
        }
    } else
    {
        //alerta
    }
}

function detalleRuta()
{

    if (destinos.length >= 2) {//deben existir mínimo 2 puntos
        try {
            //for (var i = destinos.length-1; i >= 1; i--) {
            for (var i = 0; i < destinos.length - 1; i++) {

                var urlJson2 = "http://gaia.inegi.org.mx/sakbe/wservice?make=GD&id_i=" + destinos[i].id_routing_net + "&source_i=" + destinos[i].source + "&target_i=" + destinos[i].target + "&id_f=" + destinos[i + 1].id_routing_net + "&source_f=" + destinos[i + 1].source + "&target_f=" + destinos[i + 1].target + "&p=#tp&v=#veh&e=#ee&type=json&key=SIATL";
                var ruta = $('#tp').val();
                var veh = $('#veh').val();
                var ejes = $('#ee').val();
                var comb = $('#com').val();
                var ren = $('#ren').val();
                var urlApiBusquedaTmp = urlJson2.replace('#tp', ruta);
                urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#veh', veh);
                urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#ee', ejes);
                $.getJSON(urlApiBusquedaTmp, function (json) {
                    for (var i = 0; i < json.length; i++) {
                        detalles.push(json[i]);
                        /*codHtml += '<table style="width:50%;">';
                         codHtml += '<tr><b>' + json[i].direccion + '</b></tr>'+
                         '<tr><td style="width:50%;">' + (((json[i].long_km)/1000).toFixed(2)) + ' Kms </td>'+
                         '<td style="width:50%;">' + (((json[i].tiempo_min)/60).toFixed(2)) + ' horas </td></tr>'		
                         codHtml += '</table><br><br>';
                         t = t + parseFloat(json[i].tiempo_min);
                         k = k + parseFloat(json[i].long_km);
                         c = c + parseFloat(json[i].costo_caseta);*/
                    }
                    //alert('El tiempo total del recorrido es de: '+t.toFixed(2) +' minutos, con una distancia de : '+((k/1000).toFixed(2))+' Km y $ '+c.toFixed(2)+' pesos.');
                })

                        .done(function () {
                            var codHtml = "<div>";
                            var codHtml2 = "<div>";
                            var t = 0, k = 0, c = 0, cd = 0;
                            $.each(detalles, function (index, value) {
                                var codHtml = '<a href="#" class="list-group-item"><div class="row"><div class="col-sm-3">';
                                var $panel = $('#itinerario .list-group');
                                var giro = value.giro;
                                t1 = (value.tiempo_min) * 60;
                                m1 = Math.floor((t1 % 3600) / 60);
                                s1 = t1 % 60;
                                m1 = m1 < 10 ? '0' + m1 : m1;
                                s1 = s1 < 10 ? '0' + s1 : s1;
                                /*codHtml += '<table style="width:50%;">';
                                 codHtml = '<select id ="com" onchange="funciones();">';
                                 codHtml += '<tr><b>' + value.direccion + '</b></tr>' +
                                 '<tr><td style="width:50%;">' + (((value.long_km) / 1000).toFixed(2)) + ' Kms </td>' +
                                 '<td style="width:50%;">' + parseInt(m1) + ' m </td><td style="width:50%;">' + parseInt(s1) + ' s </td></tr>';
                                 codHtml += '</table><br><br>';*/
                                codHtml += '<img src="img/' + giro + '.png"></div>';
                                codHtml += '<div id=' + cd + ' class="col-sm-9" onclick="funcionesRuteo();">' + value.direccion + '<div class="row"><div class="col-sm-4"><h6><small>' + (((value.long_m) / 1000).toFixed(2)) + ' Kms </small></h6></div> '
                                        + '<div class="col-sm-4"><h6><small>' + parseInt(m1) + ' m ' + parseInt(s1) + ' s </small></h6></div>';
                                codHtml += '<div class="col-sm-4"><h6><small>Caseta: $26</small></h6></div></div></div></div></a>';
                                $panel.append(codHtml);
                                cd++;
                                t = t + parseFloat(value.tiempo_min);
                                k = k + parseFloat(value.long_m);
                                c = c + parseFloat(value.costo_caseta);
                            })
                            tt = t * 60;
                            h = Math.floor(tt / 3600);
                            m = Math.floor((tt % 3600) / 60);
                            s = tt % 60;
                            m = m < 10 ? '0' + m : m;
                            s = s < 10 ? '0' + s : s;
                            d = k / 1000;
                            var cc = ((k / 1000) / ren) * comb;
                            var ct = cc + c;
                            $('#detalles').html(codHtml);
                            if ((ren < 2) || (ren > 49)) {
                                codHtml2 = "Rendimiento invalido, por favor ingrese un valor entre 2 y 49 km/lt";
                                $('#est').html(codHtml2);
                            } else {
                                if (h >= 1) {
                                    codHtml2 += '<div><div><b> Distancia </b><br>' + d.toFixed(2) + ' Kms</b></div><div><b> Tiempo</b><br>' + h.toFixed(0) + ' h ' + m.toFixed(0) + ' m ' + s.toFixed(0) + ' s </div><div><b> Peaje </b><br> $' + c.toFixed(2) + ' pesos</div></tr><tr><div><b> Costo combustible </b><br> $' + cc.toFixed(2) + ' pesos</div><div><b> Costo total </b><br> $' + ct.toFixed(2) + ' pesos</div></tr></div>';
                                    codHtml2 += '</div>';
                                    $('#est').html(codHtml2);
                                } else {
                                    m = t
                                    codHtml2 += '<div><div><b> Distancia </b><br>' + d.toFixed(2) + ' Kms</b></div><div><b> Tiempo</b><br>0 h ' + m.toFixed(0) + ' m ' + s.toFixed(0) + ' s </div><div><b> Peaje </b><br> $' + c.toFixed(2) + ' pesos</div></tr><tr><div><b> Costo combustible </b><br> $' + cc.toFixed(2) + ' pesos</div><div><b> Costo total </b><br> $' + ct.toFixed(2) + ' pesos</div></tr></div>';
                                    codHtml2 += '</div>';
                                    $('#est').html(codHtml2);
                                }
                                d = 0;
                                h = 0;
                                m = 0;
                                c = 0;
                                cc = 0;
                                ct = 0;

                            }
                        })
                        ;
            }
        } catch (err) {

        }

    } else {

    }
}

//metodos necesarios para limpiar la ruta
function limpiaArrays() {
    destinos = [];
    detalles = [];

}

function limpiaImputs() {
    $("#divBusqueda :input").val("");
    $("#tablaSakbe .txtDestino").slice(2).remove();
}

function limpiaPuntos() {
    vectors1.removeAllFeatures();
    vectors1.destroyFeatures();//optional
    vectors1.addFeatures([]);
}

function limpiaRoads() {
    vector_layer.removeAllFeatures();
    vector_layer.destroyFeatures();//optional
    vector_layer.addFeatures([]);
}

function llenaTxtDestino(nombre) {
    // alert("entro");
    $('#tablaSakbe input[type=text]:empty').each(function (i, v) {
        if (v.value == "") {
            v.value = nombre;
            return false;
        }
    });
}

function zoomRuta() {
    for (var i = 0; i < vector_layer.features.length; i++) {
        map.zoomToExtent([
            vector_layer.features[i].geometry.bounds.left,
            vector_layer.features[i].geometry.bounds.bottom,
            vector_layer.features[i].geometry.bounds.right,
            vector_layer.features[i].geometry.bounds.top
        ]);
    }
}

function funcionesRuteo()
{
    multiRuteo();
    detalleRuta();
}