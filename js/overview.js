var bc_bts_mode;
var bc_gangguan;
var bc_komplain;

function barchart_init_bts_mode ()
{
	var url = "/q/bts_lokasi_jumlah_mode.php";

	$.getJSON (url, function (res) {
		if (! res.success) {
			alert (res.message);
			return;
		}

		var mode_v = res.data[0];
		var bts_total = mode_v.g2 + mode_v.g3 + mode_v.g4;

		var data = [{
			y			: mode_v.g2
		,	color		: '#304CE8'
		,	name		: '2G'
		},{
			y			: mode_v.g3
		,	color		: '#B4ED5E'
		,	name		: '3G'
		},{
			y			: mode_v.g4
		,	color		: '#F82A2A'
		,	name		: '4G'
		}]

		bc_bts_mode = $("#barchart_bts_mode").highcharts({
				chart	: {
					type	:"pie"
				}
			,	title	: {
					text	:"Jumlah BTS per Mode"
				}
			,	subtitle: {
					text	:"Total : "+ bts_total +" BTS"
				}
			,	plotOptions: {
					series: {
						dataLabels:
						{
							enabled	: true
						,	format	: '{point.name}: {point.y}'
						,	style	:
							{
								"fontSize"		: "13px"
							}
						}
					}
				}
			,	series	: [{
					name	: "Jumlah"
				,	data	: data
				}]
			});
	});
}

function barchart_init_gangguan ()
{
	var url = "/q/jumlah_gangguan.php";

	$.getJSON (url, function (res) {
		if (! res.success) {
			alert (res.message);
			return;
		}

		var total = 0;

		for (var i = 0; i < res.data.length; i++) {
			total += res.data[i].y;
		}

		bc_gangguan = $("#barchart_gangguan").highcharts({
				chart	:
				{
					type	:"pie"
				}
			,	colors	:
				[
					'rgb(255, 254, 61)'
				,	'rgb(61, 255, 238)'
				,	'rgb(255, 124, 61)'
				]
			,	title	:
				{
					text	:"Jumlah Gangguan, Bulan "+ date_cur.format("MMMM")
				}
			,	subtitle:
				{
					text	:"Total : "+ total +" gangguan"
				}
			,	plotOptions	:
				{
					series		:
					{
						dataLabels	:
						{
							enabled			: true
						,	format			: '{point.name}:<br> {point.y}'
						,	connectorPadding: 0
						,	distance		: -20
						,	style			:
							{
								"fontSize"		: "13px"
							}
						}
					}
				}
			,	series	: [{
					name	: "Jumlah"
				,	data	: res.data
				}]
			});
	});
}

function barchart_init_komplain ()
{
	var url = "/q/jumlah_komplain.php";

	$.getJSON (url, function (res) {
		if (! res.success) {
			alert (res.message);
			return;
		}

		var total = 0;

		for (var i = 0; i < res.data.length; i++) {
			total += res.data[i].y;
		}

		bc_komplain = $("#barchart_komplain").highcharts({
				chart	: {
					type	:"pie"
				}
			,	colors	: ['#66A1FF','#FFC466']
			,	title	: {
					text	:"Jumlah Komplain, Bulan "+ date_cur.format("MMMM")
				}
			,	subtitle: {
					text	:"Total : "+ total +" komplain"
				}
			,	plotOptions: {
					series: {
						dataLabels: {
							enabled			: true
						,	format			: '{point.name}:<br> {point.y}'
						,	connectorPadding: 0
						,	distance		: -40
						,	style			:
							{
								"fontSize"		: "13px"
							}
						}
					}
				}
			,	series	: [{
					name	: "Jumlah"
				,	data	: res.data
				}]
			});
	});
}
