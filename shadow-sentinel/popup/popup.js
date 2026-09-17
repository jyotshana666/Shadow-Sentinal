// popup/popup.js

/**
 * Dashboard UI script for ShadowSentinel.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const authRes = await storageGet([CONFIG.STORAGE_KEYS.AUTH]);
    const auth = authRes[CONFIG.STORAGE_KEYS.AUTH];
    if (!auth || !auth.jwt) {
      redirectToLogin();
      return;
    }
    
    // Validate JWT expiry
    const payload = JSON.parse(atob(auth.jwt.split('.')[1] || ''));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      await storageRemove(CONFIG.STORAGE_KEYS.AUTH);
      redirectToLogin();
      return;
    }
    
    initDashboard();
    
    // Load data
    const keys = [CONFIG.STORAGE_KEYS.PENDING_SESSIONS, CONFIG.STORAGE_KEYS.LAST_SYNC_TIME, 'blockedVisitLog'];
    const data = await storageGet(keys);
    const pending = data[CONFIG.STORAGE_KEYS.PENDING_SESSIONS] || [];
    const blockedLog = data['blockedVisitLog'] || [];
    
    renderDashboard(pending, blockedLog);
  } catch (e) {
    if (CONFIG.DEBUG) console.error('Popup init error', e);
    // On unexpected error, default to login just in case
    redirectToLogin();
  }
});

function redirectToLogin() {
  window.location.href = chrome.runtime.getURL('auth/login.html');
}

function initDashboard() {
  // Set greeting based on time of day
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  document.getElementById('greeting').textContent = greeting;

  // Bind menu
  const btnMenu = document.getElementById('btn-menu');
  const dropdown = document.getElementById('dropdown-menu');
  
  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });
  
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });

  document.getElementById('btn-sync').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'MANUAL_SYNC' });
    dropdown.classList.add('hidden');
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await storageRemove(CONFIG.STORAGE_KEYS.AUTH);
    redirectToLogin();
  });
}

function renderDashboard(pending, blockedLog) {
  // Compute stats
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = pending.filter(s => s.startTime && s.startTime.startsWith(today));
  const todayBlocked = blockedLog.filter(b => b.timestamp && b.timestamp.startsWith(today));
  
  document.getElementById('stat-events').textContent = todaySessions.length;
  document.getElementById('stat-alerts').textContent = todayBlocked.length;

  // Activity list
  const activityList = document.getElementById('activity-list');
  activityList.innerHTML = ''; // clear

  // Combine and sort recent activity
  let activities = [];
  
  pending.forEach(s => {
    activities.push({
      title: `Policy checked: ${s.domain}`,
      time: new Date(s.endTime || s.startTime),
      type: 'session'
    });
  });

  blockedLog.forEach(b => {
    activities.push({
      title: `Prompt blocked: ${b.domain}`,
      time: new Date(b.timestamp),
      type: 'block'
    });
  });

  activities.sort((a, b) => b.time - a.time);
  
  const recent = activities.slice(0, 5);

  if (recent.length === 0) {
    const empty = document.createElement('div');
    empty.style.color = 'var(--text-secondary)';
    empty.style.fontSize = '13px';
    empty.textContent = 'No recent activity.';
    activityList.appendChild(empty);
    return;
  }

  recent.forEach(act => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const dot = document.createElement('div');
    dot.className = 'activity-dot';
    // Style block vs session
    if (act.type === 'block') {
      dot.style.background = 'var(--error, #C53030)';
    }

    const content = document.createElement('div');
    content.className = 'activity-content';

    const title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = act.title;

    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = relativeTime(act.time);

    content.appendChild(title);
    content.appendChild(time);
    
    item.appendChild(dot);
    item.appendChild(content);

    activityList.appendChild(item);
  });
}

function relativeTime(date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
