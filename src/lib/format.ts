export const usd = (amount: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", maximumFractionDigits: 2,
}).format(amount);
export const price = (amount: number) => "$" + amount.toPrecision(6);
export const short = (value: string) => value.length > 16 ? value.slice(0, 7) + "…" + value.slice(-5) : value;
