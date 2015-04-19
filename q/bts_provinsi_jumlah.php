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
	$year = $_GET["year"];

	$db = new JaringDB ($db_url, $db_user, $db_pass, 1, 5);

	$db->init ();

	$q = "
select	BTS.nama_provinsi
,	BTS.jumlah_bts
,	G.jumlah_gangguan
,	K.jumlah_komplain
from
(
	select	nama_provinsi
	,	(sum(jumlah_bts_2g) + sum(jumlah_bts_3g) + sum(jumlah_bts_4g)) as jumlah_bts
	from	bts_lokasi_jumlah_mode
	group by nama_provinsi
	order by nama_provinsi
) BTS
left outer join (
		select	L.nama_provinsi
		,	count(BG.id_gangguan_kategori) as jumlah_gangguan
		from	bts_gangguan BG
		,	lokasi L
		,	tanggal T
		where	BG.id_lokasi = L.id_lokasi
		and	BG.id_tanggal_gangguan = T.id_tanggal
		and	T.tahun = ?
		group by L.nama_provinsi
	) G on G.nama_provinsi = BTS.nama_provinsi
left outer join (
	select	L.nama_provinsi
	,	count(KP.id_komplain_tipe) as jumlah_komplain
	from	komplain_pelanggan KP
	,	lokasi L
	,	tanggal T
	where	KP.id_lokasi = L.id_lokasi
	and	KP.id_tanggal = T.id_tanggal
	and	T.tahun = ?
	group by L.nama_provinsi
) K on K.nama_provinsi = G.nama_provinsi
order by nama_provinsi
	";

	$bindv[] = $year;
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
