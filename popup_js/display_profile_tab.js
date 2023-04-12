import { getCurrentMainStudentId, isUserNotLogin } from '../data/api_request_helper.js';

const overlay = document.getElementById('account-loading-overlay');
const loadingDialog = document.getElementById('loading-dialog');

export async function mainDisplayProfile() {
    showLoadingDialog()
    if (await isUserNotLogin()) {
        hideLoadingDialog()
        openLoginDialog()
        return
    }

    let userInfo = await getUserInfo()
    let studentBalance = await getStudentBalance()
    updateUI(userInfo, studentBalance)
    hideLoadingDialog()
    document.querySelector(".navigate-button").addEventListener("click", function () {
        chrome.runtime.sendMessage({ message: "navigate_to_dashboard" }, function (response) { });
    });
}

async function getUserInfo() {
    const response = await fetch('https://www.cambly.com/api/users/current?scrub=true&_=1681263540805');
    const data = await response.json();

    let conversionDate, planState
    try {
        conversionDate =  data.result.conversionDate.$date        
    } catch (error) {
        conversionDate = null
    }
    planState =  data.result.planState
    if(planState == undefined || planState == null){
        planState = "FREE"
    }

    const userInfo = {
        id: data.result.id,
        email: data.result.email,
        planState: planState,
        firstName: data.result.first_name,
        lastName: data.result.last_name,
        emailVerified: data.result.emailVerified,
        signUpTime: data.result.account.student.signupTime.$date,
        planMinutesPerDay: data.result.planMinutesPerDay,
        refreshDelayHours: data.result.refreshDelayHours,
        conversionDate: conversionDate,
        expiredDate: data.result.expiredPlan,
        avatarUrl: data.result.avatarUrl
    };
    return userInfo;
}

async function getStudentBalance() {
    let studentId = await getCurrentMainStudentId()
    const response = await fetch(`https://www.cambly.com/api/student_balances?studentId=${studentId}&viewAs=student&_=1681263540832`);
    let data = await response.json();
    data = data.result[0]
    console.log(Object.keys(data))
    return {
        anytimeMinutes: data.anytimeMinutes,
        planMinutesAvailableInWeek: data.planMinutesAvailableInWeek,
        planMinutes: data.planMinutes,
        anytimeMinutesAvailable: data.anytimeMinutesAvailable,
        isSubscribed: data.isSubscribed
    };
}

function updateUI(userInfo, studentBalance) {
    document.querySelector(".subscription-status").innerText = String(userInfo.planState + " PLAN").toUpperCase()
    document.querySelector(".user-avatar").src = `https://www.cambly.com/${userInfo.avatarUrl}`
    document.querySelector(".name").innerText = `${userInfo.lastName} ${userInfo.firstName}`
    document.querySelector(".email").innerText = userInfo.email

    let expiredDate = userInfo.expiredDate
    if(expiredDate == null || expiredDate == undefined){
        document.querySelectorAll("div.paid-group")[0].querySelectorAll("span.value")[1].style.color = "red"
        document.querySelector(".subscription-status").style.color = "red"
        document.querySelectorAll("div.paid-group")[0].querySelectorAll("span.value")[1].innerText = "Unknown"
    }
    else{
        document.querySelectorAll("div.paid-group")[0].querySelectorAll("span.value")[1].innerText = new Date(expiredDate).toLocaleDateString()
    }
    if(expiredDate < new Date().getTime()){
        document.querySelectorAll("div.paid-group")[0].querySelectorAll("span.value")[1].style.color = "red"
    }
    
    if(userInfo.planMinutesPerDay == undefined || userInfo.planMinutesPerDay == null || userInfo.planMinutesPerDay === "undefined"){
        document.querySelectorAll("div.paid-group")[1].querySelectorAll("span.value")[0].innerText = "Unknown"
        document.querySelectorAll("div.paid-group")[1].querySelectorAll("span.value")[0].style.color = "red"
    }else{
        document.querySelectorAll("div.paid-group")[1].querySelectorAll("span.value")[0].innerText = userInfo.planMinutesPerDay
    }
    document.querySelectorAll("div.paid-group")[0].querySelectorAll("span.value")[0].innerText = new Date(userInfo.conversionDate).toLocaleDateString()
    document.querySelectorAll("div.paid-group")[1].querySelectorAll("span.value")[1].innerText = userInfo.refreshDelayHours
    document.querySelectorAll("div.minutes")[0].querySelectorAll("span.value")[0].innerText = studentBalance.anytimeMinutes
    document.querySelectorAll("div.minutes")[1].querySelectorAll("span.value")[0].innerText = studentBalance.anytimeMinutes + studentBalance.planMinutesAvailableInWeek

    // if (Boolean(userInfo.emailVerified)) {
    //     document.querySelector("img.subcribe-indicator").src = "./images/cross_icon.png"
    // }else{
    //     document.querySelector("img.subcribe-indicator").src = "./images/tick_icon.png"
    // }
    // alert(document.querySelector(".subcribe-indicator")['src'])
}

function openLoginDialog() {
    const container = document.querySelector('.main-tab-container');
    const dialog = document.getElementById('login-overlay');

    container.style.position = 'relative';
    dialog.style.position = 'absolute';

    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';

    dialog.style.zIndex = '999';
    dialog.style.display = 'block';

    const loginBtn = document.getElementById("dialog-login-button");
    loginBtn.addEventListener("click", function () {
        chrome.runtime.sendMessage({ message: "navigate_to_dashboard" }, function (response) { });
    });

    const cancelBtn = document.getElementById("dialog-cancel-button");
    cancelBtn.addEventListener("click", function () {
        window.close();
    });
}


function showLoadingDialog() {
    overlay.style.display = 'block';
    loadingDialog.style.display = 'block';
}

function hideLoadingDialog() {
    overlay.style.display = 'none';
    loadingDialog.style.display = 'none';
}