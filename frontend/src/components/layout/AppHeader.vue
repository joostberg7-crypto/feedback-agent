<script setup lang="ts">
</script>

<template>
  <header class="app-header">
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M9 2v5M5 7h8M6 11l3 3 3-3" />
        </svg>
      </div>
      <div class="logo-text-wrap">
        <span class="logo-name">FeedbackAgent</span>
        <span class="logo-sub">HBO-ICT Studio · HvA</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  border-bottom: 1.5px solid var(--border);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 34px;
  height: 34px;
  background: var(--ink);
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--amber-light);
}

.logo-mark svg {
  width: 18px;
  height: 18px;
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
}

.logo-name {
  font-weight: 800;
  font-size: 1.05rem;
}

.logo-sub {
  font-size: 0.7rem;
  color: var(--muted);
  font-weight: 400;
}
</style>