export function formatDateTime(dateString) {
  if (!dateString) return { date: "—", time: "—" };

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return { date: "—", time: "—" };

  const dateFormatted = date.toLocaleDateString("fa-IR");
  const timeFormatted = date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    date: dateFormatted,
    time: timeFormatted,
  };
}