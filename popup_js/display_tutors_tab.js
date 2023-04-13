import { fetchListOnlineTutor, getListTutorObjecFromListUrlLink, isUserNotLogin, getRealListFavouriteTutorIds, fetchTutorDataFromTutorId } from '../data/api_request_helper.js';
import { onLoadFavouriteListTutorObjects, saveTutorToFavourite, deleteTutor } from '../data/local_datasource_helper.js';

let tutorListEl = document.querySelector("#tutorList");
let listOnlineTutors = null
const progressBarTutornEl = document.querySelector(".loading-container-tutor")

export async function mainDisplayTutors() {
    if (await isUserNotLogin()) {
        showMessage("This feature can only use after login")
        progressBarTutornEl.style.opacity = 0
        return
    }
    onImportButtonClick()
    onLoadFavouriteListTutorObjects(async function (listTutorObjects) {
        listOnlineTutors = await fetchListOnlineTutor()
        //TODO
        listTutorObjects.forEach(tutorObject=>{
            const foundOnlineTutor = listOnlineTutors.result.find((t) => t.tutorId === tutorObject.tutorId);
            tutorObject['isOnline'] = Boolean(foundOnlineTutor != undefined && foundOnlineTutor != null)
        })
        listTutorObjects = listTutorObjects.sort((a, b) => b.isOnline - a.isOnline)
        progressBarTutornEl.style.opacity = 0
        if (listTutorObjects.length == 0) {
            showMessage("Empty list here, please add new favrourite tutors on Cambly website and import them")
        } else {
            displayTutorList(listTutorObjects);
        }
    })
}

function clearDisplayTutorList(){
    tutorListEl.innerHTML = "";
}

function displayTutorList(listTutorObjects) {
    for (let i = 0; i < listTutorObjects.length; i++) {
        if (listTutorObjects[i] == undefined || listTutorObjects[i] == null) continue
        const avatarEl = document.createElement("img");
        avatarEl.classList.add("avatar");
        avatarEl.setAttribute("src", listTutorObjects[i].src);
        avatarEl.addEventListener(
            "click",
            (function () {
                sendFavouriteAccountMessage(listTutorObjects[i].url)
            }))
        const nameEl = document.createElement("h3");
        nameEl.innerText = listTutorObjects[i].name;
        //avatar button
        const avatarGroupEl = document.createElement("div");
        avatarGroupEl.classList.add("avatar-group")
        avatarGroupEl.appendChild(avatarEl);
        avatarGroupEl.appendChild(nameEl);
        //login button
        const loginBtn = document.createElement("button");
        loginBtn.classList.add("login-btn");
        loginBtn.innerHTML = "Login";
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "Delete";
        deleteBtn.classList.add("delete-btn");
        loginBtn.addEventListener(
            "click",
            function () {
                sendFavouriteAccountMessage(listTutorObjects[i].url)
            }
        )
        deleteBtn.addEventListener(
            "click",
            (function (index) {
                return function () {
                    deleteTutor(listTutorObjects[i])
                    listTutorObjects.splice(index, 1)
                    tutorListEl.removeChild(tutorListEl.childNodes[index]);
                    clearDisplayTutorList()
                    displayTutorList(listTutorObjects)
                    if (listTutorObjects.length == 0) {
                        showMessage("Empy list here, please add new by staring in the tutor profiles")
                    }
                };
            })(i)
        );
        const btnGroupEl = document.createElement("div");
        btnGroupEl.appendChild(loginBtn);
        btnGroupEl.appendChild(deleteBtn);
        const li = document.createElement("li");
        li.classList.add("tutor-item");
        li.appendChild(avatarGroupEl)
        li.appendChild(btnGroupEl);
        if (listTutorObjects[i].isOnline) {
            li.style.backgroundColor = "lightgreen";
        }
        tutorListEl.appendChild(li);
    }
}

function sendFavouriteAccountMessage(tUrl) {
    chrome.runtime.sendMessage({ message: "navigate_to_favourite_tutor", tutorUrl: tUrl }, function (response) { });
}

function showMessage(message) {
    var emptyTag = document.createElement("h1");
    emptyTag.innerText = message;
    tutorListEl.appendChild(emptyTag);
}

function onImportButtonClick() {
    let importButton = document.querySelector(".import-btn")
    importButton.addEventListener(
        "click",
        async function () {
            let realListFavouriteTutorIds = await getRealListFavouriteTutorIds();
            progressBarTutornEl.style.opacity = 1
            await Promise.all(realListFavouriteTutorIds.map(async realFavouriteTutorId => {
                let tutorData = await fetchTutorDataFromTutorId(realFavouriteTutorId);
                saveTutorToFavourite(tutorData);
            }));
            alert(`Import all tutors succesfully`);
            location.reload()
        }
    );
}