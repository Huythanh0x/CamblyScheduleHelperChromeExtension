export async function findAvailableLessonAtTutor(tutorId, selectedTime, lessonLength, callback) {
    const apiUrl = `https://www.cambly.com/getTutorSchedule?language=en&interfaceLanguage=en&tutor=${tutorId}&proType=&userId=${await getCurrentMainStudentId()}&_=1681036332267`
    // alert(apiUrl)
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let listAvailableLessons = []
            const schedule = data.schedule;
            for (let i = 0; i < schedule.length; i++) {
                let timeSlot = schedule[i];
                let startTime = new Date(timeSlot.startTime.$date).getTime();
                let endTime = new Date(timeSlot.endTime.$date).getTime();

                if (selectedTime >= startTime && selectedTime + (lessonLength * 60 * 1000) <= endTime && Boolean(timeSlot.reservable)) {
                    let startTimeString = new Date(selectedTime).toLocaleString();
                    let endTimeString = new Date(endTime).toLocaleString();

                    listAvailableLessons.push({ tutorId: tutorId, startTime: startTimeString, endTime: endTimeString })
                }
            }
            callback(listAvailableLessons)
        });
}

export async function getListTutorObjecFromListUrlLink(listTutorLinks, listOnlineTutors) {
    let tutorPromises = [];
    for (let i = 0; i < listTutorLinks.length; i++) {
        tutorPromises.push(fetchTutorDataFromTutorLink(listTutorLinks[i], listOnlineTutors));
    }
    return Promise.all(tutorPromises)
        .then(tutorList => {
            console.log(`number of tutors loaded from data source: ${tutorList.length}`);
            return tutorList;
        })
        .catch(error => console.log(error));
}

export async function fetchTutorDataFromTutorLink(tutorLink, listOnlineTutors) {
    return fetch(`https://www.cambly.com/api/tutors?userlink=${tutorLink}&viewAs=student&_=16810041075801`)
        .then(response => response.json())
        .then(data => {
            const tutor = data.result[0];
            let tutorId = tutor._id.$oid
            const foundOnlineTutor = listOnlineTutors.result.find((t) => t.tutorId === tutorId);
            const result = {
                url: `https://www.cambly.com/en/student/tutors/${tutorId}`,
                src: tutor.avatarUrlDict["80"],
                name: tutor.displayName,
                tutorLink: tutorLink,
                id: tutorId,
                isOnline: Boolean(foundOnlineTutor != undefined && foundOnlineTutor != null)
            };
            return result;
        })
        .catch(error => console.log(error));
}

export async function fetchTutorDataFromTutorId(tutorId) {
    return fetch(`https://www.cambly.com/api/users?ids%5B%5D=${tutorId}&viewAs=student&_=1681113727285`)
        .then(response => response.json())
        .then(data => {
            const tutor = data.result[tutorId]
            const result = {
                url: `https://www.cambly.com/en/student/tutors/${tutor.userlink}`,
                src: tutor.avatarUrlDict["80"],
                name: tutor.displayName,
                tutorLink: tutor.userlink,
                id: tutor.userId,
            };
            return result;
        })
        .catch(error => console.log(error));
}


export async function fetchListOnlineTutor() {
    const response = await fetch('https://www.cambly.com/api/tutor_statuses?curriculumId%5B%5D=5e2b9a72db0da5490226b6b5&curriculumId%5B%5D=5e2b9a93c6c4fea72f30b51f&curriculumId%5B%5D=5eb03d0f9934e038cfcf0372&curriculumId%5B%5D=5f347c8d579674f9f991f0d5&curriculumId%5B%5D=5f36c3230f7951036bbc1c73&curriculumId%5B%5D=5f91cc4c433fcd47eed05118&curriculumId%5B%5D=5e2b99e60b114e9a327ceb66&curriculumId%5B%5D=609fdd6fb95e4527664a7252&viewAs=student&_=1681011631289');
    return await response.json();
}


export async function isUserNotLogin() {
    const url = `https://www.cambly.com/api/subscriptions?recipientId=${await getCurrentMainStudentId()}&viewAs=student`;
    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
    });
    return (response.status === 401)
}

export async function getCurrentMainStudentId() {
    return fetch(`https://www.cambly.com/api/ad_reporting_pendings/current?viewAs=student&_=1681171018337`)
        .then(response => response.json())
        .then(data => {
            let result = data.result.userId
            return result;
        })
        .catch(error => console.log(error));
}

export async function getRealListFavouriteTutorIds() {
    let favouriteUrl = `https://www.cambly.com/api/favorite_tutors?userId=${await getCurrentMainStudentId()}&scrub=true&_=1681171018342`
    try {
        const response = await fetch(favouriteUrl);
        const data = await response.json();
        const favouriteTutorIds = data.result.map((tutor) => tutor.tutorId);
        return favouriteTutorIds;
    } catch (error) {
        console.error(error);
    }
}

export async function getLessonFromStudentId(studentId) {
    const minTime = new Date().getTime() - 60 * 60 * 1000;
    const maxTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    const apiUrl = `https://www.cambly.com/api/lessons_v2?studentId=${studentId}&minScheduledStartAt=${minTime}&maxScheduledStartAt=${maxTime}&schedulingType=reserved&viewAs=student&_=1681254879506`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.result || data.result.length === 0) {
        return null; // no lessons found for the student
    }

    // extract the required information from the first lesson object
    const lesson = data.result[0];
    const scheduledMinutes = lesson.scheduledMinutes;
    const scheduledStartAt = lesson.scheduledStartAt.$date;
    const scheduledEndAt = lesson.scheduledEndAt.$date;
    const studentIds = lesson.studentIds[0];
    const tutorId = lesson.tutorId;

    return {
        scheduledMinutes: scheduledMinutes,
        scheduledStartAt: scheduledStartAt,
        scheduledEndAt: scheduledEndAt,
        studentIds: studentIds,
        tutorId: tutorId,
    };
}