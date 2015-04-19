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
	$year = $_GET["year"];

	$db = new JaringDB ($db_url, $db_user, $db_pass, 1, 5);

	$db->init ();

	$q =
"
(
	select	T.tahun ||'-'|| lpad (cast (T.bulan as char(2)),2,'0') as x
	,	count(BG.id_gangguan_kategori) as y
	,	0 as group
	from	bts_gangguan BG
	,	lokasi L
	,	tanggal T
	where	BG.id_lokasi = L.id_lokasi
	and	BG.id_tanggal_gangguan = T.id_tanggal
	and	L.nama_provinsi = ?
	and	T.tahun = ?
	group by T.tahun, T.bulan
)
UNION
(
	select	T.tahun ||'-'|| lpad (cast (T.bulan as char(2)),2,'0') as x
	,	count(KP.id_komplain_tipe) as y
	,	1 as group
	from	komplain_pelanggan KP
	,	lokasi L
	,	tanggal T
	where	KP.id_lokasi = L.id_lokasi
	and	KP.id_tanggal = T.id_tanggal
	and	L.nama_provinsi = ?
	and	T.tahun = ?
	group by T.tahun, T.bulan
)
";

	$bindv[] = $nama_prov;
	$bindv[] = $year;
	$bindv[] = $nama_prov;
	$bindv[] = $year;

	$rs = $db->execute ($q, $bindv);
	$out['data'] = $rs;

} catch (Exception $e) {
	$out['success'] = false;
	$out['msg'] = $e->getMessage();
} finally {
	header("Content-Type: application/json");
	echo json_encode ($out, JSON_NUMERIC_CHECK);
}
