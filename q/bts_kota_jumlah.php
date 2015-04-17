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
	$nama_prov = $_GET['nama_provinsi'];

	$db = new JaringDB ($db_url, $db_user, $db_pass, 1, 5);

	$db->init ();

	$q = "
select	count(nama_kota) as total
from	bts_lokasi_jumlah
where	nama_provinsi = '$nama_prov'
group	by nama_kota
order by nama_kota;
	";

	$rs = $db->execute ($q);

	if (count ($rs) > 0) {
		$out['total'] = (int) $rs[0]["total"];
	}

	$q = "
select nama_kota
, sum(jumlah_bts) as jumlah_bts
, sum(jumlah_gangguan) as jumlah_gangguan
, sum(jumlah_komplain) as jumlah_komplain
from bts_lokasi_jumlah
where nama_provinsi = '$nama_prov'
group by nama_kota
order by nama_kota;
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
