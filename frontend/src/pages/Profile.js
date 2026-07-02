// Tambahkan field untuk memilih desa
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Desa</label>
  <select
    name="villageId"
    value={form.villageId || ''}
    onChange={handleChange}
    className="input-field"
  >
    <option value="">Pilih Desa</option>
    {villages.map(v => (
      <option key={v.id} value={v.id}>{v.name}</option>
    ))}
  </select>
</div>