<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar nav -->
    <nav class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M9 2v5M5 7h8M6 11l3 3 3-3" />
          </svg>
        </div>
      </div>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link" :class="{ active: route.name === 'chat' }" title="Chat">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 4h14v10H11l-3 3V14H3V4z" />
          </svg>
        </RouterLink>

        <RouterLink to="/sessions" class="nav-link" :class="{ active: route.name === 'sessions' }" title="Sessions">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="14" height="14" rx="2" />
            <path d="M7 7h6M7 10h6M7 13h4" />
          </svg>
        </RouterLink>

        <RouterLink to="/settings" class="nav-link" :class="{ active: route.name === 'settings' }" title="Settings">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="10" r="2.5" />
            <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" />
          </svg>
        </RouterLink>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>

  <ToastContainer />
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Sidebar ── */
.sidebar {
  width: 56px;
  background: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 8px;
  flex-shrink: 0;
}

.sidebar-logo {
  margin-bottom: 16px;
}

.logo-mark {
  width: 32px;
  height: 32px;
  background: var(--amber);
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #fff;
}

.logo-mark svg {
  width: 16px;
  height: 16px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-link {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #6b6762;
  text-decoration: none;
  transition: all 0.15s;
}

.nav-link svg {
  width: 18px;
  height: 18px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--paper);
}

.nav-link.active {
  background: rgba(240, 169, 48, 0.15);
  color: var(--amber-light);
}

/* ── Main ── */
.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
