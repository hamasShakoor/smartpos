export const fc = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-PK');
export const fd = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
export const fdShort = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });
export const pct = (val, total) => total ? Math.round((val / total) * 100) : 0;
