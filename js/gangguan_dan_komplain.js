var dd_ys;
var dd_ms;
var dd_ye;
var dd_me;

var t_prov;
var t_kota;

var gk_lokasi;
var gangguan_komplain_data;
var gangguan_komplain_graph;

function table_prov_load (year)
{
	var url = "/q/bts_provinsi_jumlah.php?year="+ year;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (res.success) {
			t_prov.bootstrapTable ('load', res.data);
		}
	});
}

function table_kota_load (prov, year)
{
	var url = "/q/bts_kota_jumlah.php?nama_provinsi="+ prov +"&year="+ year;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (res.success) {
			t_kota.bootstrapTable ('load', res.data);
		}
	});
}

function gangguan_komplain_load_rand (prov)
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

function gangguan_komplain_load_prov (prov, year)
{
	var url = "/q/gangguan_komplain.php?nama_provinsi="+ prov +"&year="+ year;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (! res.success) {
			console.log ("Gagal load data gangguan dan komplain!");
			return;
		}

		gangguan_komplain_data.clear ();
		gangguan_komplain_data.add (res.data);

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
		gangguan_komplain_graph.setOptions ({
				start	: year +"-01"
			,	end		: year +"-12"
			});
		gangguan_komplain_graph.redraw ();

		gk_lokasi.html (prov +" tahun "+ year);
	});
}

function gangguan_komplain_load_kota (kota, year)
{
	var url = "/q/gangguan_komplain_kota.php?nama_kota="+ kota +"&year="+ year;

	$.getJSON (url, function (res) {
		//console.log (res);

		if (! res.success) {
			console.log ("Gagal load data gangguan dan komplain!");
			return;
		}

		gangguan_komplain_data.clear ();
		gangguan_komplain_data.add (res.data);

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
		gangguan_komplain_graph.setOptions ({
				start	: year +"-01"
			,	end		: year +"-12"
			});
		gangguan_komplain_graph.redraw ();

		gk_lokasi.html (kota +" tahun "+ year);
	});
}

function gk_table_init (year)
{
	/*
	 * Table Provinsi dan Kota
	 */
	t_prov = $("#provinsi_table");
	t_kota = $("#kota_table");

	table_prov_load (year);

	t_prov.on ("click-row.bs.table", function (row, el) {
		table_kota_load (el.nama_provinsi, dd_ys.val());
		gangguan_komplain_load_prov (el.nama_provinsi, dd_ys.val());
	});

	t_kota.on ("click-row.bs.table", function (row, el) {
		gangguan_komplain_load_kota (el.nama_kota, dd_ys.val());
	});
}

//
//	Grafik Gangguan dan Komplain.
//
function gk_graph_init ()
{
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
}

function gk_init ()
{
	// time selection element.
	dd_ys = $("#dd_year_start");
/*	dd_ye = $("#dd_year_end");
	dd_ms = $("#dd_month_start");
	dd_me = $("#dd_month_end");
*/
	dd_ys.selectmenu();
/*	dd_ye.selectmenu();
	dd_ms.selectmenu();
	dd_me.selectmenu();
*/
	// Handle year end if year start change.
	// year-end >= year start
	dd_ys.selectmenu ({
		change: function (e, d)
		{
			// year end = year start + year current
			var from = parseInt (d.item.value);
/*			var to = parseInt (date_cur.format ("YYYY"));

			dd_ye.empty ();

			for (; to >= from; to--) {
				dd_ye.append ("<option>"+ to +"</option>");
			}

			dd_ye.selectmenu ("refresh");
*/

			table_prov_load (from);
		}
	});

	/*
	 * if year-start == year-end, make sure the month-end is greater than
	 * month-start.
	 */
/*	dd_ms.selectmenu ({
		change: function (e, d)
		{
			var ys = parseInt (dd_ys.val());
			var ms = parseInt (d.item.value);
			var ye = parseInt (dd_ye.val());

			$("#dd_month_end option").removeAttr ("disabled");
			dd_me.selectmenu ("refresh");

			if (ys != ye) {
				return;
			}
			if (ms == 0) {
				return;
			}

			for (ms--; ms >= 0; ms--) {
				$("#dd_month_end option[value='"+ ms +"']").attr ("disabled","disabled");
			}
			dd_me.selectmenu ("refresh");
		}
	});
*/
	gk_table_init (dd_ys.val());
	gk_graph_init ();
}
