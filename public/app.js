const API_BASE = '/api';

const state = {
  token: localStorage.getItem('srx.token') || '',
  user: JSON.parse(localStorage.getItem('srx.user') || 'null'),
};

const els = {
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  logoutBtn: document.querySelector('#logoutBtn'),
  sessionBadge: document.querySelector('#sessionBadge'),
  profileCard: document.querySelector('#profileCard'),
  vehicleForm: document.querySelector('#vehicleForm'),
  vehiclesList: document.querySelector('#vehiclesList'),
  challengesList: document.querySelector('#challengesList'),
  notificationsList: document.querySelector('#notificationsList'),
  challengeForm: document.querySelector('#challengeForm'),
  refreshVehiclesBtn: document.querySelector('#refreshVehiclesBtn'),
  refreshChallengesBtn: document.querySelector('#refreshChallengesBtn'),
  refreshNotificationsBtn: document.querySelector('#refreshNotificationsBtn'),
  toast: document.querySelector('#toast'),
};

const showToast = (message, isError = false) => {
  els.toast.textContent = message;
  els.toast.style.borderColor = isError ? 'var(--danger)' : 'var(--accent)';
  els.toast.classList.remove('hidden');
  window.setTimeout(() => els.toast.classList.add('hidden'), 3800);
};

const formToObject = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());

  for (const key of ['year', 'horsepower']) {
    if (data[key]) {
      data[key] = Number(data[key]);
    }
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === '') {
      delete data[key];
    }
  });

  return data;
};

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
};

const saveSession = (result) => {
  state.token = result.token;
  state.user = result.user;
  localStorage.setItem('srx.token', state.token);
  localStorage.setItem('srx.user', JSON.stringify(state.user));
};

const clearSession = () => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('srx.token');
  localStorage.removeItem('srx.user');
};

const renderProfile = () => {
  const user = state.user;

  if (!user) {
    els.sessionBadge.textContent = 'Sin sesion';
    els.sessionBadge.classList.add('muted');
    els.logoutBtn.classList.add('hidden');
    els.profileCard.classList.add('hidden');
    return;
  }

  els.sessionBadge.textContent = user.role;
  els.sessionBadge.classList.remove('muted');
  els.logoutBtn.classList.remove('hidden');
  els.profileCard.classList.remove('hidden');
  els.profileCard.innerHTML = `
    <div>
      <p class="item-title">${user.name}</p>
      <p class="item-meta">${user.email}<br />ID: ${user.id}</p>
    </div>
    <div class="profile-grid">
      <div class="metric"><span>Rango</span><strong>${user.rank}</strong></div>
      <div class="metric"><span>Racha</span><strong>${user.consecutiveWins}</strong></div>
      <div class="metric"><span>Victorias</span><strong>${user.totalWins}</strong></div>
      <div class="metric"><span>Derrotas</span><strong>${user.totalLosses}</strong></div>
    </div>
  `;
};

const refreshMe = async () => {
  if (!state.token) {
    renderProfile();
    return;
  }

  const response = await request('/auth/me');
  state.user = response.data;
  localStorage.setItem('srx.user', JSON.stringify(state.user));
  renderProfile();
};

const renderVehicles = (vehicles) => {
  if (!vehicles.length) {
    els.vehiclesList.innerHTML = '<div class="empty">No hay vehiculos registrados.</div>';
    return;
  }

  els.vehiclesList.innerHTML = vehicles
    .map(
      (vehicle) => `
      <article class="item-card">
        <div class="item-head">
          <div>
            <p class="item-title">${vehicle.name} ${vehicle.isActive ? '<span class="badge">Activo</span>' : ''}</p>
            <p class="item-meta">
              ${vehicle.brand} ${vehicle.model} ${vehicle.year}<br />
              ${vehicle.type} - ${vehicle.horsepower} HP<br />
              ID: ${vehicle.id}
            </p>
          </div>
          <div class="actions">
            <button class="small" data-vehicle-action="activate" data-id="${vehicle.id}" type="button">Activar</button>
            <button class="small danger" data-vehicle-action="delete" data-id="${vehicle.id}" type="button">Eliminar</button>
          </div>
        </div>
      </article>
    `,
    )
    .join('');
};

const loadVehicles = async () => {
  if (!state.token) return;
  const response = await request('/vehicles/me');
  renderVehicles(response.data);
};

const renderChallenges = (challenges) => {
  if (!challenges.length) {
    els.challengesList.innerHTML = '<div class="empty">No hay retos todavia.</div>';
    return;
  }

  els.challengesList.innerHTML = challenges
    .map((challenge) => {
      const isReceiver = challenge.receiverId === state.user?.id;
      const isSender = challenge.senderId === state.user?.id;
      const canAccept = isReceiver && challenge.status === 'PENDING';
      const canCancel = isSender && challenge.status === 'PENDING';
      const canComplete = challenge.status === 'ACCEPTED';

      return `
        <article class="item-card">
          <div class="item-head">
            <div>
              <p class="item-title">${challenge.sender.name} vs ${challenge.receiver.name}</p>
              <p class="item-meta">
                Estado: ${challenge.status}<br />
                Ganador: ${challenge.winner?.name || 'Pendiente'}<br />
                Lugar: ${challenge.location || 'No definido'}<br />
                ID: ${challenge.id}
              </p>
            </div>
            <span class="badge ${challenge.status === 'COMPLETED' ? '' : 'muted'}">${challenge.status}</span>
          </div>
          <div class="actions">
            ${
              canAccept
                ? `<button class="small" data-challenge-action="accept" data-id="${challenge.id}" type="button">Aceptar</button>
                   <button class="small danger" data-challenge-action="reject" data-id="${challenge.id}" type="button">Rechazar</button>`
                : ''
            }
            ${
              canCancel
                ? `<button class="small danger" data-challenge-action="cancel" data-id="${challenge.id}" type="button">Cancelar</button>`
                : ''
            }
            ${
              canComplete
                ? `<button class="small" data-challenge-action="complete" data-id="${challenge.id}" type="button">Completar</button>`
                : ''
            }
          </div>
        </article>
      `;
    })
    .join('');
};

const loadChallenges = async () => {
  if (!state.token) return;
  const response = await request('/challenges/me');
  renderChallenges(response.data);
};

const renderNotifications = (notifications) => {
  if (!notifications.length) {
    els.notificationsList.innerHTML = '<div class="empty">No hay notificaciones.</div>';
    return;
  }

  els.notificationsList.innerHTML = notifications
    .map(
      (notification) => `
      <article class="item-card">
        <div class="item-head">
          <div>
            <p class="item-title">${notification.title}</p>
            <p class="item-meta">
              ${notification.message}<br />
              ${new Date(notification.createdAt).toLocaleString()}<br />
              ID: ${notification.id}
            </p>
          </div>
          <div class="actions">
            <span class="badge ${notification.read ? 'muted' : ''}">${notification.read ? 'Leida' : 'Nueva'}</span>
            ${
              notification.read
                ? ''
                : `<button class="small" data-notification-action="read" data-id="${notification.id}" type="button">Marcar</button>`
            }
          </div>
        </div>
      </article>
    `,
    )
    .join('');
};

const loadNotifications = async () => {
  if (!state.token) return;
  const response = await request('/notifications/me');
  renderNotifications(response.data);
};

const refreshDashboard = async () => {
  if (!state.token) return;
  await Promise.allSettled([refreshMe(), loadVehicles(), loadChallenges(), loadNotifications()]);
};

document.querySelectorAll('[data-auth-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-auth-tab]').forEach((tab) => tab.classList.remove('active'));
    button.classList.add('active');
    els.loginForm.classList.toggle('hidden', button.dataset.authTab !== 'login');
    els.registerForm.classList.toggle('hidden', button.dataset.authTab !== 'register');
  });
});

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(formToObject(els.loginForm)),
    });
    saveSession(response.data);
    await refreshDashboard();
    showToast('Sesion iniciada');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formToObject(els.registerForm)),
    });
    saveSession(response.data);
    await refreshDashboard();
    showToast('Cuenta creada');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.logoutBtn.addEventListener('click', () => {
  clearSession();
  renderProfile();
  renderVehicles([]);
  renderChallenges([]);
  renderNotifications([]);
  showToast('Sesion cerrada');
});

els.vehicleForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(formToObject(els.vehicleForm)),
    });
    await loadVehicles();
    showToast('Vehiculo creado');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.vehiclesList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-vehicle-action]');
  if (!button) return;

  try {
    if (button.dataset.vehicleAction === 'activate') {
      await request(`/vehicles/${button.dataset.id}/activate`, { method: 'PATCH' });
      showToast('Vehiculo activado');
    }

    if (button.dataset.vehicleAction === 'delete') {
      await request(`/vehicles/${button.dataset.id}`, { method: 'DELETE' });
      showToast('Vehiculo eliminado');
    }

    await loadVehicles();
  } catch (error) {
    showToast(error.message, true);
  }
});

els.challengeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await request('/challenges', {
      method: 'POST',
      body: JSON.stringify(formToObject(els.challengeForm)),
    });
    await loadChallenges();
    showToast('Reto creado');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.challengesList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-challenge-action]');
  if (!button) return;

  try {
    const id = button.dataset.id;
    const action = button.dataset.challengeAction;

    if (action === 'complete') {
      const winnerId = window.prompt('ID del ganador');
      if (!winnerId) return;

      await request(`/challenges/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ winnerId }),
      });
    } else {
      await request(`/challenges/${id}/${action}`, { method: 'PATCH' });
    }

    await refreshDashboard();
    showToast('Reto actualizado');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.notificationsList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-notification-action="read"]');
  if (!button) return;

  try {
    await request(`/notifications/${button.dataset.id}/read`, { method: 'PATCH' });
    await loadNotifications();
    showToast('Notificacion actualizada');
  } catch (error) {
    showToast(error.message, true);
  }
});

els.refreshVehiclesBtn.addEventListener('click', loadVehicles);
els.refreshChallengesBtn.addEventListener('click', loadChallenges);
els.refreshNotificationsBtn.addEventListener('click', loadNotifications);

renderProfile();
renderVehicles([]);
renderChallenges([]);
renderNotifications([]);
refreshDashboard().catch(() => {
  clearSession();
  renderProfile();
});
