const moduleList = document.getElementById('module-list');
const testcaseList = document.getElementById('testcase-list');
const addModuleBtn = document.getElementById('addModuleBtn');
const addTestCaseBtn = document.getElementById('addTestCaseBtn');
const moduleModal = document.getElementById('moduleModal');
const testCaseModal = document.getElementById('testCaseModal');
const closeBtn = document.getElementsByClassName("close");
const moduleNameInput = document.getElementById('moduleNameInput');
const saveModuleBtn = document.getElementById('saveModuleBtn');
const testCaseIdInput = document.getElementById('testCaseIdInput');
const testCaseDescriptionInput = document.getElementById('testCaseDescriptionInput');
const testCaseStatusInput = document.getElementById('testCaseStatusInput');
const saveTestCaseBtn = document.getElementById('saveTestCaseBtn');

let selectedModuleName = '';
let isUpdatingTestCase = false;
let currentTestCaseId = '';

async function fetchModules() {
    try {
        const response = await fetch('http://127.0.0.1:21001/modules');
        const modules = await response.json();

        moduleList.innerHTML = ''; 

        modules.forEach(module => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

            const icon = document.createElement('i');
            icon.className = 'fas fa-folder';
            icon.style.marginRight = '10px';
            const moduleNameText = document.createTextNode(`${module.name} (${module.testcase_count})`);

            listItem.appendChild(icon);
            listItem.appendChild(moduleNameText);

            listItem.addEventListener('click', () => {
                selectedModuleName = module.name;
                fetchTestCases(module.name);
                addTestCaseBtn.style.display = "inline";
            });

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'ml-auto';

            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Update';
            updateBtn.className = 'btn btn-warning btn-sm';
            updateBtn.addEventListener('click', () => {
                moduleNameInput.value = module.name; 
                modalTitle.textContent = "Update Module"; 
                saveModuleBtn.textContent = "Update"; 
                moduleModal.style.display = "block"; 
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.addEventListener('click', () => {
                deleteModule(module.name);
            });

            buttonGroup.appendChild(updateBtn);
            buttonGroup.appendChild(deleteBtn);
            listItem.appendChild(buttonGroup);
            moduleList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching modules:', error);
    }
}

async function fetchTestCases(moduleName) {
    try {
        const response = await fetch(`http://127.0.0.1:21001/modules/${moduleName}`);
        const testcases = await response.json();

        testcaseList.innerHTML = '';

        testcases.forEach(testcase => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

            // Highlight the testcase_id
            const testcaseIdSpan = document.createElement('span');
            testcaseIdSpan.className = 'testcase-id';
            testcaseIdSpan.textContent = testcase.testcase_id;

            const descriptionText = document.createTextNode(` - ${testcase.description} - ${testcase.status}`);

            listItem.appendChild(testcaseIdSpan);
            listItem.appendChild(descriptionText);

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'ml-auto'; 

            const updateBtn = document.createElement('button');
            updateBtn.textContent = 'Update';
            updateBtn.className = 'btn btn-warning btn-sm';
            updateBtn.addEventListener('click', () => {
                testCaseIdInput.value = testcase.testcase_id; 
                testCaseDescriptionInput.value = testcase.description; 
                testCaseStatusInput.value = testcase.status; 
                isUpdatingTestCase = true; 
                currentTestCaseId = testcase.testcase_id; 
                testCaseModalTitle.textContent = "Update Test Case"; 
                saveTestCaseBtn.textContent = "Update Test Case"; 
                testCaseModal.style.display = "block"; 
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.addEventListener('click', () => {
                deleteTestCase(moduleName, testcase.testcase_id);
            });

            buttonGroup.appendChild(updateBtn);
            buttonGroup.appendChild(deleteBtn);
            listItem.appendChild(buttonGroup);
            testcaseList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching test cases:', error);
    }
}

addModuleBtn.addEventListener('click', () => {
  moduleNameInput.value = ''; 
  modalTitle.textContent = "Add Module"; 
  saveModuleBtn.textContent = "Save"; 
  moduleModal.style.display = "block"; 
});

saveModuleBtn.addEventListener('click', async () => {
  const moduleName = moduleNameInput.value; 
  if (moduleName) {
    if (saveModuleBtn.textContent === "Save") {
      await addModule(moduleName);
    } else {
      await updateModule(moduleName);
    }
    moduleModal.style.display = "none"; 
    fetchModules(); 
  }
});

async function addModule(name) {
  try {
    await fetch('http://127.0.0.1:21001/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    console.error('Error adding module:', error);
  }
}

async function updateModule(name) {
  try {
    await fetch(`http://127.0.0.1:21001/modules/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  } catch (error) {
    console.error('Error updating module:', error);
  }
}

async function deleteModule(name) {
    console.log(`NAME >>>>>>>>> ${name}`)
    const confirmation = confirm(`Are you sure you want to delete the module "${name}"?`);
    if (confirmation) {
        try {
            await fetch(`http://127.0.0.1:21001/modules/${name}`, { method: 'DELETE' });
            fetchModules();
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    }
}

addTestCaseBtn.addEventListener('click', () => {
  testCaseIdInput.value = ''; 
  testCaseDescriptionInput.value = ''; 
  testCaseStatusInput.value = 'Pending'; 
  isUpdatingTestCase = false; 
  testCaseModalTitle.textContent = "Add Test Case"; 
  saveTestCaseBtn.textContent = "Save Test Case"; 
  testCaseModal.style.display = "block"; 
});

saveTestCaseBtn.addEventListener('click', async () => {
  const testCaseId = testCaseIdInput.value; 
  const description = testCaseDescriptionInput.value; 
  const status = testCaseStatusInput.value; 
  if (testCaseId && description) {
    if (isUpdatingTestCase) {
      await updateTestCase(selectedModuleName, currentTestCaseId, { description, status });
    } else {
      await addTestCase(selectedModuleName, { id: testCaseId, description, status });
    }
    testCaseModal.style.display = "none";
    fetchModules(); 
    fetchTestCases(selectedModuleName); 
  }
});

async function addTestCase(moduleName, testCase) {
  try {
    await fetch(`http://127.0.0.1:21001/modules/${moduleName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase),
    });
  } catch (error) {
    console.error('Error adding test case:', error);
  }
}

async function updateTestCase(moduleName, testCaseId, updatedData) {
  try {
    await fetch(`http://127.0.0.1:21001/modules/${moduleName}/${testCaseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
  } catch (error) {
    console.error('Error updating test case:', error);
  }
}

async function deleteTestCase(moduleName, testCaseId) {
    const confirmation = confirm(`Are you sure you want to delete the test case "${testCaseId}"?`);
    if (confirmation) {
        try {
            await fetch(`http://127.0.0.1:21001/modules/${moduleName}/${testCaseId}`, { method: 'DELETE' });
            fetchTestCases(moduleName);
            fetchModules()
        } catch (error) {
            console.error('Error deleting test case:', error);
        }
    }
}

// Initialize the module list on page load
fetchModules();

// Close modals when the close button is clicked
Array.from(closeBtn).forEach(button => {
  button.addEventListener('click', () => {
    moduleModal.style.display = "none"; 
    testCaseModal.style.display = "none"; 
  });
});

// Close modals when clicking outside of them
window.addEventListener('click', (event) => {
  if (event.target === moduleModal || event.target === testCaseModal) {
    moduleModal.style.display = "none"; 
    testCaseModal.style.display = "none"; 
  }
});