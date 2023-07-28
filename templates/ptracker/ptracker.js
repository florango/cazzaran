import {
  createEl,
} from '../../scripts/scripts.js';

async function getStatus(pId) {
  let statusArr;
  try {
    const resp = await fetch(`https://us-central1-p-tracker-394021.cloudfunctions.net/pstatus?id=${pId}`);
    statusArr = await resp.json();
  } catch (ew) {
    console.error(ew);
  }
  return statusArr;
}

export default async function decorate(doc) {
  const mainEl = doc.querySelector('main');
  const params = new URLSearchParams(window.location.search);
  const pId = params.get('pId');
  const status = await getStatus(pId);
  console.log(status);
  buildPTracker();

  function buildPTracker() {

    const trackerHolderEl = createEl('div', {
      class: 'tracker-holder',
    }, '', mainEl);

    const progressBarEl = createEl('div', {
      class: 'progress-bar',
    }, '', trackerHolderEl);

    const infoEl = createEl('div', {
      class: 'info',
    }, `
      <div>
          <h2 class="phase">
      </div>
    `, trackerHolderEl);

    let labels = {};
    const phases = {};

    status.forEach((row, i) => {
      if (i === 0) {
        labels = row;
        return;
      }

      const tasks = phases[row.phase] || [];

      tasks.push(row);

      phases[row.phase] = tasks;
    });

    Object.keys(phases).forEach(key => {
      const tasks = phases[key];
      const progressBarPartEl = createEl('div', {
        id: key,
        class: 'part',
      }, `
        <div>
          ${key}
        </div>
      `, progressBarEl);
      progressBarPartEl.style['flex-grow'] = (tasks.length < 3) ? 3 : tasks.length;
      const state = getState(tasks);
      progressBarPartEl.classList.add(state);
      if(state === 'current') {
        loadInfo(key);
      }
      progressBarPartEl.addEventListener('click', () => {
        loadInfo(key);
      });
    });

    function getState(tasks) {
      let state = 'future';
      const current = tasks.filter(task => task?.status && task?.status !== 'Not Started' && task?.status !== 'Finished');
      const finished = tasks.filter(task => task?.status === 'Finished');
      if (current.length > 0) {
        state = 'current';
      } else if (finished.length == tasks.length) {
        state = 'done';
      }
      return state;      
    }

    function getPhase(phaseName) {
      return phases[phaseName];
    }

    function loadInfo(phaseName) {
      const phase = getPhase(phaseName);
      const headerEl = infoEl.querySelector('h2');
      headerEl.textContent = phaseName;
    }
  }
}


