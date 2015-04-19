<?php

include "JaringDB.php";

$db = null;
$db_url = "pgsql:dbname=dm_bts_transaksi_penggunaan;host=127.0.0.1";
$db_user = "telkomsel";
$db_pass = "telkomsel";
$db_table = "bts_lokasi_jumlah_mode";
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
		select	sum(jumlah_bts_2g) as g2
		,		sum(jumlah_bts_3g) as g3
		,		sum(jumlah_bts_4g) as g4
		from	". $db_table ."
	";

	$rs = $db->execute ($q);
	$out['data'] = $rs;
	$out['total'] = 1;

} catch (Exception $e) {
	$out['success'] = false;
	$out['msg'] = $e->getMessage();
} finally {
	header("Content-Type: application/json");
	echo json_encode ($out, JSON_NUMERIC_CHECK);
}
