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
		from	bts B
	";

	$rs = $db->execute ($q);

	if (count ($rs) > 0) {
		$out['total'] = (int) $rs[0]["total"];
	}

	$q = "
		select	B.id_bts		as id
		,		B.latitude		as lat
		,		B.longitude		as lon
		,		B.nama_bts_mode	as mode
		from	bts B
	";

	$rs = $db->execute ($q);
	$out['data'] = $rs;

} catch (Exception $e) {
	$out['success'] = false;
	$out['msg'] = $e->getMessage();
} finally {
	header("Content-Type: application/json");
	echo json_encode ($out, JSON_NUMERIC_CHECK);
}
