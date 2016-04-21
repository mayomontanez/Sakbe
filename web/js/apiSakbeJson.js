var destinos = [];
var detalles = [];

var id_i = 0, source_i, target_i, id_f = 0, source_f, target_f;
var map;
var base1, base2, base3;
var wms_nubes, wms_road, wms_hidro1, wms_hidro2, wms_casetas;
var vectors1;

$(document).ready(function () {
    BusquedaOrigenDestino();
    AgregarOrigenDestino();
    calculateOrgDestino();
   /*
   $(this).on('click','#relative',function(){
       alert("me cliqueaste");
   });*/
   
    $("table.order-list").on("click", ".up,.down", function () {
        var row = $(this).parents("tr:first");
        if ($(this).is(".up")) {
            row.insertBefore(row.prev());
        } else {
            row.insertAfter(row.next());
        }
    });
    
  $("#limpiaRuta").click(function() {
        limpiaArrays();
        limpiaImputs();
        limpiaPuntos();
        limpiaRoads();
  });
   
   // $(".my-select").chosen({width: "100%"});
    
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': false,
            'stopDouble': false
        },
        initialize: function (options) {
            this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                    );
            OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                    );
            this.handler = new OpenLayers.Handler.Click(
                    this, {
                        'click': this.trigger
                    }, this.handlerOptions
                    );
        },
        trigger: function (e) {
            getPointClick(e);
        }
    });

   
    /*    
     function cargando(){
     var square = new Sonic({
     width: 100,
     height: 100,
     fillColor: '#000',
     path: [
     ['line', 10, 10, 90, 10],
     ['line', 90, 10, 90, 90],
     ['line', 90, 90, 10, 90],
     ['line', 10, 90, 10, 10]
     ]
     });
     
     square.play();
     
     document.body.appendChild(square.canvas);
     }  
     */



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
                //vectors1.addFeatures(createFeatures2(strCoordenadas.coordinates[1], strCoordenadas.coordinates[0]));
                $(this).val(ui.item.label);
            } catch (err) {
                alert(err.message);
            }
            return false;
        }
    })

            //Ã‰sta parte solo se aplica para el primer input que encuentra en orden descendente.
            //Para los demÃ¡s, automÃ¡ticamente detecta el item.label y lo bindea a la lista.
            //Ã©sta condiciÃ³n no afecta al momento de graficar los puntos.
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
/*function funciones()
            {
                multiRuteo();
                detalle();
            }
*/

function getPointClick(e) {
    var lonlat = map.getLonLatFromPixel(e.xy);
    //se quita el foco de cualquier input para evitar errores a la hora de completar nombre de road
    //$("#map").focus();
    EncuentraRoadJson(lonlat.lat, lonlat.lon, map.getScale(), true);
}

function init() {
    var options = {
        zoom: 9
        , center: new google.maps.LatLng(-102, 21)
        , mapTypeId: google.maps.MapTypeId.ROADMAP
        , visible: false
    };
    map = new google.maps.Map(document.getElementById('map'), options);
    map = new OpenLayers.Map('map', {
        controls: [
            new OpenLayers.Control.Navigation(),
            //new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.LayerSwitcher({'ascending': false}),
            new OpenLayers.Control.Permalink(),
            new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.Permalink('http://www.inegi.org.mx'),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.KeyboardDefaults()
        ],
        numZoomLevels: 23
    });
    //***********************************    M A P A S    B A S E    ************************************** 
    /*Comentario init 1    
     var gmaps = new Array();
     
     gmaps.push(new OpenLayers.Layer.Google("Google: Roadmap", { type: google.maps.MapTypeId.ROADMAP}));
     gmaps.push(new OpenLayers.Layer.Google("Google: Satelite", { type: google.maps.MapTypeId.SATELLITE}));
     gmaps.push(new OpenLayers.Layer.Google("Google: Terreno", { type: google.maps.MapTypeId.TERRAIN}));
     gmaps.push(new OpenLayers.Layer.Google("Google: Hibrido", { type: google.maps.MapTypeId.HYBRID}));
     
     */
  base1 = new OpenLayers.Layer.WMS("Nuevo Mapa Base",
            "http://10.152.11.17:82/mdmCache/service/wms?",
            {layers: 'MapaBaseTopograficov61_sinsombreado_escritorio'},
            {isBaseLayer: 'True'});
    base2 = new OpenLayers.Layer.WMS("OSGEO",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
            {layers: 'basic', isBaseLayer: true});
    /*Comentario inti 2           
     var apiKey = "Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3";
     
     
     var road = new OpenLayers.Layer.Bing({
     key: apiKey,
     type: "Road",
     //custom metadata parameter to request the new map style - only useful
     // before May 1st, 2011
     metadataParams: {mapVersion: "v1"}
     });
     var aerial = new OpenLayers.Layer.Bing({
     key: apiKey,
     type: "Aerial"
     });
     var hybrid = new OpenLayers.Layer.Bing({
     key: apiKey,
     type: "AerialWithLabels",
     name: "Bing Aerial With Labels"
     });              
     */
    
    //***********************************    C A P A S    W M S   **************************************       
     wms_nubes = new OpenLayers.Layer.WMS("NUBES",
            "http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/obs?LAYERS=RAS_GOES&TRANSPARENT=true",
            {layers: 'RAS_GOES', transparent: true},
            {opacity: 0.8, visibility: false});
    wms_road = new OpenLayers.Layer.WMS("Carreteras libres",
            "http://siatlapp/antares/DYNWMS/Carreteras.pl",
            {layers: 'ROUTING_NET_LIBRE,ROUTING_NET_CUOTA', transparent: true},
            {opacity: 0.8, visibility: false});
    wms_hidro1 = new OpenLayers.Layer.WMS("Red Hidrografica 1:50 000",
            "http://10.1.32.183/antares/maps.fcgi?map=/maps/v2/Hidro_v2.map&TRANSPARENT=true",
            {layers: 'hidro_v2', transparent: true},
            {visibility: false});
    wms_hidro2 = new OpenLayers.Layer.WMS("Red Hidro",
            "http://10.1.32.183/antares/maps.fcgi?map=/maps/v2/Hidro_v2.map&TRANSPARENT=true",
            {layers: 'hidro_v2_strahler', transparent: true},
            {opacity: 1, visibility: false});
    wms_casetas = new OpenLayers.Layer.WMS("Mar de Fondo",
            "http://10.1.32.183/antares/maps.fcgi?map=/maps/afectaciones/Afectaciones.map&TRANSPARENT=true",
            {layers: 'mar_fondo_pacific_edos_2015,mar_fondo_pacific_mpios_2015,mar_fondo_pacific_afect_2015', transparent: true},
            {opacity: 1, visibility: false});
    /***********************************    C A P A S    V E C T O R E S  **************************************/
    vectors1 = new OpenLayers.Layer.Vector("Puntos Ruta", {
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                externalGraphic: "img/punto_verde.png",
                graphicOpacity: 1,
                rotation: 0,
                pointRadius: 30
            }, OpenLayers.Feature.Vector.style["default"])),
            "select": new OpenLayers.Style({
                externalGraphic: "img/punto_rojo.png"
            })
        })
    });
    var layers_base = [base1, base2];  //,road, aerial, hybrid];  
    var layers_wms = [wms_nubes, wms_road, wms_hidro1, wms_hidro2, wms_casetas];
    map.addLayers(layers_base); // Agregar capas base
    //  map.addLayers(gmaps);
    map.addLayers(layers_wms);  //Agregar capas wms
    map.addLayer(vectors1);// Agregar Vectores
    map.addLayer(vector_layer);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    selectControl = new OpenLayers.Control.SelectFeature(
            [vectors1],
            {
                clickout: true, toggle: false,
                multiple: false, hover: false,
                toggleKey: "ctrlKey", // ctrl key removes from selection
                multipleKey: "shiftKey" // shift key adds to selection
            });
    map.addControl(selectControl);
    selectControl.activate();
    navigator.geolocation.getCurrentPosition(PermitirUbicacion, NoUbicacion);
}      ///////////////// TERMINA FUNCION Init()

function PermitirUbicacion(pos) {
    IrPosicion(pos.coords.longitude, pos.coords.latitude);
}

function NoUbicacion(pos) {
    IrPosicion(-104.62426, 24.03606);
}

function IrPosicion(lat, lon) {
    map.setCenter(
            new OpenLayers.LonLat(lat, lon).transform(
            new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 13
            );
    // vectors1.addFeatures(createFeatures());
    vectors1.events.on({
        "featureselected": function (e) {
            showStatus("selected feature " + e.feature.id + " on Vector Layer 1");
        },
        "featureunselected": function (e) {
            showStatus("unselected feature " + e.feature.id + " on Vector Layer 1");
        }
    });
    var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();
}

function leeXML()
{
    // alert("entro2");
    if (window.XMLHttpRequest)
    {
        // Objeto para IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // Objeto para IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    //url="http://antares.inegi.org.mx/analisis/script_v2/sakbe/?make=CR&id_i="+id_i+"&source_i="+source_i+"&target_i="+target_i+"&id_f="+id_f+"&source_f="+source_f+"&target_f="+target_f+"&p=2&v=1&e=0";       
    url = "http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i=" + id_i + "&source_i=" + source_i + "&target_i=" + target_i + "&id_f=" + id_f + "&source_f=" + source_f + "&target_f=" + target_f + "&p=2&v=1&e=1&type=xml&key=SIATL";
    // alert("url" + url);

    //url="CalcularRuta.php?id_i="+id_i+"&source_i="+source_i+"&target_i="+target_i+"&id_f="+id_f+"&source_f="+source_f+"&target_f="+target_f+"&p=2&v=1&e=1"; 
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    xmlDoc = xmlhttp.responseXML;
    //document.getElementById('origen').value = url;
    //alert(xmlDoc);
    geoJSON = xmlDoc.getElementsByTagName("geojson")[0].childNodes[0].nodeValue;
    return geoJSON;
}

function EncuentraRoad(y, x, escala)
{
    if (window.XMLHttpRequest)
    {
        xmlhttp = new XMLHttpRequest(); // Objeto para IE7+, Firefox, Chrome, Opera, Safari
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // Objeto para IE6, IE5
    }
    try {
        //Math.round(escala)
        url = "http://gaia.inegi.org.mx/sakbe/wservice?make=IL&escala=" + escala + "&y=" + y + "&x=" + x + "&type=xml" + "&key=SIATL";
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        xmlDoc = xmlhttp.responseXML;
    } catch (err) {
        alert("mal" + err);
    }
    id_routing_net = xmlDoc.getElementsByTagName("id_routing_net")[0].childNodes[0].nodeValue;
    source = xmlDoc.getElementsByTagName("source")[0].childNodes[0].nodeValue;
    target = xmlDoc.getElementsByTagName("target")[0].childNodes[0].nodeValue;
    nombre = xmlDoc.getElementsByTagName("nombre")[0].childNodes[0].nodeValue;
    if (id_i === 0) {
        id_i = id_routing_net;
        source_i = source;
        target_i = target;
        //document.getElementById('origen').value = nombre;
    } else {
        id_f = id_routing_net;
        source_f = source;
        target_f = target;
        //document.getElementById('destino').value = nombre;
    }
    //location.href = "http://antares.inegi.org.mx/analisis/red_hidro/pruebas/OpenLayer/#openModal";
}


/***********  CREAR PUNTOS ALEATORIOS en Vectors1  **********************/
/*
 function createFeatures() {
 var extent = map.getExtent();
 var features = [];
 for(var i=0; i<10; ++i) {
 features.push(new OpenLayers.Feature.Vector(
 new OpenLayers.Geometry.Point(extent.left + (extent.right - extent.left) * Math.random(),
 extent.bottom + (extent.top - extent.bottom) * Math.random()
 )));
 }
 return features;
 }
 */

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
    var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=IL&escala=" + escala + "&y=" + y + "&x=" + x + "&type=json" + "&key=SIATL";
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

function getFeatures() {
    if (vectors1.features.length) {
        for (var i = 0; i < vectors1.features.length - 1; i++)
        {
            var url = "http://gaia.inegi.org.mx/sakbe/wservice?make=IL&escala=" + escala + "&y=" + y + "&x=" + x + "&type=xml" + "&key=SIATL";
            //alert(vectors1.features[i].geometry.bounds.bottom + " " + vectors1.features[i].geometry.bounds.left);
        }
    }
}

/*function multiRuteoInvertido() {
 if (destinos.length >= 2) {//deben existir mÃ­nimo 2 puntos
 var style_ruta = {
 strokeColor: "#0000EE",
 strokeWidth: 6,
 strokeDashstyle: "solid",
 pointRadius: 15,
 pointerEvents: "visiblePainted",
 title: "Ruta Sugerida",
 strokeOpacity: 0.5
 };
 var geojson_format = new OpenLayers.Format.GeoJSON();
 map.addLayer(vector_layer);
 try
 {
 for (var i = destinos.length - 1; i >= 1; i--) {
 var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i=" + destinos[i].id_routing_net + "&source_i=" + destinos[i].source + "&target_i=" + destinos[i].target + "&id_f=" + destinos[i - 1].id_routing_net + "&source_f=" + destinos[i - 1].source + "&target_f=" + destinos[i - 1].target + "&p=#tp&v=#veh&e=#ee&type=json&key=SIATL";
 var ruta = $('#tp').val();	
 var veh = $('#veh').val();
 var ejes = $('#ee').val();
 var urlApiBusquedaTmp = urlJson.replace('#tp',ruta);	
 urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#veh',veh);
 urlApiBusquedaTmp = urlApiBusquedaTmp.replace('#ee',ejes);
 $.getJSON(urlApiBusquedaTmp, function (data) {
 $.each(data, function (key, obj) {
 try {
 var vector_layer = new OpenLayers.Layer.Vector('Ruta ' + i, {style: style_ruta});
 vector_layer.addFeatures(geojson_format.read(obj.geojson));
 } catch (err)
 {
 alert("Ha ocurrido un error: " + err.message);
 }
 });
 });
 }
 } catch (err) {
 alert(err.message);
 }
 } else
 {
 //alerta
 }
 }*/

function multiRuteo() {
    if (destinos.length >= 2) {//deben existir mÃ­nimo 2 puntos
        /*var style_ruta = {
         strokeColor: "#0000EE",
         strokeWidth: 6,
         strokeDashstyle: "solid",
         pointRadius: 15,
         pointerEvents: "visiblePainted",
         title: "Ruta Sugerida",
         strokeOpacity: 0.5
         };*/
        limpiaRoads();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        try
        {
            //for (var i = destinos.length-1; i >= 1; i--) {
            for (var i = 0; i < destinos.length - 1; i++) {
                var urlJson = "http://gaia.inegi.org.mx/sakbe/wservice?make=CR&id_i=" + destinos[i].id_routing_net + "&source_i=" + destinos[i].source + "&target_i=" + destinos[i].target + "&id_f=" + destinos[i + 1].id_routing_net + "&source_f=" + destinos[i + 1].source + "&target_f=" + destinos[i + 1].target + "&p=#tp&v=#veh&e=#ee&type=json&key=SIATL";
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
                                codHtml += '<div id='+cd+' class="col-sm-9" onclick="funcionesRuteo();">' + value.direccion + '<div class="row"><div class="col-sm-4"><h6><small>' + (((value.long_m) / 1000).toFixed(2)) + ' Kms </small></h6></div> ' 
                                        + '<div class="col-sm-4"><h6><small>'+ parseInt(m1) + ' m ' + parseInt(s1) + ' s </small></h6></div>';		
                               codHtml += '<div class="col-sm-4"><h6><small>Caseta: $26</small></h6></div></div></div></div></a>';
                                $panel.append(codHtml);
                                cd++;
                                t = t + parseFloat(value.tiempo_min);
                                k = k + parseFloat(value.long_m);
                                c = c + parseFloat(value.costo_caseta);
                    })
                    tt= t*60;
                    h = Math.floor( tt / 3600 );
                    m = Math.floor( (tt % 3600) / 60 );
                    s = tt % 60;
                    m = m < 10 ? '0' + m : m;
                    s = s < 10 ? '0' + s : s;
                    d = k/1000;
                    var cc=((k/1000)/ren)*comb;
                    var ct=cc+c;
                    $('#detalles').html(codHtml);
                    if ((ren < 2) || (ren > 49)){
                        codHtml2 = "Rendimiento invalido, por favor ingrese un valor entre 2 y 49 km/lt";
                         $('#est').html(codHtml2);
                    }
                    else {
                    if (h>=1){
                    codHtml2 +='<div><div><b> Distancia </b><br>'+d.toFixed(2)+' Kms</b></div><div><b> Tiempo</b><br>'+h.toFixed(0)+' h '+m.toFixed(0)+' m '+s.toFixed(0)+' s </div><div><b> Peaje </b><br> $'+c.toFixed(2)+' pesos</div></tr><tr><div><b> Costo combustible </b><br> $'+cc.toFixed(2)+' pesos</div><div><b> Costo total </b><br> $'+ct.toFixed(2)+' pesos</div></tr></div>';
                    codHtml2 += '</div>';
                    $('#est').html(codHtml2);
                    }
                    else {
                    m = t
                    codHtml2 += '<div><div><b> Distancia </b><br>'+d.toFixed(2)+' Kms</b></div><div><b> Tiempo</b><br>0 h '+m.toFixed(0)+' m '+s.toFixed(0)+' s </div><div><b> Peaje </b><br> $'+c.toFixed(2)+' pesos</div></tr><tr><div><b> Costo combustible </b><br> $'+cc.toFixed(2)+' pesos</div><div><b> Costo total </b><br> $'+ct.toFixed(2)+' pesos</div></tr></div>';
                    codHtml2 += '</div>';
                    $('#est').html(codHtml2);    
                    }
                    d=0;
                    h=0;
                    m=0;
                    c=0;
                    cc=0;
                    ct=0;
                    
                }})
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
/*function limpiaRuta() {
    //el ultimo commit mio tiene solo para limpiar los inputs...
    //Se va a modificar para que al dar clic se llene el nombre en el input vacÃ­o prÃ³ximo.
    limpiaArrays();
    limpiaImputs();
    limpiaPuntos();
    limpiaRoads();
}*/

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
