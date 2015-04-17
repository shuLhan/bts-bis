var osm;
var bts;
var g2 = L.layerGroup ();
var g3 = L.layerGroup ();
var g4 = L.layerGroup ();
var info;
var bts_trans_graph;
var bts_trans_data;
var gangguan_komplain_graph;
var gangguan_komplain_data;
var date_start;
var date_end;
var bts_id;
var gk_lokasi;

var t_provinsi;
var t_kota;
var t_gangguan;

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
	bts_data_load (bts_id);
	bts_gangguan_load (bts_id);
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

	//console.log (url);

	$.getJSON (url, function (res) {
		//console.log (res);
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

function gangguan_komplain_init ()
{
	var start = moment().startOf("year");
	var end = moment().endOf("year");

	gangguan_komplain_graph.setOptions ({
			start: start.format("YYYY-MM")
		,	end: end.format("YYYY-MM")
		});
}

function gangguan_komplain_load (prov)
{
	var data = [];
	var m = moment();
	var month_end = m.format("M");

	for (i = 1; i <= month_end; i++) {
		var o = {};
		o.x = m.format ("YYYY-") + (i < 10 ? '0'+i : i);
		o.y = Math.floor(Math.random()*24);
		o.group = 0;

		data.push (o);

		o = {};
		o.x = m.format ("YYYY-") + (i < 10 ? '0'+i : i);
		o.y = Math.floor(Math.random()*24);
		o.group = 1;

		data.push (o);
	}

	//console.log (data);
	gangguan_komplain_data.clear ();
	gangguan_komplain_data.add (data);

	var group = new vis.DataSet ();

	group.add ({
			id : 0
		,	content : "Gangguan"
		,	className : 'bar_gangguan'
		});
	group.add ({
			id : 1
		,	content : "Komplain"
		,	className : 'bar_komplain'
		});

	gangguan_komplain_graph.setGroups (group);
	gangguan_komplain_graph.setItems (gangguan_komplain_data);
	gangguan_komplain_graph.redraw ();

	gk_lokasi.html (prov);
}

function bts_data_load (id)
{
	var url = "/q/bts_data.php?id="+ id;

	$("#bts_data_mode").html ("-");
	$("#bts_data_lokasi").html ("-");
	$("#bts_data_jml_gangguan").html ("-");

	$.getJSON (url, function (res) {
		//console.log (res);

		if (res.success) {
			$("#bts_data_mode").html (res.data[0].mode);
			$("#bts_data_lokasi").html (res.data[0].lokasi);
			$("#bts_data_jml_gangguan").html (res.data[0].jumlah_gangguan);
		}
	});
}

function bts_gangguan_load (id)
{
	var url = "/q/bts_last_10_gangguan.php?id="+ id;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (res.success) {
			t_gangguan.bootstrapTable ('load', res.data);
		}
	});
}

function gangguan_status_format (v)
{
    return '<span class="text-success glyphicon glyphicon-'
			+ (v == 1 ? 'ok' : 'remove')
			+'"></span>';
}

function totalTextFormatter(data)
{
	return 'Total';
}

function get_total_column (data, col_name)
{
	var total = 0;

	$.each(data, function (i, row) {
		total += eval("row." + col_name);
	});
	return total;
}

function totalBTS (data)
{
	return get_total_column (data, "jumlah_bts");
}

function totalGangguan (data)
{
	return get_total_column (data, "jumlah_gangguan");
}

function totalKomplain (data)
{
	return get_total_column (data, "jumlah_komplain");
}

function table_kota_load (prov)
{
	var url = "/q/bts_kota_jumlah.php?nama_provinsi=Provinsi "+ prov;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (res.success) {
			t_kota.bootstrapTable ('load', res.data);
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

	/*
		Grafik transaksi.
	*/
	var comp = document.getElementById ("bts_transaksi_graph");

	bts_trans_data = new vis.DataSet({});

	var group = new vis.DataSet ();

	group.add ({
			id : 0
		,	content : "Jumlah transaksi"
		,	className : 'graph_line'
		});

	bts_trans_graph = new vis.Graph2d (comp, bts_trans_data, group, {
			height		: '300px'
		,	style		: 'line'
		,	clickToUse	: true
		});

	bts_trans_init ();

	bts_id = 31523;

	$("#bts_trans_reload").click (function (e)
	{
		bts_trans_load (bts_id);
	});

	bts_data_load (bts_id);
	bts_trans_load (bts_id);
	bts_gangguan_load (bts_id);

	/*
	 * Table Provinsi, Kota dan Gangguan.
	 */
	t_prov = $("#provinsi_table");
	t_kota = $("#kota_table");
	t_gangguan = $("#gangguan_table");

	t_prov.on ("click-row.bs.table", function (row, el) {
		table_kota_load (el.nama_provinsi);
		gangguan_komplain_load ("Provinsi "+ el.nama_provinsi);
	});

	t_kota.on ("click-row.bs.table", function (row, el) {
		gangguan_komplain_load (el.nama_kota);
	});

	/*
		Grafik Gangguan dan Komplain.
	*/
	gk_lokasi = $("#gk_lokasi");
	var comp = document.getElementById ("gangguan_komplain_graph");

	gangguan_komplain_data = new vis.DataSet({});

	var group = new vis.DataSet ();

	group.add ({
			id : 0
		,	content : "Gangguan"
		,	className : 'bar_gangguan'
		});
	group.add ({
			id : 1
		,	content : "Komplain"
		,	className : 'bar_komplain'
		});

	gangguan_komplain_graph = new vis.Graph2d (comp, gangguan_komplain_data, group, {
			height		: '300px'
		,	style		: 'bar'
		,	clickToUse	: true
		,	legend		: true
		,	barChart	:
			{
				handleOverlap : "sideBySide"
			}
		});

	gangguan_komplain_init ();
});
