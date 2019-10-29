//------------------------
// Variables
//------------------------
const users = new Map();
const gallery = document.querySelector("#gallery");
const searchContainer = document.querySelectorAll("div.search-container")[0];
//------------------------

//------------------------
// Initialize
//------------------------

let modalContainerDIV = document.createElement("div");
modalContainerDIV.classList.add("modal-container");
document.querySelector("body").appendChild(modalContainerDIV);
hide(modalContainerDIV);

searchContainer.innerHTML = 
        `
            <form action="#" method="get">
                <input type="search" id="search-input" class="search-input" placeholder="Search...">
                <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
            </form>
        `;

const searchInput = document.querySelector("#search-input");
const searchSubmit = document.querySelector("#search-submit");
//------------------------

//------------------------
// Functions
//------------------------

// Simple way to instatly get array results from response
function fetchResults(url) {
    return fetch(url)
            .then (checkStatus)
            .then(response => response.json())
            .then(json => json.results)
            .catch(error => console.log("Something went wrong: ", error));
}

// Checks to see if the fetch response was accepted or rejected
function checkStatus(response) {
    if (response.ok) {
        return Promise.resolve(response);
    }
    
    return Promise.reject(new Error(response.statusText));
}

function hide(element) {
    element.style.display = "none";
}

function show(element) {
    element.style.display = "";
}

// Displays a user on the page via modal
function displayUser(element) {
    const user = users.get(element.id);
    
    const modalHTML = 
        `
            <div class="modal">
                <button type="button" id="modal-close-btn" class="modal-close-btn">X</button>
                <div class="modal-info-container">
                    <img class="modal-img" src="${user.image.large}" alt="profile picture">
                    <h3 id="${user.firstName}${user.lastName}Modal" class="modal-name cap">${user.firstName} ${user.lastName}</h3>
                    <p class="modal-text">${user.email}</p>
                    <p class="modal-text cap">${user.location.city}</p>
                    <hr>
                    <p class="modal-text">${user.cell}</p>
                    <p class="modal-text">${user.location.street.number} 
                    ${user.location.street.name}, ${user.location.city}, ${user.location.state} ${user.location.postcode}</p>
                    <p class="modal-text">Birthday: ${user.birthday.date.substr(0,10)}</p>
                </div>
            </div>

            <div class="modal-btn-container">
                <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
                <button type="button" id="modal-next" class="modal-next btn">Next</button>
            </div>
        `;

    modalContainerDIV.innerHTML = modalHTML;

    show(modalContainerDIV);
}

// Checks which users have something similar with the search and only displays those users
function handleSearch() {
    const search = searchInput.value.toLowerCase();
    for (let [key, value] of users) {
        let name = `${value.firstName.toLowerCase()} ${value.lastName.toLowerCase()}`;
        const userElement = document.querySelector(`#${value.firstName}${value.lastName}Card`);

        if (search.trim() === "") {
            show(userElement);
        }

        if (name.includes(search)) {
            show(userElement);
        } else {
            hide(userElement);
        }
    }
}
//------------------------

//------------------------
// Fetch
//------------------------

// Get 12 random users from the API with a single request
fetchResults("https://randomuser.me/api/?nat=us&results=12&inc=picture,name,email,location,cell,dob&noinfo")
    .then(results => results.forEach(result => {
        // Define basic user info from results
        const imageSrc = result.picture.thumbnail;
        const firstName = result.name.first;
        const lastName = result.name.last;
        const email = result.email;
        const city = result.location.city;
        const state = result.location.state;

        // Add user to existing gallery html
        gallery.innerHTML += 
            `
            <div id="${firstName}${lastName}Card" class="card">
                <div class="card-img-container">
                    <img class="card-img" src="${imageSrc}" alt="profile picture">
                </div>
                <div class="card-info-container">
                    <h3 id="${firstName}${lastName}" class="card-name cap">${firstName} ${lastName}</h3>
                    <p class="card-text">${email}</p>
                    <p class="card-text cap">${city}, ${state}</p>
                </div>
            </div>
            `
        ;

        users.set(`${firstName}${lastName}Card`, new User(
            result.picture,
            firstName,
            lastName,
            email,
            result.location,
            result.cell,
            result.dob
        ));
    }));
//------------------------

// Check if any cards are clicked
gallery.addEventListener("click", (event) => {
    event.preventDefault();

    function parent(target) {
        return target.parentNode;
    }

    const target = event.target;

    if (target.className.includes("card")) {
        if (target.nodeName == "H3") {
            displayUser(gallery.querySelector(`#${target.id}Card`));
        } else if (target.nodeName == "DIV" && target.id == "") {
            displayUser(parent(target));
        } else if (target.id == "") {
            displayUser(parent(parent(target)));
        } else {
            displayUser(target);
        }
    }
});

// Event listener for modal when open
modalContainerDIV.addEventListener("click", (event) => {
    event.preventDefault();

    const currentUser = users.get(document.querySelector("div.modal-info-container h3").textContent.replace(" ", "") + "Card");

    let nextBoolean = false;
    let i = 1;
    function getNextUser() {
        for (let [key, value] of users) {
            if (nextBoolean) {
                return value;
            }

            if (currentUser == value) {
                nextBoolean = true;
            }
        }

        i++;
    }

    let prevUser = null;
    function getPrevUser() {
        for (let [key, value] of users) {
            if (currentUser == value) {
                if (prevUser == null) {
                    return value;
                }

                return prevUser;
            }

            prevUser = value;
        }
    }

    const id = event.target.id;

    switch(id) {
        case "modal-close-btn": {
            hide(modalContainerDIV);
            break;
        }

        case "modal-next": {
            const nextUser = getNextUser();

            if (nextUser == null) {
                return;
            }

            const nextID = `#${nextUser.firstName}${nextUser.lastName}Card`;
            const nextElement = document.querySelector(nextID);

            displayUser(nextElement);
            break;
        }

        case "modal-prev": {
            const prevUser = getPrevUser();
            const prevID = `#${prevUser.firstName}${prevUser.lastName}Card`;
            const prevElement = document.querySelector(prevID);

            displayUser(prevElement);
            break;
        }

        default: {
            break;
        }
    }
});

// Simple search listener
searchSubmit.addEventListener('click', () => {
    handleSearch();
});