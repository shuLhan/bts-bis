<?php

include "JaringDB.php";

$db = null;
$db_url = "pgsql:dbname=dm_bts_gangguan;host=127.0.0.1";
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
select GK.nama as name, count(G.id_tanggal_gangguan) as y
from bts_gangguan_2 G
, bts_gangguan_kategori GK
, tanggal T
where G.id_gangguan_kategori = GK.id
and G.id_tanggal_gangguan = T.id_tanggal
and T.tahun = 2015
and T.bulan = 4
group by GK.nama
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
