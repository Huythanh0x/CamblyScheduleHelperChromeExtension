import { mainDisplayProfile } from './popup_js/display_profile_tab.js';
import { mainDisplayTutors } from './popup_js/display_tutors_tab.js';
import { mainDisplaySchedule } from './popup_js/display_schedule_tab.js'
import { mainDisplayLesson } from './popup_js/display_lesson_tab.js'
import { loadIsUserNotLogin } from './data/local_datasource_helper.js'

mainDisplayProfile()
mainDisplayTutors()
mainDisplaySchedule()
mainDisplayLesson()
handleSwitchTab()

async function handleSwitchTab() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.content');
  let activeTabIndex = parseInt(localStorage.getItem('activeTabIndex')) || 0;
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach((tab) => {
        tab.classList.remove('active');
      });
      contents.forEach((content) => {
        content.classList.remove('active');
      });
      tab.classList.add('active');
      contents[index].classList.add('active');
      activeTabIndex = index;
      localStorage.setItem('activeTabIndex', activeTabIndex);
    });
  });
  if (await loadIsUserNotLogin()) {
    tabs[0].click();
  } else {
    tabs[activeTabIndex].click();
  }
}

function loadDataContentForActiveTab() {
  const activeTab = document.querySelector('.tabs').querySelector("active")

  alert(activeTab)
  if (activeTab.innerHTML.includes("Accounts Tab")) {
    mainDisplayProfile()
  } else if (activeTab.innerHTML.includes("Tutors Tab")) {
    mainDisplayTutors()
  } else if (activeTab.innerHTML.includes("Schedule Tab")) {
    mainDisplaySchedule()
  } else {
    alert(activeTab)
  }
}