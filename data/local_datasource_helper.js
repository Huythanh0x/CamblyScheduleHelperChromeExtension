export function onLoadFavouriteListTutorObjects(callback) {
    chrome.storage.sync.get("listTutorObjects", function (result) {
        callback(result.listTutorObjects || [])
    });
}

export function deleteTutor(tutorObject) {
    chrome.storage.sync.get("listTutorObjects", function (result) {
        let listtutorObjects = result.listTutorObjects || [];
        // Find index of tutor with matching name
        let index = listtutorObjects.findIndex((t) => t.tutorId === tutorObject.tutorId);
        if (index === -1) {
            alert(`Tutor "${tutorObject}" was not found in list`);
            return;
        }
        listtutorObjects.splice(index, 1);
        chrome.storage.sync.set({ listTutorObjects: listtutorObjects }, function () {
        });
    });
}

export function saveTutorToFavourite(tutorObject) {
    chrome.storage.sync.get("listTutorObjects", function (result) {
        let listtutorObjects = result.listTutorObjects || [];
        if (!Array.isArray(listtutorObjects)) {
            listtutorObjects = [];
        }
        // Check if tutor with same name already exists in list
        for (let i = 0; i < listtutorObjects.length; i++) {
            if (listtutorObjects[i].tutorId == tutorObject.tutorId) {
                return
            }
        }
        listtutorObjects.push(tutorObject);
        console.log('added tutor ', tutorObject)
        chrome.storage.sync.set({ listTutorObjects: listtutorObjects }, function () {});
    });
}


export function saveSearchResultData(tutorObject, lessonObject) {
    loadPreviousSearchResult(function(listSearchResult){
        listSearchResult.push({tutorObject:tutorObject, lessonObject: lessonObject})
        chrome.storage.local.set({ listSearchResult: listSearchResult })
    })
}


export function loadPreviousSearchResult(callback) {
    chrome.storage.local.get('listSearchResult', (data) => {
        if (data.listSearchResult != null || data.listSearchResult != undefined) {
            callback(data.listSearchResult)
        }else{
            callback([])
        }
    });
}

export function emptySearchResult() {
    chrome.storage.local.set({ listSearchResult: [] })
}