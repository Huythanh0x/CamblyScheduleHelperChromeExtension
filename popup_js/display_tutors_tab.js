import { fetchListOnlineTutor, getListTutorObjecFromListUrlLink, isUserNotLogin, getRealListFavouriteTutorIds, fetchTutorDataFromTutorId } from '../data/api_request_helper.js';
import { onLoadFavouriteListTutorLinks, saveTutorToFavourite } from '../data/local_datasource_helper.js';

const tutorListEl = document.getElementById("tutorList");
let listOnlineTutors = null
const progressBarTutornEl = document.querySelector(".loading-container-tutor")

export async function mainDisplayTutors() {
    if (await isUserNotLogin()) {
        showMessage("This feature can only use after login")
        progressBarTutornEl.style.opacity = 0
        return
    }
    onImportButtonClick()
    onLoadFavouriteListTutorLinks(async function (listTutorLinks) {
        listOnlineTutors = await fetchListOnlineTutor()
        let listTutorObjects = await getListTutorObjecFromListUrlLink(listTutorLinks, listOnlineTutors)
        listTutorObjects = listTutorObjects.sort((a, b) => b.isOnline - a.isOnline)
        progressBarTutornEl.style.opacity = 0
        if (listTutorLinks.length == 0) {
            showMessage("Empty list here, please add new favrourite tutors on Cambly website and import them")
        } else {
            displayTutorList(listTutorObjects);
        }
    })
}

function displayTutorList(tutorList) {
    const tutorListEl = document.querySelector("#tutorList");
    for (let i = 0; i < tutorList.length; i++) {
        if (tutorList[i] == undefined || tutorList[i] == null) continue
        const avatarEl = document.createElement("img");
        avatarEl.classList.add("avatar");
        avatarEl.setAttribute("src", tutorList[i].src);
        avatarEl.addEventListener(
            "click",
            (function () {
                sendFavouriteAccountMessage(tutorList[i].url)
            }))
        const nameEl = document.createElement("h3");
        nameEl.innerText = tutorList[i].name;
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
                sendFavouriteAccountMessage(tutorList[i].url)
            }
        )
        deleteBtn.addEventListener(
            "click",
            (function (index) {
                return function () {
                    deleteTutor(tutorList[i].tutorLink)
                    tutorList.splice(index, 1)
                    tutorListEl.removeChild(tutorListEl.childNodes[index]);
                    location.reload();
                    if (tutorList.length == 0) {
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
        if (tutorList[i].isOnline) {
            li.style.backgroundColor = "lightgreen";
        }
        tutorListEl.appendChild(li);
    }
}

function sendFavouriteAccountMessage(tUrl) {
    chrome.runtime.sendMessage({ message: "navigate_to_favourite_tutor", tutorUrl: tUrl }, function (response) { });
}

function deleteTutor(tutorLink) {
    chrome.storage.sync.get("LIST_TUTOR_LINK", function (result) {
        let listTutorLinks = result.LIST_TUTOR_LINK || [];

        let index = listTutorLinks.findIndex((t) => t === tutorLink);

        if (index === -1) {
            alert(`Tutor "${tutorLink}" was not found in list`);
            return;
        }

        listTutorLinks.splice(index, 1);
        chrome.storage.sync.set({ LIST_TUTOR_LINK: listTutorLinks }, function () { });
    });
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
                let tutorLink = tutorData.tutorLink;
                saveTutorToFavourite(tutorLink);
            }));
            alert(`Import all tutors succesfully`);
            location.reload()
        }
    );
}