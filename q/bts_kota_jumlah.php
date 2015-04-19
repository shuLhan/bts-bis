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
/*
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
*/
	$q = "
select	BTS.nama_kota
,	BTS.jumlah_bts
,	G.jumlah_gangguan
,	K.jumlah_komplain
from
(
	select	nama_kota
	,		(sum(jumlah_bts_2g) + sum(jumlah_bts_3g) + sum(jumlah_bts_4g)) as jumlah_bts
	from	bts_lokasi_jumlah_mode
	where	nama_provinsi = ?
	group by nama_kota
	order by nama_kota
) BTS
left outer join (
		select	L.nama_kota
		,		count(BG.id_gangguan_kategori) as jumlah_gangguan
		from	bts_gangguan BG
		,		lokasi L
		,		tanggal T
		where	BG.id_lokasi			= L.id_lokasi
		and		BG.id_tanggal_gangguan	= T.id_tanggal
		and		L.nama_provinsi			= ?
		and		T.tahun					= ?
		group by L.nama_kota
		order by L.nama_kota
	) G on G.nama_kota = BTS.nama_kota
left outer join (
		select	L.nama_kota
		,		count(KP.id_komplain_tipe) as jumlah_komplain
		from	komplain_pelanggan KP
		,		lokasi L
		,		tanggal T
		where	KP.id_lokasi	= L.id_lokasi
		and		KP.id_tanggal	= T.id_tanggal
		and		L.nama_provinsi	= ?
		and		T.tahun			= ?
		group by L.nama_kota
		order by L.nama_kota
	) K on K.nama_kota = G.nama_kota
order by nama_kota
	";

	$bindv[] = $nama_prov;
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
