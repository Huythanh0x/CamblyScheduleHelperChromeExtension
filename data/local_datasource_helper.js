export function onLoadFavouriteListTutorLinks(callback) {
    chrome.storage.sync.get("LIST_TUTOR_LINK", function (result) {
        callback(result.LIST_TUTOR_LINK || [])
    });
}

export function deleteTutor(tutorLink) {
    chrome.storage.sync.get("LIST_TUTOR_LINK", function (result) {
        let listTutorLinks = result.LIST_TUTOR_LINK || [];
        // Find index of tutor with matching name
        let index = listTutorLinks.findIndex((t) => t === tutorLink);
        if (index === -1) {
            alert(`Tutor "${tutorLink}" was not found in list`);
            return;
        }
        listTutorLinks.splice(index, 1);
        chrome.storage.sync.set({ LIST_TUTOR_LINK: listTutorLinks }, function () {
        });
    });
}

export function saveTutorToFavourite(tutorLink) {
    chrome.storage.sync.get("LIST_TUTOR_LINK", function (result) {
        let listTutorLinks = result.LIST_TUTOR_LINK || [];
        if (!Array.isArray(listTutorLinks)) {
            listTutorLinks = [];
        }
        // Check if tutor with same name already exists in list
        for (let i = 0; i < listTutorLinks.length; i++) {
            if (listTutorLinks[i] == tutorLink) {
                return
            }
        }
        listTutorLinks.push(tutorLink);
        console.log('added tutor ', tutorLink)
        chrome.storage.sync.set({ LIST_TUTOR_LINK: listTutorLinks }, function () {
            if (isAlert) {
                alert(`Added tutor ${tutorLink} to the favourite list`)
            }
        });
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