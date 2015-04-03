var osm;
var bts;
var g2 = L.layerGroup ();
var g3 = L.layerGroup ();
var g4 = L.layerGroup ();
var info;

function get_color (mode)
{
	return	mode == '4G' ? '#FF0000' :
			mode == '3G' ? '#00FF00' :
					'#0000FF';
}

function bts_on_click (e)
{
	var bts_data = bts[e.target.options.bts_idx];

	info.update (bts_data.id, bts_data.mode);
}

function map_load_bts ()
{
	$.getJSON ("/q/bts.php", function (res) {
		bts = res.data;
		var mode = '';

		for (var i = 0; i < res.total; i++) {
			mode = bts[i].mode;
			color = get_color (mode);

			var circle = L.circle ([bts[i].lat, bts[i].lon, 2], 60, {
					color		: color
				,	fillColor	: color
				,	fillOpacity	: 0.5
				,	bts_idx		: i
				});

			circle.on ("click", bts_on_click);

			mode == '4G' ? g4.addLayer (circle) :
			mode == '3G' ? g3.addLayer (circle) :
				g2.addLayer (circle);
		}
	});
}

function map_create_info ()
{
	info = L.control({ position: 'bottomright' });

	info.onAdd = function (map) {
		// create a div with a class "info"
		this._div = L.DomUtil.create ('div', 'info');
		this.update ("()", "()");
		return this._div;
	};

	info.update  = function (id, mode)
	{
		this._div.innerHTML = '<strong>ID BTS: '+ id +' </strong><br>'
			+'<strong> Mode : '+ mode +'</strong>';
	}

	info.addTo (map);
}

function map_create_legend ()
{
	var legend = L.control({position: 'bottomleft'});

	legend.onAdd = function (map)
	{
		var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 1, 2],
		labels = [];

		// loop through our density intervals and generate a label with a colored square for each interval
		div.innerHTML = "BTS Mode<br/>"
			+'<i style="background:#FF0000"></i> 4G <br/>'
			+'<i style="background:#00FF00"></i> 3G <br/>'
			+'<i style="background:#0000FF"></i> 2G <br/>';

		return div;
	};

	legend.addTo(map);
}

$( document ).ready (function() {
	var layers =
	{
		"2G" : g2
	,	"3G" : g3
	,	"4G" : g4
	};

	var osm = L.tileLayer ('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
	,{
			attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		,	maxZoom: 18
	});

	map = L.map ('map', {
			dragging	: true
		,	layers		: [osm, g2, g3, g4]
		}).setView ([-6.9121804752107305, 107.60644912719728], 13);

/*
	map.on('click', function(e) {
		console.log ("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
		console.log (e);
	});
*/

	L.control.layers (null, layers).addTo (map);

	map_create_info ();
	map_load_bts ();
	map_create_legend ();
});
