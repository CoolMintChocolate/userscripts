const RUNNING_BALANCE_CLASS = "amex-userscript-running-balance";

function parseAmount(text: string): number {
  // Handles "$3,859.43", "-$179.16", "($179.16)" (parentheses = negative)
  const clean = text
    .replace(/[$,\s]/g, "")
    .replace(/^\((.+)\)$/, "-$1");
  return parseFloat(clean);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function injectRunningBalances(): void {
  const balanceEl = document.querySelector(
    '[data-testid="myca-activity-balances-vitals_totalBalance"] [data-testid="formatted-number"]'
  );
  if (!balanceEl?.textContent) return;

  const rows = document.querySelectorAll<HTMLElement>(
    '[data-testid="transaction-table-row"]'
  );
  if (rows.length === 0) return;

  // Remove previously injected elements before recalculating
  for (const el of document.querySelectorAll(`.${RUNNING_BALANCE_CLASS}`)) {
    el.remove();
  }

  const totalBalance = parseAmount(balanceEl.textContent);
  if (Number.isNaN(totalBalance)) return;

  let runningBalance = totalBalance;

  for (const row of rows) {
    const amountEl = row.querySelector('[data-testid="transaction-amount"]');
    if (!amountEl?.textContent) continue;

    const amount = parseAmount(amountEl.textContent);
    if (Number.isNaN(amount)) continue;

    runningBalance -= amount;

    const label = document.createElement("em");
    label.className = RUNNING_BALANCE_CLASS;
    label.textContent = formatCurrency(runningBalance);
    label.style.cssText = "display: block; font-size: 0.85em; color: inherit;";
    amountEl.insertAdjacentElement("afterend", label);
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(injectRunningBalances, 300);
});

observer.observe(document.body, { childList: true, subtree: true });
