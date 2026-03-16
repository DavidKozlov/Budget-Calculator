// Wait until DOM is ready (script is deferred but keep this for safety)
document.addEventListener('DOMContentLoaded', () => {
  const selectElement = document.getElementById('occu');
  const salaryEl = document.getElementById('salary');
  const taxContainer = document.getElementById('taxContainer');
  const otherTaxContainer = document.getElementById("otherTaxContainer")

  // Career Selector: populate dropdown from remote data and map occupation->salary
  async function careerSelect() {
    const occupationSalaryMap = new Map();
    try {
      const response = await fetch('https://eecu-data-server.vercel.app/data');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const users = await response.json();
      users.forEach(user => {
        const occ = user['Occupation'];
        const sal = Number(user['Salary']) || 0;
        occupationSalaryMap.set(occ, sal);
        const option = new Option(occ, occ);
        selectElement.add(option);
      });

      selectElement.addEventListener('change', () => {
        const occ = selectElement.value;
        const sal = occupationSalaryMap.get(occ) || 0;
        // display salary and computed post-tax income
        salaryEl.textContent = sal ? sal.toLocaleString() : '';
        const tax = calculateTax(sal);
        const postTax = sal - tax;
        const otherTax = (sal * 0.1165);
        const med = (sal * 0.0145)
        const soc = (sal * 0.062)
        const sta = (sal * 0.04)
        taxContainer.textContent = postTax ? `$${postTax.toLocaleString(undefined, {maximumFractionDigits:2})}` : '';
        otherTaxContainer.textContent = otherTax? `$${med.toLocaleString(undefined, {maximumFractionDigits:2})} + $${soc.toLocaleString(undefined, {maximumFractionDigits:2})} + $${sta.toLocaleString(undefined, {maximumFractionDigits:2})}` : ''
      });
    } catch (error) {
      console.error('Error populating user select:', error);
    }
  }

  careerSelect();

  // Tax Calculator — accepts a numeric gross annual income and returns tax amount
  function calculateTax(income_in) {
    income_in = Number(income_in) || 0;
    const medTax = income_in * 0.0145;
    const socialTax = income_in * 0.062;
    const stateTax = income_in * 0.04;
    const brackets = [
      { limit: 12400, rate: 0.10 },
      { limit: 50400, rate: 0.12 },
      { limit: Infinity, rate: 0.22 }
    ];

    let tax = 0;
    let previousLimit = 0;
    for (const bracket of brackets) {
      if (income_in > bracket.limit) {
        tax += (bracket.limit - previousLimit) * bracket.rate;
        previousLimit = bracket.limit;
      } else {
        tax += (income_in - previousLimit) * bracket.rate;
        break;
      }
    }
    return (tax - (medTax + socialTax + stateTax));
  }
});
