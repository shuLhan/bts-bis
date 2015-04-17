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

	$out['total'] = 1;

	$q = "
select	BG.id_bts
,		B.nama_bts_mode	as mode
,		B.nama_kota ||', '|| B.nama_provinsi as lokasi
,		count(BG.id_bts) as jumlah_gangguan
from	bts B
,		bts_gangguan BG
where	B.id_bts = BG.id_bts
and		BG.id_bts = ?
group by BG.id_bts, B.nama_bts_mode, B.nama_kota, B.nama_provinsi;
	";

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
