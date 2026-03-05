document.addEventListener("DOMContentLoaded"), () => {
    // const NetInput = document.querySelector("#NetInput");
    // const WinInput = document.querySelector("#WinInput");
    // const OtherIncomeInput = document.querySelector("#OtherIncomeInput");
    // const MortgageInput = document.querySelector("#MortgageInput");
    // const InsuranceHouseInput = document.querySelector("#InsuranceHouseInput");
    // const PropTaxInput = document.querySelector("#PropTaxInput");
    // const UtilInput = document.querySelector("#UtilInput");
    // const GroceriesInput = document.querySelector("#GroceriesInput");
    // const CareInput = document.querySelector("#CareInput");
    // const InsuranceHealthInput = document.querySelector("#InsuranceHealthInput");
    // const 
    const income = document.getElementById("article.income input"),
        housing = document.getElementById("article.housing input"),
        health = document.getElementById("article.health input"),
        auto = document.getElementById("article.auto input"),
        education = document.getElementById("article.education input"),
        loans = document.getElementById("article.loans input"),
        savings = document.getElementById("article.savings input"),
        giving = document.getElementById("article.giving input"),
        misc = document.getElementById("article.misc input");
    // Use all of these inside of the function to calculate the total monthtly expenses.

    // Do if statements for each of the categories, including housing, health, etc.
    function createTotal(income, housing, health, auto, education, loans, savings, giving, misc) {
        inputs.forEach(input => {
            income.addEventListener("input", () => {
                const totalIncome = calculateTotalIncome();
                document.querySelector("#totalIncome").textContent = totalIncome;

                if (income != 0, undefined, null, NaN, typeof(income) != string) {
                    const totalIncome = calculateTotalIncome();
                    document.querySelector("#totalIncome").textContent = totalIncome;
                }
            });
            housing.addEventListener("input", () => {
                const totalHousing = calculateTotalHousing();
                document.querySelector("#totalHousing").textContent = totalHousing;
            });

            health.addEventListener("input", () => {
                const totalHealth = calculateTotalHealth();
                document.querySelector("#totalHealth").textContent = totalHealth;
            });

            auto.addEventListener("input", () => {
                const totalAuto = calculateTotalAuto();
                document.querySelector("#totalAuto").textContent = totalAuto;
            });

            education.addEventListener("input", () => {
                const totalEducation = calculateTotalEducation();
                document.querySelector("#totalEducation").textContent = totalEducation;
            });

            loans.addEventListener("input", () => {
                const totalLoans = calculateTotalLoans();
                document.querySelector("#totalLoans").textContent = totalLoans;
            });

            savings.addEventListener("input", () => {
                const totalSavings = calculateTotalSavings();
                document.querySelector("#totalSavings").textContent = totalSavings;
            });

            giving.addEventListener("input", () => {
                const totalGiving = calculateTotalGiving();
                document.querySelector("#totalGiving").textContent = totalGiving;
            });

            misc.addEventListener("input", () => {
                const totalMisc = calculateTotalMisc();
                document.querySelector("#totalMisc").textContent = totalMisc;

            });
        });
    }
}




    input.dataset.expense
