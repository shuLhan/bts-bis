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

	$q =
"
select KT.nama as name, count(KP.id_tanggal) as y
from komplain_pelanggan KP
, komplain_tipe KT
, tanggal T
where KP.id_komplain_tipe = KT.id
and KP.id_tanggal = T.id_tanggal
and T.tahun = 2015
and T.bulan = 4
group by KT.nama
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
