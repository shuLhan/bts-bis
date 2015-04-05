<?php

include "JaringDB.php";

$db = null;
$db_url = "pgsql:dbname=dm_bts_transaksi_penggunaan;host=127.0.0.1";
$db_user = "telkomsel";
$db_pass = "telkomsel";
$out = [
	"success"	=> true
,	"total"		=> 0
,	"message"	=> ""
,	"data"		=> []
];

try {
	$db = new JaringDB ($db_url, $db_user, $db_pass, 1, 5);

	$db->init ();

	$q = "
		select	count(*) as total
		from	bts_transaksi_hari
	";

	$rs = $db->execute ($q);

	if (count ($rs) > 0) {
		$out['total'] = (int) $rs[0]["total"];
	}

	$q = "
		select	T.tahun
				||'-'|| lpad (cast (T.bulan as char(2)),2,'0')
				||'-'|| lpad (cast (T.hari as char(2)),2,'0') as x
		,		coalesce(BTH.jumlah_transaksi,0) as y
		,		0 as group
		from	bts_transaksi_hari BTH
		,		tanggal T
		,		(
					select	id_tanggal
					from	tanggal
					where	tahun = ? and bulan = ? and hari = ?
				) tstart
		,		(
					select	id_tanggal
					from	tanggal
					where	tahun = ? and bulan = ? and hari = ?
				) tend
		where	BTH.id_bts = ?
		and		BTH.id_tanggal = T.id_tanggal
		and		BTH.id_tanggal >= tstart.id_tanggal
		and		BTH.id_tanggal <= tend.id_tanggal
	";

	$bindv[] = $_GET['y0'];
	$bindv[] = $_GET['m0'];
	$bindv[] = $_GET['d0'];
	$bindv[] = $_GET['y1'];
	$bindv[] = $_GET['m1'];
	$bindv[] = $_GET['d1'];
	$bindv[] = $_GET['id'];

	$rs = $db->execute ($q, $bindv);
	$out['data'] = $rs;

} catch (Exception $e) {
	$out['success'] = false;
	$out['msg'] = $e->getMessage();
} finally {
	header("Content-Type: application/json");
	echo json_encode ($out, JSON_NUMERIC_CHECK);
}
