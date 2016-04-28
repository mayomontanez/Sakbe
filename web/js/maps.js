/* 
 * En este .js se hace la carga del mapa, las capas y se configuran las proyecciones a usar.
 * mayomontanez
 */

var map;
var apiKey = "Ar3-LKk-acyISMevsF2bqH70h21mzr_FN9AhHfi7pS26F5hMH1DmpI7PBK1VCLBk";
var base1, base2, base3, baseGoogle;
var wms_nubes, wms_road, wms_hidro1, wms_hidro2, wms_casetas;
var vectors1;

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

function getPointClick(e) {
    var lonlat = map.getLonLatFromPixel(e.xy);
    EncuentraRoadJson(lonlat.lat, lonlat.lon, map.getScale(), true);
}

function mapBaseLayerChanged(event) {
    //alert(event.type + " " + event.layer.name);
}

function init() {
    /*var options = {
     zoom: 9
     , center: new google.maps.LatLng(-102, 21)
     , mapTypeId: google.maps.MapTypeId.ROADMAP
     , visible: false
     };
     map = new google.maps.Map(document.getElementById('map'), options);*/
    
    baseGoogle = new OpenLayers.Layer.Google(
            "Google Satellite",
            {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
    );
    
    map = new OpenLayers.Map('map', {
        controls: [
            new OpenLayers.Control.Navigation(),
            //new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.LayerSwitcher({'ascending': false}),
            new OpenLayers.Control.Permalink(),
            //new OpenLayers.Control.ScaleLine(),
            new OpenLayers.Control.Permalink('http://www.inegi.org.mx'),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.KeyboardDefaults()
        ],
        layers: [
            baseGoogle/*,
             new OpenLayers.Layer.Google(
             "Google Hybrid",
             {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
             ),
             new OpenLayers.Layer.Google(
             "Google Physical",
             {type: google.maps.MapTypeId.TERRAIN}
             ),
             new OpenLayers.Layer.Google(
             "Google Streets", // the default
             {numZoomLevels: 20}
             )*/
        ],
        projection: new OpenLayers.Projection('EPSG:900913'),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        numZoomLevels: 23,
        eventListeners: {
            /*"moveend": mapEvent,
            "zoomend": mapEvent,
            "changelayer": mapLayerChanged,*/
            "changebaselayer": mapBaseLayerChanged
        }
    });

    map.addControl(new OpenLayers.Control.MousePosition());
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.addControl(new OpenLayers.Control.LayerSwitcher({'div':OpenLayers.Util.getElement('layerswitcher')}));
    //

    base1 = new OpenLayers.Layer.WMS("Mapa Base INEGI",
            "http://gaiamapas1.inegi.org.mx/mdmCache/service/wms?",
            {layers: 'MapaBaseTopograficov61_sinsombreado'},
            {isBaseLayer: 'true'});

    base4 = new OpenLayers.Layer.WMS("Hipsografico INEGI",
            "http://gaiamapas1.inegi.org.mx/mdmCache/service/wms?",
            {layers: 'MapaBaseHipsografico'},
            {isBaseLayer: 'true'});

    base5 = new OpenLayers.Layer.WMS("OrtoFoto INEGI",
            "http://gaiamapas3.inegi.org.mx/mdmCache/service/wms?",
            {layers: 'MapaBaseOrtofoto'},
            {isBaseLayer: 'true'});

    /*var road = new OpenLayers.Layer.Bing({
     name: "BING Road",
     key: apiKey,
     type: "Road"
     });
     var hybrid = new OpenLayers.Layer.Bing({
     name: "BING Hybrid",
     key: apiKey,
     type: "AerialWithLabels"
     });
     var aerial = new OpenLayers.Layer.Bing({
     name: "BING Aerial",
     key: apiKey,
     type: "Aerial"
     });*/

    var wms_estados = new OpenLayers.Layer.WMS("Estados",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'PolEdos', transparent: true, format: 'image/jpeg', tiled: true},
            {opacity: 0.8, visibility: false});

    var wms_road = new OpenLayers.Layer.WMS("Carreteras",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'ROAD_L,ROAD_C', transparent: true},
            {opacity: 0.8, visibility: false});

    var wms_hidro = new OpenLayers.Layer.WMS("Hidro",
            " http://10.1.32.183/antares/maps.fcgi?map=/maps/v2/Hidro_v2.map&TRANSPARENT=true",
            {layers: 'hidro_v2', transparent: true},
            {opacity: 0.8, visibility: false});

    var wms_caminos = new OpenLayers.Layer.WMS("Caminos",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'CAMINO', transparent: true},
            {opacity: 0.8, visibility: false});

    var wms_vialidades = new OpenLayers.Layer.WMS("Vialidades",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'VIALIDAD', transparent: true},
            {opacity: 0.8, visibility: false});

    var wms_sesiones = new OpenLayers.Layer.WMS("Sesiones de Edición",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'Div5reservados', transparent: true},
            {opacity: 0.8, visibility: false});

    var wms_consultas = new OpenLayers.Layer.WMS("Consultas a SCT",
            "http://antares.inegi.org.mx/analisis/DYNWMS/RNC_etapa4.pl?",
            {layers: 'Consultas', transparent: true},
            {opacity: 0.8, visibility: false});

    /***********************************    C A P A S    V E C T O R E S  **************************************/
    vectors1 = new OpenLayers.Layer.Vector("Puntos Ruta", {
        styleMap: new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                externalGraphic: "img/punto_verde.png",
                graphicOpacity: 1,
                rotation: 0,
                pointRadius: 20,
                graphicYOffset: -37,
                graphicXOffset: -18
            }, OpenLayers.Feature.Vector.style["default"]))
        })
    });

    map.addLayers([base1/*, base4, base5, road, hybrid, aerial*/]);
    map.addLayers([wms_estados, wms_sesiones, wms_road, wms_hidro, wms_caminos, wms_vialidades, wms_consultas, vectors1]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());

    selectControl = new OpenLayers.Control.SelectFeature(
            [vectors1],
            {
                clickout: true, toggle: false,
                multiple: false, hover: false
                        //toggleKey: "ctrlKey", // ctrl key removes from selection
                        //multipleKey: "shiftKey" // shift key adds to selection
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
            new OpenLayers.LonLat(lat, lon).transform(new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject()),
            13
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