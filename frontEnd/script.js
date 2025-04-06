//general structure: a user is either loged in or he is not, if he is loged in, i grab his user id from db, else i create a prompt user 
let thisUserId = null;
let logedIn = false;



// DOM variables related to Decision Modal
const decisionModal = document.getElementById('decision-modal');
const signupModal = document.getElementById('signup-modal');
const loginModal = document.getElementById('login-modal');



const decisionSignupBtn = document.getElementById('decision-signup');
const decisionLoginBtn = document.getElementById('decision-login');

const directLoginBtn = document.getElementById('direct-login');


//DOM variables related to closing modals
const decisionClose = document.getElementById('decision-close');
const loginClose = document.getElementById('login-close');
const signupClose = document.getElementById('signup-close');
const myAccountClose = document.getElementById('my_account_close');



//DOM variables related to income
const monthlyIncomeInput = document.getElementById("monthly-income");
const monthlyIncomeDisplay = document.getElementById('display-monthly-income');
const monthlyIncomeUpdateButton = document.getElementById('update-income');

let totalExpensesDisplay = document.getElementById('total-expenses');


//DOM variables related to envelope

const saveEnvelopesBtn = document.getElementById('save-envelopes');

const envelopeNameInput = document.getElementById('envelope-name');
const envelopeBudgetInput = document.getElementById('envelope-budget');

const envelopeUl = document.getElementById('env_ul');
const createEnvelopeButton = document.getElementById('create_envelope');


//DOM variables related to Signup 
const signUpButton = document.getElementById('sign_up_button');


const signup_first_name_input = document.getElementById('signup-first-name');
const signup_last_name_input = document.getElementById('signup-last-name');
const signup_email_input = document.getElementById('signup-email');
const signup_password_input = document.getElementById('signup-password');

const valid_email = document.getElementById('valid_email');
const valid_pass = document.getElementById('valid_password');

//DOM variables related to Login


const loginButton = document.getElementById('login_button');

const login_email_input = document.getElementById('login-email');
const login_pass_input = document.getElementById('login-password');




//DOM variables related to My Account
const myAccountModal = document.getElementById('my_account_modal');
const myAccountButton = document.getElementById('my_account_button');


const myAccountFirst = document.getElementById('info_first_name');
const myAccountLast = document.getElementById('info_last_name');
const myAccountEmail = document.getElementById('info_email');
const myAccountPass = document.getElementById('info_pass');

const editFirstInput = document.getElementById('first_name_edit');
const editLastInput = document.getElementById('last_name_edit');
const editEmailInput = document.getElementById('email_edit');
const editPassInput = document.getElementById('password_edit');


const editMyAccountButton = document.getElementById('my_account_edit');
const saveMyAccountButton = document.getElementById('my_account_save_edit');
const cancelMyAccountButton = document.getElementById('my_account_cancel_edit');

//DOM variables related to logout
const logoutButton = document.getElementById('log_out_button');




//User Related Functions//


//this will log the user in if he previously loged in, meaning that the local storage variable hasAccount resolves to true;

//this funciton will login the user and generate all his data (get user)
async function login(email, pass) {
    try {
        //login logic: --> get the email and pass, make a request to server, validate pass in server, if ok send back userId, and update all data, monthly income, envelopes, total expenses...
        console.log('login request');
        const response = await fetch('http://localhost:3000/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                pass: pass
            })
        });
        console.log('request succesful');
        const data = await response.json();
        console.log('data parsed');
        console.log(data);
        if (response.status == 200) {
            thisUserId = data.user_id;
            //if the user is loged in display all the relevant data
            await displaySignUp();
            await displayMonthlyIncome();
            await displayTotalExpense();
            const envelopes = await getAllUserEnvelope();
            for (let i = 0; i < envelopes.length; i++) {
                displayEnvelope(envelopes[i]);
            }

        }
        else if (response.status == 400) {
            errorHandler(data.message);
        }
        else if (response.status == 500) {
            errMessage = await response.text();
            errorHandler(errMessage);
        }
    } catch (error) {
        errorHandler(error);
    }

}



//this function will sign the user up, since every person using the service will be using a test user, 
// this will take the current test user of the session and will update his info (put)

async function signup() {
    //sign up logic: sign up button on click, extract name email and pass, verify email input using reg ex --> send put request --> 
    // update user info in db and make him active, return user id  --> logedIn = true --> welcome message
    if (logedIn) {
        try {
            const first_name = signup_first_name_input.value;
            const last_name = signup_last_name_input.value;

            const email = signup_email_input.value;
            if (!isValidEmail(email)) throw new Error('Invalid email address!Please enter a valid one');

            const password = signup_password_input.value;

            if (!isValidPass(password)) throw new Error('Invalid password, please only use numbers in your password (so you don\'t forget it!');
            if (first_name === null || last_name === null || email === null || password === null) throw new Error('Please fill out all fields');

            const response = await fetch('http://localhost:3000/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first: first_name,
                    last: last_name,
                    email: email,
                    pass: password,
                    id: thisUserId
                })
            });
            if (response.status == 200) {
                const data = await response.json();
                thisUserId = data.user_id;
                await displaySignUp();
            }
            else if (response.status == 500) {
                const errorMessage = await response.text();
                console.log(errorMessage);
                if (errorMessage === 'duplicate key value violates unique constraint "users_user_email_unique_non_default"') throw new Error('Email is already taken')
            }
        } catch (error) {
            errorHandler(error);
        }

    }
    else {
        await createUser();
        await signup();
        return;
    }
}

async function displaySignUp() {
    //getting all the info for my account settings
    let data;
    try {
        const response = await fetch(`http://localhost:3000/user/${thisUserId}`);
        data = await response.json();

    } catch (error) {
        errorHandler(error)
    }


    //set local variables in local storage for automatic login

    //setting local storage variables to automatically log user in again
    localStorage.setItem('hasAccount', 'true');

    localStorage.setItem('email', data.user_email);

    localStorage.setItem('password', data.user_password);


    localStorage.setItem('userId', thisUserId);

    //changing the title
    document.getElementById('big_title').textContent = `${data.user_first_name}'s Envelope Budgeting System`;


    //reset the sign up input values
    signup_first_name_input.value = '';
    signup_last_name_input.value = '';
    signup_email_input.value = '';
    signup_password_input.value = '';


    //closing the pop up and returning the the main menu
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
    decisionModal.style.display = 'none';
    valid_email.textContent = '';
    valid_pass.textContent = '';



    //hiding sign up and login and dislpaying my account (account settings) and logout 
    saveEnvelopesBtn.style.display = 'none';
    directLoginBtn.style.display = 'none';
    myAccountButton.style.display = 'block';
    logoutButton.style.display = 'block';



    myAccountFirst.textContent = data.user_first_name;
    myAccountLast.textContent = data.user_last_name;
    myAccountEmail.textContent = data.user_email;
    myAccountPass.textContent = data.user_password;

    editMyAccountButton.addEventListener('click', async () => {
        await editUserData();
    });


}

async function editUserData() {

    //replace text with edit input
    //first give the input the same text content as the text 

    editFirstInput.value = myAccountFirst.textContent;
    editLastInput.value = myAccountLast.textContent;
    editEmailInput.value = myAccountEmail.textContent;
    editPassInput.value = myAccountPass.textContent;

    //second make them appear
    editFirstInput.style.display = 'block';
    editLastInput.style.display = 'block';
    editEmailInput.style.display = 'block';
    editPassInput.style.display = 'block';

    //third make the text disapear
    myAccountFirst.style.display = 'none';
    myAccountLast.style.display = 'none';
    myAccountEmail.style.display = 'none';
    myAccountPass.style.display = 'none';

    //make the edit button disapear and the save and cancel button appear
    editMyAccountButton.style.display = 'none';
    saveMyAccountButton.style.display = 'block';
    cancelMyAccountButton.style.display = 'block';

    //next define the functionality for the save and cancel

    saveMyAccountButton.addEventListener('click', async () => {
        const first = editFirstInput.value;
        const last = editLastInput.value;
        const email = editEmailInput.value;
        const pass = editPassInput.value;

        let response;
        try {
            response = await fetch('http://localhost:3000/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first: first,
                    last: last,
                    email: email,
                    pass: pass,
                    id: thisUserId
                })
            });

        } catch (error) {
            errorHandler(error);

        }

        if (response.status == 200) {
            const data = await response.json();

            //remove input and put back text with new value
            editFirstInput.style.display = 'none';
            editLastInput.style.display = 'none';
            editEmailInput.style.display = 'none';
            editPassInput.style.display = 'none';


            myAccountFirst.style.display = 'block';
            myAccountLast.style.display = 'block';
            myAccountEmail.style.display = 'block';
            myAccountPass.style.display = 'block';

            myAccountFirst.textContent = data.user_first_name;
            myAccountLast.textContent = data.user_last_name;
            myAccountEmail.textContent = data.user_email;
            myAccountPass.textContent = data.user_password;

            //make the cancel and save  button disapear and the edit button appear
            editMyAccountButton.style.display = 'block';
            saveMyAccountButton.style.display = 'none';
            cancelMyAccountButton.style.display = 'none';

        }
        else if (response.status == 500) {
            const errorMessage = await response.text();
            console.log(errorMessage);
            if (errorMessage === 'duplicate key value violates unique constraint "users_user_email_unique_non_default"') throw new Error('Email is already taken')
        }


    });

    cancelMyAccountButton.addEventListener('click', async () => {
        //remove input and put back text with new value
        editFirstInput.style.display = 'none';
        editLastInput.style.display = 'none';
        editEmailInput.style.display = 'none';
        editPassInput.style.display = 'none';


        myAccountFirst.style.display = 'block';
        myAccountLast.style.display = 'block';
        myAccountEmail.style.display = 'block';
        myAccountPass.style.display = 'block';


        //put back the edit button and remove cancel and save
        editMyAccountButton.style.display = 'block';
        saveMyAccountButton.style.display = 'none';
        cancelMyAccountButton.style.display = 'none';


    })

}




//if a user is not loged in, he will need a user id to use the service, this function will create a prompt user to generate a user id 
async function createUser() {
    try {
        const response = await fetch('http://localhost:3000/user');
        const data = await response.json();
        thisUserId = data.user_id;
        logedIn = true;
        return thisUserId;
    } catch (error) {
        errorHandler(error);

    }
}



//Envelope Related Functions//


//update monthly income, user id needed
async function updateMonthlyIncome() {
    if (logedIn) {
        try {
            const newMonthlyIncome = monthlyIncomeInput.value;
            const response = await fetch('http://localhost:3000/user/income', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        user_id: thisUserId,
                        income: newMonthlyIncome

                    }
                )
            });
            const data = await response.json();
            if (response.status == 200) {
                await displayMonthlyIncome();
            }

        } catch (error) {
            errorHandler(error);
        }

    } else {
        await createUser();
        await updateMonthlyIncome();
    }

}

//create envelope, user id needed, this function will also call listEnvelope
async function createEnvelope() {
    if (logedIn) {
        try {
            const envName = envelopeNameInput.value;
            const envBudget = envelopeBudgetInput.value;
            const response = await fetch('http://localhost:3000/envelope', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        user_id: thisUserId,
                        name: envName,
                        budget: envBudget
                    }
                )
            });

            if (response.status == 200) {
                const envelope = await response.json();
                displayEnvelope(envelope);
            }
            else if (response.status == 500) {
                let errorMessage = await response.text();
                if (errorMessage === 'new row for relation "users" violates check constraint "total_expenses_within_income"') {
                    throw new Error('Not enough monthly income to create envelope! Please update your monthly income')
                }
            }
        } catch (error) {
            errorHandler(error)
        }
    } else {
        await createUser();
        await createEnvelope()
    }
}

async function editEnvelope(envelope_id) {
    const env_li = document.getElementById(envelope_id);


    //creating the name input to edit and all the specifics 
    const newName_div = document.createElement('div');
    const newName_input = document.createElement('input');
    newName_input.name = 'new_name_input';
    const newName_label = document.createElement('label');
    newName_label.textContent = 'Name';
    newName_label.for = 'new_name_input';
    newName_label.class = 'input_label';
    newName_div.append(newName_label, newName_input);


    //creating the budget input to edit and all the specifics 
    const newBudget_div = document.createElement('div');
    const newBudget_input = document.createElement('input');
    newBudget_input.name = 'new_budget_input';
    const newBudget_label = document.createElement('label');
    newBudget_label.textContent = 'Budget';
    newBudget_label.for = 'new_budget_input';
    newBudget_label.class = 'input_label';
    newBudget_div.append(newBudget_label, newBudget_input);

    //getting the envelope info and displaying it
    let data;
    try {
        const response = await fetch(`http://localhost:3000/envelope/${envelope_id}`);
        data = await response.json();
    } catch (error) {
        errorHandler(error);
    }
    //setting the default value of the inpupts to be changed 
    newName_input.value = data.name;
    newBudget_input.value = data.budget;
    //removing the span 
    env_li.removeChild(env_li.querySelector('span'));
    //adding the input fields
    env_li.prepend(newBudget_div);
    env_li.prepend(newName_div);




    //removing edit and delete button and replacing them with save and cancel
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';

    const buttonGroup = env_li.querySelector('.button-group');
    //removing edit and delete 
    buttonGroup.removeChild(buttonGroup.querySelector('.edit-btn'));
    buttonGroup.removeChild(buttonGroup.querySelector('.delete-btn'));
    //adding cancel and save
    buttonGroup.append(saveButton, cancelButton);



    //save button behavior
    saveButton.addEventListener('click', async () => {
        try {
            //save env data to db and display them
            const name = newName_input.value;
            const budget = newBudget_input.value;

            //making the put request
            const response = await fetch(`http://localhost:3000/envelope/${envelope_id}/?name=${name}&budget=${budget}`, {
                method: 'PUT'
            });

            if (response.status == 200) {
                const data = await response.json();


                env_li.removeChild(newName_div);
                env_li.removeChild(newBudget_div);
                // Create a span for the envelope details and appending it to already existing env_li
                const envelopeText = document.createElement('span');
                envelopeText.textContent = `${data.name}: $${data.budget}`;
                env_li.prepend(envelopeText);

                //removing the cancel and save and adding edit and delete 
                buttonGroup.removeChild(saveButton);
                buttonGroup.removeChild(cancelButton);



                // Create the edit button
                const editEnvelopeButton = document.createElement('button');
                editEnvelopeButton.classList.add('edit-btn');
                editEnvelopeButton.textContent = 'Edit';

                editEnvelopeButton.addEventListener('click', async event => {

                    const button = event.target;
                    const env_li = button.closest('.envelope-item');
                    const envelope_id = env_li.id;
                    await editEnvelope(envelope_id);
                });


                // Create the delete button
                const deleteEnvelopeButton = document.createElement('button');
                deleteEnvelopeButton.classList.add('delete-btn');
                deleteEnvelopeButton.textContent = 'Delete';

                deleteEnvelopeButton.addEventListener('click', async event => {
                    const button = event.target;
                    const env_li = button.closest('.envelope-item');
                    const envelope_id = env_li.id;
                    await deleteEnvelope(envelope_id);
                });


                // Append buttons to the button group
                buttonGroup.appendChild(editEnvelopeButton);
                buttonGroup.appendChild(deleteEnvelopeButton);

                //update total expenses
                await displayTotalExpense();
            }
            else if (response.status == 500) {
                const errorMessage = await response.text();
                if (errorMessage === 'new row for relation "users" violates check constraint "total_expenses_within_income"') {
                    throw new Error('Not enough monthly income to edit envelope! Please update your monthly income');
                }

            }
        } catch (error) {
            errorHandler(error)
        }
    });


    //cancel button beheavior 
    cancelButton.addEventListener('click', () => {
        //create span, remove buttons add edit and delete

        // Create a span for the envelope details and appending it to already existing env_li
        //data is the original request
        env_li.removeChild(newName_div);
        env_li.removeChild(newBudget_div);
        const envelopeText = document.createElement('span');
        envelopeText.textContent = `${data.name}: $${data.budget}`;
        env_li.prepend(envelopeText);

        //removing the cancel and save and adding edit and delete 
        buttonGroup.removeChild(saveButton);
        buttonGroup.removeChild(cancelButton);



        // Create the edit button
        const editEnvelopeButton = document.createElement('button');
        editEnvelopeButton.classList.add('edit-btn');
        editEnvelopeButton.textContent = 'Edit';

        editEnvelopeButton.addEventListener('click', async event => {

            const button = event.target;
            const env_li = button.closest('.envelope-item');
            const envelope_id = env_li.id;
            await editEnvelope(envelope_id);
        });


        // Create the delete button
        const deleteEnvelopeButton = document.createElement('button');
        deleteEnvelopeButton.classList.add('delete-btn');
        deleteEnvelopeButton.textContent = 'Delete';

        deleteEnvelopeButton.addEventListener('click', async event => {
            const button = event.target;
            const env_li = button.closest('.envelope-item');
            const envelope_id = env_li.id;
            await deleteEnvelope(envelope_id);
        });


        // Append buttons to the button group
        buttonGroup.appendChild(editEnvelopeButton);
        buttonGroup.appendChild(deleteEnvelopeButton);

    })







}

async function deleteEnvelope(envelope_id) {
    try {
        const response = await fetch(`http://localhost:3000/envelope/${envelope_id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const env_li = document.getElementById(envelope_id);
            env_li.remove();
            await displayTotalExpense();
        }


    } catch (error) {
        errorHandler(error);
    }
}


//DOM Updating Functions//

//get all envelopes by user id

async function getAllUserEnvelope() {
    try {
        const response = await fetch(`http://localhost:3000/envelope/user/${thisUserId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        errorHandler(error)
    }

}

//list envelope in the DOM
async function displayEnvelope(envelope) {
    const name = envelope.name;
    const budget = envelope.budget;
    const id = envelope.envelope_id;

    // Create a new list item and add a class for styling
    env_li = document.createElement('li');
    env_li.classList.add('envelope-item');
    env_li.id = id;

    // Create a span for the envelope details
    const envelopeText = document.createElement('span');
    envelopeText.textContent = `${name}: $${budget}`;

    // Create a container for the buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    // Create the edit button
    const editEnvelopeButton = document.createElement('button');
    editEnvelopeButton.classList.add('edit-btn');
    editEnvelopeButton.textContent = 'Edit';

    editEnvelopeButton.addEventListener('click', async event => {

        const button = event.target;
        const env_li = button.closest('.envelope-item');
        const envelope_id = env_li.id;
        await editEnvelope(envelope_id);
    });


    // Create the delete button
    const deleteEnvelopeButton = document.createElement('button');
    deleteEnvelopeButton.classList.add('delete-btn');
    deleteEnvelopeButton.textContent = 'Delete';

    deleteEnvelopeButton.addEventListener('click', async event => {
        const button = event.target;
        const env_li = button.closest('.envelope-item');
        const envelope_id = env_li.id;
        await deleteEnvelope(envelope_id);
    });


    // Append buttons to the button group
    buttonGroup.appendChild(editEnvelopeButton);
    buttonGroup.appendChild(deleteEnvelopeButton);

    // Append the envelope text and the button group to the list item
    env_li.appendChild(envelopeText);
    env_li.appendChild(buttonGroup);

    // Append the new list item to the envelope list
    envelopeUl.appendChild(env_li);
    await displayTotalExpense();
}




//list monthly income in the DOM
async function displayMonthlyIncome() {
    const response = await fetch(`http://localhost:3000/user/${thisUserId}/income`);
    const data = await response.json();
    const income = data.income;
    monthlyIncomeDisplay.textContent = ` $${income}`;
}

async function displayTotalExpense() {
    const response = await fetch(`http://localhost:3000/user/${thisUserId}/expenses`);
    const data = await response.json();
    const expenses = data.total_expenses;
    totalExpensesDisplay.textContent = ` $${expenses}`;

}

//Email and Password Validation 
function isValidEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function validateEmail() {
    const email = document.getElementById('signup-email').value;
    valid_email.textContent = '';

    if (isValidEmail(email)) {
        valid_email.textContent = '' + email + ' is valid.';
        valid_email.style.color = 'green';
    } else {
        valid_email.textContent = '' + email + ' is invalid.';
        valid_email.style.color = 'red';
    }
    return;
}

function isValidPass(pass) {
    return typeof Number(pass) === 'number' && !isNaN(Number(pass));
}
function validatePassword() {
    const pass = document.getElementById('signup-password').value;
    valid_pass.textContent = '';

    if (isValidPass(pass)) {
        valid_pass.textContent = '' + pass + ' is valid.';
        valid_pass.style.color = 'green';
    } else {
        valid_pass.textContent = '' + pass + ' is invalid.';
        valid_pass.style.color = 'red';
    }
    return;
};



//error handler 
function errorHandler(error) {
    console.log(error.message);
    window.alert(error.message);
}


//DOM EVENT HANDLING RELATED TO FUNCTIONALITY

monthlyIncomeUpdateButton.addEventListener('click', async () => {
    await updateMonthlyIncome();
});


createEnvelopeButton.addEventListener('click', async () => {
    await createEnvelope();
});


signup_email_input.addEventListener('input', validateEmail);
signup_password_input.addEventListener('input', validatePassword);


signUpButton.addEventListener('click', async () => {
    await signup();
});

loginButton.addEventListener('click', async () => {
    const email = login_email_input.value;
    const pass = login_pass_input.value;
    login(email, pass);
});

logoutButton.addEventListener('click', () => {
    localStorage.setItem('hasAccount', 'false');
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('userId');

    location.reload();
})

//autmatic login 

window.addEventListener('load', async () => {

    if (localStorage.getItem('hasAccount') === 'true' && localStorage.getItem('email') !== null && localStorage.getItem('password') !== null) {
        console.log('automatic login');
        login(localStorage.getItem('email'), localStorage.getItem('password'));
    }
})




// Event listeners for buttons all related to styling 
saveEnvelopesBtn.addEventListener('click', () => {
    decisionModal.style.display = 'block';
});

directLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

decisionSignupBtn.addEventListener('click', () => {
    decisionModal.style.display = 'none';
    signupModal.style.display = 'block';
});

decisionLoginBtn.addEventListener('click', () => {
    decisionModal.style.display = 'none';
    loginModal.style.display = 'block';
});

decisionClose.addEventListener('click', () => {
    decisionModal.style.display = 'none';
});

loginClose.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

signupClose.addEventListener('click', () => {
    signupModal.style.display = 'none';
})
myAccountClose.addEventListener('click', () => {
    myAccountModal.style.display = 'none';
});

myAccountButton.addEventListener('click', () => {
    myAccountModal.style.display = 'block';
})

// Close modals if user clicks outside modal-content
window.addEventListener('click', (event) => {
    if (event.target === decisionModal) {
        decisionModal.style.display = 'none';
    }
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === signupModal) {
        signupModal.style.display = 'none';
    }
    if (event.target === myAccountModal) {
        myAccountModal.style.display = 'none';
    }
});




