export function formatShamsiDate(dateValue) {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "-";

  const options = {
    year: "numeric",  
    month: "long", 
    day: "numeric",  
  };

  return d.toLocaleDateString("fa-IR", options);
}
