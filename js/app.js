var osm;
var bts;
var g2 = L.layerGroup ();
var g3 = L.layerGroup ();
var g4 = L.layerGroup ();
var info;
var bts_trans_graph;
var bts_trans_data;
var date_start;
var date_end;
var bts_id;

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

	bts_id = bts_data.id;

	bts_trans_load (bts_id);
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

function bts_trans_init ()
{
	date_start = moment().startOf("month");
	date_end = moment().endOf("month");

	$( "#tr_date_start" ).datepicker ("setDate", date_start.format("YYYY-MM-DD"));
	$( "#tr_date_end" ).datepicker ("setDate", date_end.format("YYYY-MM-DD"));

	bts_trans_graph.setOptions ({
			start: date_start.format("YYYY-MM-DD")
		,	end: date_end.format("YYYY-MM-DD")
		});
}

function bts_trans_load (id)
{
	var url = "/q/bts_transaksi_hari.php?id="+ id;

	date_start = moment ($("#tr_date_start").datepicker ("getDate"));
	date_end = moment ($("#tr_date_end").datepicker ("getDate"));

	var dt = date_start.toArray ();
	url += "&y0="+ dt[0] +"&m0="+ (dt[1]+1) +"&d0="+ dt[2];

	dt = date_end.toArray ();
	url += "&y1="+ dt[0] +"&m1="+ (dt[1]+1) +"&d1="+ dt[2];

	console.log (url);

	$.getJSON (url, function (res) {
		console.log (res);
		if (res.success) {
			bts_trans_data.clear ();
			bts_trans_data.add (res.data);

			var group = new vis.DataSet ();

			group.add ({
					id : 0
				,	content : "Jumlah transaksi"
				,	className : 'graph_line'
				});

			bts_trans_graph.setGroups (group);
			bts_trans_graph.setItems (bts_trans_data);
			bts_trans_graph.setOptions ({
				start: date_start.format("YYYY-MM-DD")
			,	end: date_end.format("YYYY-MM-DD")
			});
			bts_trans_graph.redraw ();
		}
	});
}

$( document ).ready (function() {
	var layers =
	{
		"2G" : g2
	,	"3G" : g3
	,	"4G" : g4
	};
/*
	var osm = L.tileLayer ('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
	,{
			attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		,	maxZoom: 18
	});

	map = L.map ('map', {
			dragging	: true
		,	layers		: [osm, g2, g3, g4]
		}).setView ([-6.9121804752107305, 107.60644912719728], 13);

	L.control.layers (null, layers).addTo (map);

	map_create_info ();
	map_load_bts ();
	map_create_legend ();
*/
/*
	map.on('click', function(e) {
		console.log ("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
		console.log (e);
	});
*/

	/*
	 * BTS Transaksi Graph
	 */
	$( "#tr_date_start" ).datepicker ({
		changeMonth	: true
	,	changeYear	: true
	,	dateFormat	: 'yy-mm-dd'
	,	minDate		: '2005-01-01'
	,	maxDate		: '2015-12-31'
	,	onClose		: function (selectedDate)
		{
			$( "#tr_date_end" ).datepicker ("option", "minDate", selectedDate);
		}
	});

	$( "#tr_date_end" ).datepicker ({
		changeMonth	: true
	,	changeYear	: true
	,	dateFormat	: 'yy-mm-dd'
	,	minDate		: '2005-01-01'
	,	maxDate		: '2015-12-31'
	,	onClose		: function (selectedDate)
		{
			$( "#tr_date_start" ).datepicker ("option", "maxDate", selectedDate);
		}
	});

	var comp = document.getElementById ("bts_transaksi_graph");

	bts_trans_data = new vis.DataSet({});

	var group = new vis.DataSet ();

	group.add ({
			id : 0
		,	content : "Jumlah transaksi"
		,	className : 'graph_line'
		});

	bts_trans_graph = new vis.Graph2d (comp, bts_trans_data, group, {
			height	: '220px'
		,	style	: 'line'
		});

	bts_trans_init ();

	bts_id = 31523;

	$("#bts_trans_reload").click (function (e)
	{
		bts_trans_load (bts_id);
	});
});
