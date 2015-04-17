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

	$bindv[] = $_GET['id'];

	$q = "
select	count(*) as total
from bts_gangguan BG
, tanggal T
where BG.id_tanggal_gangguan = T.id_tanggal
and BG.id_bts = ?
group by BG.id_tanggal_gangguan
order by BG.id_tanggal_gangguan desc
limit 10
	";

	$rs = $db->execute ($q, $bindv);

	if (count ($rs) > 0) {
		$out['total'] = (int) $rs[0]["total"];
	}

	$q = "
select T.tahun
	||'-'|| lpad(cast(T.bulan as char(2)), 2, '0')
	||'-'|| lpad(cast(T.hari as char(2)), 2, '0') as tanggal
,	BG.nama_gangguan_kategori
,	1 as status
from bts_gangguan BG
, tanggal T
where BG.id_tanggal_gangguan = T.id_tanggal
and BG.id_bts = ?
order by BG.id_tanggal_gangguan desc
limit 10
	";

	$rs = $db->execute ($q, $bindv);
	$out['data'] = $rs;

} catch (Exception $e) {
	$out['success'] = false;
	$out['msg'] = $e->getMessage();
} finally {
	header("Content-Type: application/json");
	echo json_encode ($out, JSON_NUMERIC_CHECK);
}
