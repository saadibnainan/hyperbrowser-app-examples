export function generateReport(totalOrig: number, totalOpt: number, table: any[]) {
  const percent = ((totalOrig - totalOpt) / totalOrig * 100).toFixed(2);
  return {
    summary: { totalOrig, totalOpt, percent },
    table,
  };
} 