import * as XLSX from 'xlsx';

export const exportToExcel = (excelData:any, filename:any) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

const s2ab = (s:any) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
};
