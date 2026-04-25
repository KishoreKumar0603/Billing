export const formatCurrency = (
  n
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,
    }
  ).format(n || 0);

export const formatNumber = (
  n
) =>
  new Intl.NumberFormat(
    "en-IN"
  ).format(n || 0);

export const formatDate = (
  d
) =>
  new Date(d).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );