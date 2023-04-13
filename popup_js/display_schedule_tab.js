import { fetchTutorDataFromTutorId, isUserNotLogin, findAvailableLessonAtTutor, getListTutorObjecFromListUrlLink, fetchListOnlineTutor } from '../data/api_request_helper.js';
import { onLoadFavouriteListTutorObjects, saveSearchResultData, loadPreviousSearchResult, emptySearchResult } from '../data/local_datasource_helper.js';

const dateInput = document.getElementById('date');
const monthInput = document.getElementById('month');
const yearInput = document.getElementById('year');
const hourInput = document.getElementById('hour');
const minuteInput = document.getElementById('minute');
const lessonLengthInput = document.getElementById('lesson-length');
const submitButton = document.getElementById('submit-button');
const availableLessonListEl = document.querySelector("#availableLessonList");
const progressBarLessonEl = document.querySelector(".loading-container-schedule")
progressBarLessonEl.style.opacity = 0


export async function mainDisplaySchedule() {
    loadPreviousInputData()
    loadPreviousSearchResult(function (listSearchResult) {
        if(listSearchResult.length == 0 || listSearchResult == undefined || listSearchResult == null){
            showMessage("Find your next lesson")
        }else{
            listSearchResult.forEach(searchResultObject=>{
                insertLessonToLessonTab(searchResultObject.tutorObject, searchResultObject.lessonObject)
            })
        }
    })

    submitButton.addEventListener('click', async () => {
        if (await isUserNotLogin()) {
            alert("This feature can only after login")
            return
        }
        const date = dateInput.value;
        const month = monthInput.value;
        const year = yearInput.value;
        const hour = hourInput.value;
        const minute = minuteInput.value;
        const lessonLength = lessonLengthInput.value;

        const selectedTime = new Date(`${month}/${date}/${year} ${hour}:${minute}:00`).getTime();
        if (selectedTime == NaN) {
            alert("Invalid time please check again")
            return
        }
        progressBarLessonEl.style.opacity = 1
        // Save input values to localStorage
        localStorage.setItem('selectedTime', selectedTime);
        localStorage.setItem('lessonLength', lessonLength);
        clearTheOldSearchResult()
        emptySearchResult()
        
        onLoadFavouriteListTutorObjects(async function (listTutorObjects) {
            if (listTutorObjects.length == 0) {
                alert("THERE IS NO TUTOR TO START SEARCHING")
                progressBarLessonEl.style.opacity = 0
                return
            }
            let promises = listTutorObjects.map(tutorObject => {
                return new Promise(async (resolve, reject) => {
                    await findAvailableLessonAtTutor(tutorObject.tutorId, selectedTime, lessonLength, async function (listAvailableLessons) {
                        listAvailableLessons.forEach(async lessonObject => {
                            insertLessonToLessonTab(tutorObject, lessonObject)
                            saveSearchResultData(tutorObject, lessonObject)
                        })
                        resolve()
                    })
                })
            })
            await Promise.all(promises)
            progressBarLessonEl.style.opacity = 0
            if (document.querySelectorAll(".schedule-item").length == 0) {
                alert(`There is no lesson at ${new Date(selectedTime).toLocaleString()}`)
                showMessage("Find your next lesson")
            }
        })
    });
}

function clearTheOldSearchResult() {
    while (availableLessonListEl.firstChild) {
        availableLessonListEl.removeChild(availableLessonListEl.firstChild);
    }
}

function insertLessonToLessonTab(tutorObject, lessonObject) {
    const avatarEl = document.createElement("img");
    avatarEl.classList.add("avatar");
    avatarEl.setAttribute("src", tutorObject.src);
    avatarEl.addEventListener(
        "click",
        (function () {
            sendFavouriteAccountMessage(tutorObject.url)
        }))
    const nameEl = document.createElement("h3");
    nameEl.innerText = tutorObject.name;

    const lessonTimeEl = document.createElement("div");
    lessonTimeEl.classList.add("lesson-time");
    const startTimeEl = document.createElement("span");
    startTimeEl.innerText = lessonObject.startTime.split(", ")[1];
    const endTimeEl = document.createElement("span");
    endTimeEl.innerText = lessonObject.endTime.split(", ")[1];
    //lesson time
    lessonTimeEl.appendChild(startTimeEl);
    lessonTimeEl.appendChild(document.createTextNode(" - "));
    lessonTimeEl.appendChild(endTimeEl);
    //name-lesson group
    const nameLessonGroupEl = document.createElement("div");
    nameLessonGroupEl.classList.add("name-lesson-group")
    nameLessonGroupEl.appendChild(nameEl)
    nameLessonGroupEl.appendChild(lessonTimeEl)
    // elments group
    const avatarNameGroupEl = document.createElement("div");
    avatarNameGroupEl.classList.add("avatar-group");
    avatarNameGroupEl.appendChild(avatarEl);
    avatarNameGroupEl.appendChild(nameLessonGroupEl);
    //login button
    const loginBtn = document.createElement("button");
    loginBtn.classList.add("login-btn");
    loginBtn.innerHTML = "Schedule";
    loginBtn.addEventListener(
        "click",
        function () {
            sendFavouriteAccountMessage(tutorObject.url)
        }
    )
    const btnGroupEl = document.createElement("div");
    btnGroupEl.appendChild(loginBtn)
    //li
    const li = document.createElement("li");
    li.classList.add("schedule-item");
    li.appendChild(avatarNameGroupEl);
    li.appendChild(btnGroupEl);
    availableLessonListEl.appendChild(li);
}

function loadPreviousInputData() {
    try {
        const selectedTime = localStorage.getItem('selectedTime');
        const lessonLength = localStorage.getItem('lessonLength');
        if (selectedTime && lessonLength) {
            // Convert selectedTime to Date object
            const selectedDate = new Date(parseInt(selectedTime));
            // Set form values
            dateInput.value = selectedDate.getDate();
            monthInput.value = selectedDate.getMonth() + 1;
            yearInput.value = selectedDate.getFullYear();
            hourInput.value = selectedDate.getHours();
            minuteInput.value = selectedDate.getMinutes();
            lessonLengthInput.value = lessonLength;
        }

    } catch (error) {
        alert(error)
    }
}

function sendFavouriteAccountMessage(tUrl) {
    chrome.runtime.sendMessage(
        { message: "navigate_to_favourite_tutor", tutorUrl: tUrl },
        function (response) { }
    );
}

function showMessage(message) {
    var emptyTag = document.createElement("h1");
    emptyTag.innerText = message;
    availableLessonListEl.appendChild(emptyTag);
}