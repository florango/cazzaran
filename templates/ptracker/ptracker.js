import {
  createEl, getJSON,
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
  await buildPTracker();

  async function buildPTracker() {

    const trackerHolderEl = createEl('div', {
      class: 'tracker-holder',
    }, '', mainEl);

    const progressBarEl = createEl('div', {
      class: 'progress-bar',
    }, '', trackerHolderEl);

    const infoEl = createEl('div', {
      class: 'info',
    }, `
        <h2 class="phase"></h2>
    `, trackerHolderEl);

    const detailsButtonEl = createEl('button', {
      class: 'primary button',
    }, 'Details', infoEl);

    const detailsContainerEl = createEl('div', {
      class: 'details-container',
    }, '', infoEl);

    detailsButtonEl.addEventListener('click', () => {
      detailsContainerEl.classList.add('show');
      detailsButtonEl.remove();
    });

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

    Object.keys(phases).forEach(async (key) => {
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
      if (state === 'current') {
        await loadInfo(key);
      }
      progressBarPartEl.addEventListener('click', async () => {
        await loadInfo(key);
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

    function getCurrentPhase() {
      return progressBarEl.querySelector('.current')?.id;
    }

    async function loadInfo(phaseName) {
      const phase = getPhase(phaseName);
      const headerEl = infoEl.querySelector('h2');
      headerEl.textContent = phaseName;
      detailsContainerEl.innerHTML = '';
      const details = [...[labels], ...phase];
      const taskTableEl = createEl('table', {}, '', detailsContainerEl);
      details.forEach(async (task, i) => {
        const status = (task.status || 'not-started').toLowerCase().trim().replace(' ', '-');
        const taskRowEl = createEl('tr', {
          class: `task-item ${status}`,
        }, `
          <td class="task" data-is="${task.task}" data-description="${task.desc}">
            <label>${labels.task}<br/></label> ${task.task}
          </td>
          <td data-is="${task.time}">
          <label>${labels.time}<br/></label> ${task.time}
          </td>
          <td data-is="${task.start}">
          <label>${labels.start}<br/></label> ${task.start}
          </td>
          <td data-is="${task.end}">
          <label>${labels.end}<br/></label> ${task.end}
          </td>
          <td data-is="${task.done}">
          <label>${labels.done}<br/></label> ${task.done}
          </td>
          <td class="role" data-is="${task.assign}">
          <label>${labels.assign}<br/></label> ${task.assign}
          </td>
          <td class="notes" data-is="${task.notes}">
          ${task.notes}
          </td>
          <td class="status-level" data-is="${task.status}">
          <label>${labels.status}<br/></label> ${task.status}
          </td>
        `, taskTableEl);
        if (i != 0) {
          const notesCellEl = taskRowEl.querySelector('.notes');
          const notesText = notesCellEl.dataset.is;
          notesCellEl.innerHTML = `<label>${labels.notes}<br/></label>`;
          if (notesText?.trim() !== '') {
            notesCellEl.append('🗒️');
            notesCellEl.addEventListener('click', () => {
              alert(notesText);
            });
          }

          const roleCellEl = taskRowEl.querySelector('.role');
          const roles = await getJSON('/resources/ptracker/roles.json');
          const role = roles?.data?.filter(r => {
            return r.Assigned === roleCellEl.dataset.is;
          });

          roleCellEl.addEventListener('click', () => {
            alert(role[0].Description);
          });

          const statusCellEl = taskRowEl.querySelector('.status-level');
          const statusLevels = await getJSON('/resources/ptracker/status-levels.json');
          const statusLevel = statusLevels?.data?.filter(s => {
            return s.Status === statusCellEl.dataset.is;
          });
          statusCellEl.addEventListener('click', () => {
            alert(statusLevel[0].Description);
          });
        }
      });
    }
  }
}




