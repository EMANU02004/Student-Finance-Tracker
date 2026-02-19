
let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const productCostError = document.getElementById("product-cost-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
const currencySelect = document.getElementById("currency-select");
const productCategory = document.getElementById("product-category");
const exportButton = document.getElementById("export-data");
const importButton = document.getElementById("import-data");
const importFile = document.getElementById("import-file");
const clearButton = document.getElementById("clear-data");
let tempAmount = 0;
let currency = "$";
let expenses = [];

// LocalStorage functions
const saveToStorage = () => {
    try {
        const data = {
            budget: tempAmount,
            currency: currency,
            expenses: expenses,
            totalExpenditure: expenditureValue.innerText.replace(/[^0-9.-]/g, "") || "0"
        };
        localStorage.setItem('budgetTracker', JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save data:', error);
    }
};

const loadFromStorage = () => {
    try {
        const data = localStorage.getItem('budgetTracker');
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed === 'object') {
                tempAmount = parsed.budget || 0;
                currency = parsed.currency || "$";
                expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
                
                // Update UI
                currencySelect.value = currency;
                amount.innerHTML = currency + tempAmount;
                expenditureValue.innerText = currency + (parsed.totalExpenditure || "0");
                balanceValue.innerText = currency + (tempAmount - (parsed.totalExpenditure || 0));
                
                // Recreate expense list
                list.innerHTML = "";
                expenses.forEach(expense => {
                    if (expense.name && expense.value) {
                        listCreator(expense.name, expense.value);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Failed to load data:', error);
        localStorage.removeItem('budgetTracker');
    }
};

const exportData = () => {
    try {
        const data = {
            budget: tempAmount,
            currency: currency,
            expenses: expenses,
            totalExpenditure: expenditureValue.innerText.replace(/[^0-9.-]/g, "") || "0",
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('Failed to export data: ' + error.message);
    }
};

const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data && typeof data === 'object' && data.budget !== undefined) {
                tempAmount = data.budget || 0;
                currency = data.currency || "$";
                expenses = Array.isArray(data.expenses) ? data.expenses : [];
                
                // Update UI
                currencySelect.value = currency;
                amount.innerHTML = currency + tempAmount;
                expenditureValue.innerText = currency + (data.totalExpenditure || "0");
                balanceValue.innerText = currency + (tempAmount - (data.totalExpenditure || 0));
                
                // Recreate expense list
                list.innerHTML = "";
                expenses.forEach(expense => {
                    if (expense.name && expense.value) {
                        listCreator(expense.name, expense.value);
                    }
                });
                
                saveToStorage();
                alert('Data imported successfully!');
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            alert('Failed to import data: Invalid JSON format or corrupted file');
        }
    };
    reader.readAsText(file);
};

const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('budgetTracker');
        tempAmount = 0;
        currency = "$";
        expenses = [];
        
        // Reset UI
        currencySelect.value = "$";
        amount.innerHTML = "0";
        expenditureValue.innerText = "0";
        balanceValue.innerText = "0";
        list.innerHTML = "";
        totalAmount.value = "";
        userAmount.value = "";
        productTitle.value = "";
        productCategory.value = "";
    }
};

// Event listeners for data management
exportButton.addEventListener('click', exportData);
importButton.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        importData(e.target.files[0]);
        e.target.value = '';
    }
});
clearButton.addEventListener('click', clearAllData);

// Load data on page load
window.addEventListener('load', loadFromStorage);

// Show custom input when Other is selected
productCategory.addEventListener("change", () => {
    if (productCategory.value === "Other") {
        productTitle.classList.remove("hide");
    } else {
        productTitle.classList.add("hide");
        productTitle.value = "";
    }
});

// Set Budget Functions

currencySelect.addEventListener("change", () => {
    currency = currencySelect.value;
    saveToStorage();
});

totalAmountButton.addEventListener("click", () => {
    tempAmount = totalAmount.value;
    // Bad input
    if (tempAmount === "" || tempAmount < 0) {
        errorMessage.classList.remove("hide");
    } else {
        errorMessage.classList.add("hide");
        // Set budget
        amount.innerHTML = currency + tempAmount;
        balanceValue.innerText = currency + (tempAmount - expenditureValue.innerText.replace(/[^0-9.-]/g, ""));
        // Clear input
        totalAmount.value = "";
        saveToStorage();
    }
});

// Disable edit and delete button function

const disableButtons = (bool) => {
    let editButtons = document.getElementsByClassName("edit");
    Array.from(editButtons).forEach((element) => {
        element.disabled = bool;
    });
};

// Modify list elements function

const modifyElement = (element, edit = false) => {
    let parentDiv = element.parentElement;
    let currentBalance = balanceValue.innerText.replace(/[^0-9.-]/g, "");
    let currentExpense = expenditureValue.innerText.replace(/[^0-9.-]/g, "");
    let parentAmount = parentDiv.querySelector(".amount").innerText.replace(/[^0-9.-]/g, "");
    let parentText = parentDiv.querySelector(".product").innerText;
    
    if (edit) {
        productTitle.value = parentText;
        userAmount.value = parentAmount;
        disableButtons(true);
    }

    // Remove from expenses array
    expenses = expenses.filter(expense => !(expense.name === parentText && expense.value == parentAmount));
    
    balanceValue.innerText = currency + (parseInt(currentBalance) + parseInt(parentAmount));
    expenditureValue.innerText = currency + (parseInt(currentExpense) - parseInt(parentAmount));
    parentDiv.remove();
    saveToStorage();
};

// Create list function

const listCreator = (expenseName, expenseValue) => {
    let subListContent = document.createElement("div");
    subListContent.classList.add("sublist-content", "flex-space");
    list.appendChild(subListContent);
    subListContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${currency}${expenseValue}</p>`;
    let editButton = document.createElement("button");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
    editButton.style.fontSize = "1.2em";
    editButton.addEventListener("click", () => {
        modifyElement(editButton, true);
    });
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
    deleteButton.style.fontSize = "1.2em";
    deleteButton.addEventListener("click", () => {
        modifyElement(deleteButton);
    });
    subListContent.appendChild(editButton);
    subListContent.appendChild(deleteButton);
    document.getElementById("list").appendChild(subListContent);
};

// Add expenses function

checkAmountButton.addEventListener("click", () => {
    // Get the expense name from category or custom input
    let expenseName = productCategory.value === "Other" ? productTitle.value : productCategory.value;
    
    // Check empty
    if (!userAmount.value || !expenseName) {
        productTitleError.classList.remove("hide");
        return false;
    }
    productTitleError.classList.add("hide");
    // Enable buttons
    disableButtons(false);
    //Expense
    let expenditure = parseInt(userAmount.value);
    // Total expense (existing + new)
    let sum = parseInt(expenditureValue.innerText.replace(/[^0-9.-]/g, "")) + expenditure;
    expenditureValue.innerText = currency + sum;
    // Total balance = budget - total expense
    const totalBalance = tempAmount - sum;
    balanceValue.innerText = currency + totalBalance;
    
    // Add to expenses array
    expenses.push({ name: expenseName, value: parseInt(userAmount.value) });
    
    //Create list
    listCreator(expenseName, userAmount.value);
    //Clear inputs
    productCategory.value = "";
    productTitle.value = "";
    productTitle.classList.add("hide");
    userAmount.value = "";
    
    saveToStorage();
});
