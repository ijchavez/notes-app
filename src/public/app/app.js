import {
  createApp,
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from "https://unpkg.com/vue@3.5.13/dist/vue.esm-browser.prod.js";

const TOKEN_KEY = "notes_app_token";
const USER_KEY = "notes_app_user";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROUTES = [
  { name: "home", pattern: /^\/$/ },
  { name: "about", pattern: /^\/about\/?$/ },
  { name: "signin", pattern: /^\/signin\/?$/ },
  { name: "signup", pattern: /^\/signup\/?$/ },
  { name: "notes", pattern: /^\/notes\/?$/ },
  { name: "notes", pattern: /^\/notes\/all\/?$/ },
  { name: "notes-new", pattern: /^\/notes\/new\/?$/ },
  { name: "notes-edit", pattern: /^\/notes\/edit\/([^/]+)\/?$/ },
];

const PROTECTED_ROUTES = new Set(["notes", "notes-new", "notes-edit"]);

function normalizePath(path) {
  if (!path) {
    return "/";
  }

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

function parseRoute(pathname) {
  const normalized = normalizePath(pathname || "/");

  for (const route of ROUTES) {
    const match = normalized.match(route.pattern);
    if (match) {
      return {
        name: route.name,
        params: {
          id: match[1] || "",
        },
      };
    }
  }

  return {
    name: "notfound",
    params: {
      id: "",
    },
  };
}

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function extractErrorMessage(payload) {
  if (!payload) {
    return "Unexpected error.";
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors
      .map((item) => item?.text || item?.message || String(item))
      .join(" ");
  }

  return "Unexpected error.";
}

function isValidEmail(value) {
  return EMAIL_REGEX.test((value || "").trim());
}

async function apiRequest(path, options = {}, token = "") {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  let payload = null;
  if (response.status !== 204) {
    const isJson = (response.headers.get("content-type") || "").includes(
      "application/json"
    );
    payload = isJson ? await response.json().catch(() => null) : await response.text();
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

createApp({
  setup() {
    const route = reactive(parseRoute(window.location.pathname));
    const authToken = ref(localStorage.getItem(TOKEN_KEY) || "");
    const currentUser = ref(loadStoredUser());

    const loading = ref(false);
    const notesLoading = ref(false);

    const flash = reactive({
      type: "info",
      text: "",
    });

    const signinForm = reactive({
      email: "",
      password: "",
    });

    const signupForm = reactive({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const noteForm = reactive({
      id: "",
      title: "",
      description: "",
    });

    const notes = ref([]);
    const searchTerm = ref("");

    let flashTimer = null;

    const isAuthenticated = computed(() => Boolean(authToken.value));

    const filteredNotes = computed(() => {
      const term = searchTerm.value.trim().toLowerCase();
      if (!term) {
        return notes.value;
      }

      return notes.value.filter((note) => {
        const title = (note.title || "").toLowerCase();
        const description = (note.description || "").toLowerCase();
        return title.includes(term) || description.includes(term);
      });
    });

    function setFlash(type, text) {
      flash.type = type;
      flash.text = text;

      if (flashTimer) {
        clearTimeout(flashTimer);
      }

      flashTimer = setTimeout(() => {
        flash.text = "";
      }, 4000);
    }

    function resetFlash() {
      flash.text = "";
      if (flashTimer) {
        clearTimeout(flashTimer);
        flashTimer = null;
      }
    }

    function syncRoute(pathname = window.location.pathname) {
      Object.assign(route, parseRoute(pathname));
    }

    function navigate(path) {
      const target = normalizePath(path);
      if (window.location.pathname !== target) {
        window.history.pushState({}, "", target);
      }
      syncRoute(target);
    }

    function persistAuth(token, user) {
      authToken.value = token;
      currentUser.value = user || null;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    }

    function clearAuth() {
      authToken.value = "";
      currentUser.value = null;
      notes.value = [];
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    function resetSigninForm() {
      signinForm.email = "";
      signinForm.password = "";
    }

    function resetSignupForm() {
      signupForm.name = "";
      signupForm.email = "";
      signupForm.password = "";
      signupForm.confirmPassword = "";
    }

    function resetNoteForm() {
      noteForm.id = "";
      noteForm.title = "";
      noteForm.description = "";
    }

    function handleExpiredSession() {
      clearAuth();
      setFlash("error", "Session expired. Sign in again.");
      navigate("/signin");
    }

    async function loadNotes() {
      if (!authToken.value) {
        return;
      }

      notesLoading.value = true;
      try {
        const response = await apiRequest("/api/notes/all", {}, authToken.value);
        notes.value = Array.isArray(response?.notes) ? response.notes : [];
      } catch (error) {
        if (error.status === 404) {
          notes.value = [];
          return;
        }

        if (error.status === 401 || error.status === 403) {
          handleExpiredSession();
          return;
        }

        setFlash("error", error.message);
      } finally {
        notesLoading.value = false;
      }
    }

    async function loadNoteById(id) {
      if (!authToken.value || !id) {
        return;
      }

      loading.value = true;
      try {
        const note = await apiRequest(`/api/notes/${id}`, {}, authToken.value);
        noteForm.id = note._id;
        noteForm.title = note.title || "";
        noteForm.description = note.description || "";
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleExpiredSession();
          return;
        }
        setFlash("error", error.message);
        navigate("/notes");
      } finally {
        loading.value = false;
      }
    }

    async function handleSignin() {
      const validationMessage = validateSigninForm();
      if (validationMessage) {
        setFlash("error", validationMessage);
        return;
      }

      loading.value = true;
      resetFlash();

      try {
        const response = await apiRequest("/api/auth/signin", {
          method: "POST",
          body: JSON.stringify({
            email: signinForm.email,
            password: signinForm.password,
          }),
        });

        persistAuth(response.token, response.user);
        resetSigninForm();
        setFlash("success", "Welcome back.");
        navigate("/notes");
        await loadNotes();
      } catch (error) {
        setFlash("error", error.message);
      } finally {
        loading.value = false;
      }
    }

    function validateSigninForm() {
      if (!signinForm.email || !signinForm.password) {
        return "Email and password are required.";
      }

      if (!isValidEmail(signinForm.email)) {
        return "Please enter a valid email.";
      }

      return "";
    }

    function validateSignupForm() {
      if (!signupForm.name || !signupForm.email) {
        return "Name and email are required.";
      }

      if (!isValidEmail(signupForm.email)) {
        return "Please enter a valid email.";
      }

      if (!signupForm.password || !signupForm.confirmPassword) {
        return "Password and confirmation are required.";
      }

      if (signupForm.password !== signupForm.confirmPassword) {
        return "Passwords do not match.";
      }

      if (signupForm.password.length < 4) {
        return "Password must be at least 4 characters.";
      }

      return "";
    }

    async function handleSignup() {
      const validationMessage = validateSignupForm();
      if (validationMessage) {
        setFlash("error", validationMessage);
        return;
      }

      loading.value = true;
      resetFlash();

      try {
        const response = await apiRequest("/api/users/register", {
          method: "POST",
          body: JSON.stringify({
            name: signupForm.name,
            email: signupForm.email,
            password: signupForm.password,
            confirm_password: signupForm.confirmPassword,
          }),
        });

        persistAuth(response.token, {
          name: signupForm.name,
          email: signupForm.email,
        });

        resetSignupForm();
        setFlash("success", "Account created.");
        navigate("/notes");
        await loadNotes();
      } catch (error) {
        setFlash("error", error.message);
      } finally {
        loading.value = false;
      }
    }

    function handleLogout() {
      clearAuth();
      setFlash("success", "Session closed.");
      navigate("/signin");
    }

    function validateNoteForm() {
      if (!noteForm.title || noteForm.title.trim().length === 0) {
        return "Title is required.";
      }

      if (noteForm.title.length > 20) {
        return "Title must be less than 20 characters.";
      }

      if (!noteForm.description || noteForm.description.trim().length === 0) {
        return "Description is required.";
      }

      if (noteForm.description.length > 200) {
        return "Description must be less than 200 characters.";
      }

      return "";
    }

    async function submitNote() {
      const validationMessage = validateNoteForm();
      if (validationMessage) {
        setFlash("error", validationMessage);
        return;
      }

      loading.value = true;
      resetFlash();

      try {
        if (route.name === "notes-edit" && noteForm.id) {
          await apiRequest(
            `/api/notes/edit/${noteForm.id}`,
            {
              method: "PUT",
              body: JSON.stringify({
                title: noteForm.title,
                description: noteForm.description,
              }),
            },
            authToken.value
          );
          setFlash("success", "Note updated.");
        } else {
          await apiRequest(
            "/api/notes/new-note",
            {
              method: "POST",
              body: JSON.stringify({
                title: noteForm.title,
                description: noteForm.description,
              }),
            },
            authToken.value
          );
          setFlash("success", "Note created.");
        }

        resetNoteForm();
        navigate("/notes");
        await loadNotes();
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleExpiredSession();
          return;
        }

        setFlash("error", error.message);
      } finally {
        loading.value = false;
      }
    }

    async function deleteNote(id) {
      if (!id) {
        return;
      }

      const accepted = window.confirm("Delete this note?");
      if (!accepted) {
        return;
      }

      loading.value = true;
      resetFlash();

      try {
        await apiRequest(
          `/api/notes/delete/${id}`,
          { method: "DELETE" },
          authToken.value
        );

        notes.value = notes.value.filter((note) => note._id !== id);
        setFlash("success", "Note deleted.");
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          handleExpiredSession();
          return;
        }
        setFlash("error", error.message);
      } finally {
        loading.value = false;
      }
    }

    function goToNoteEditor(noteId = "") {
      if (noteId) {
        navigate(`/notes/edit/${noteId}`);
        return;
      }

      resetNoteForm();
      navigate("/notes/new");
    }

    function handleRouteState() {
      if (PROTECTED_ROUTES.has(route.name) && !authToken.value) {
        navigate("/signin");
        return;
      }

      if ((route.name === "signin" || route.name === "signup") && authToken.value) {
        navigate("/notes");
        return;
      }

      if (route.name === "notes") {
        loadNotes();
      }

      if (route.name === "notes-new") {
        resetNoteForm();
      }

      if (route.name === "notes-edit") {
        loadNoteById(route.params.id);
      }
    }

    watch(
      () => route.name,
      () => {
        handleRouteState();
      },
      { immediate: true }
    );

    watch(
      () => route.params.id,
      (noteId) => {
        if (route.name === "notes-edit") {
          loadNoteById(noteId);
        }
      }
    );

    onMounted(() => {
      window.addEventListener("popstate", () => syncRoute(window.location.pathname));
    });

    return {
      route,
      loading,
      notesLoading,
      flash,
      signinForm,
      signupForm,
      noteForm,
      notes,
      searchTerm,
      filteredNotes,
      isAuthenticated,
      currentUser,
      navigate,
      handleSignin,
      handleSignup,
      handleLogout,
      submitNote,
      deleteNote,
      goToNoteEditor,
    };
  },
  template: `
    <div class="shell">
      <div class="ambient ambient-one"></div>
      <div class="ambient ambient-two"></div>

      <header class="topbar">
        <button class="brand" @click="navigate('/')">
          <img class="brand-logo" src="/images/atlasapp.png" alt="Atlas App" />
        </button>

        <nav class="menu" aria-label="Main navigation">
          <button :class="{ active: route.name === 'home' }" @click="navigate('/')">Home</button>
          <button :class="{ active: route.name === 'about' }" @click="navigate('/about')">About</button>

          <template v-if="isAuthenticated">
            <button :class="{ active: route.name === 'notes' }" @click="navigate('/notes')">My Notes</button>
            <button class="menu-logout" @click="handleLogout">Logout</button>
          </template>

          <template v-else>
            <button :class="{ active: route.name === 'signin' }" @click="navigate('/signin')">Sign in</button>
            <button :class="{ active: route.name === 'signup' }" @click="navigate('/signup')">Sign up</button>
          </template>
        </nav>
      </header>

      <p v-if="flash.text" :class="['flash', flash.type]">{{ flash.text }}</p>

      <main class="content" role="main">
        <section v-if="route.name === 'home'" class="panel hero">
          <div>
            <p class="eyebrow">NODE + EXPRESS + VUE</p>
            <h1>Notas simples con una interfaz actual y limpia.</h1>
            <p class="lead">
              Esta version elimina Handlebars y usa una SPA en Vue 3 consumiendo la API existente.
            </p>
            <div class="hero-actions">
              <button class="button primary" @click="navigate(isAuthenticated ? '/notes' : '/signin')">
                {{ isAuthenticated ? 'Open notes' : 'Start now' }}
              </button>
              <button class="button ghost" @click="navigate('/about')">See details</button>
            </div>
          </div>
          <aside class="hero-card">
            <h2>Flow</h2>
            <ol>
              <li>Create account</li>
              <li>Save ideas</li>
              <li>Edit and organize</li>
            </ol>
            <p>Design focused on speed and readability.</p>
          </aside>
        </section>

        <section v-else-if="route.name === 'about'" class="panel about">
          <h1>About this rebuild</h1>
          <p>
            The backend keeps MongoDB, Passport and existing API contracts.
            The UI now runs as a client-side app with Vue 3 and a new design system.
          </p>
          <p>
            Main improvements: client routing, JWT auth for API calls,
            responsive layout and cleaner note management flow.
          </p>
          <button class="button ghost" @click="navigate(isAuthenticated ? '/notes' : '/signin')">
            Go to app
          </button>
        </section>

        <section v-else-if="route.name === 'signin'" class="panel auth-panel">
          <h1>Welcome back</h1>
          <p>Sign in to manage your notes.</p>
          <form class="stack" @submit.prevent="handleSignin" novalidate>
            <label>
              Email
              <input type="email" v-model.trim="signinForm.email" autocomplete="email" />
            </label>
            <label>
              Password
              <input type="password" v-model="signinForm.password" autocomplete="current-password" />
            </label>
            <button class="button primary" type="submit" :disabled="loading">
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </section>

        <section v-else-if="route.name === 'signup'" class="panel auth-panel">
          <h1>Create account</h1>
          <p>Open your workspace in less than a minute.</p>
          <form class="stack" @submit.prevent="handleSignup" novalidate>
            <label>
              Name
              <input type="text" v-model.trim="signupForm.name" autocomplete="name" />
            </label>
            <label>
              Email
              <input type="email" v-model.trim="signupForm.email" autocomplete="email" />
            </label>
            <label>
              Password
              <input type="password" v-model="signupForm.password" autocomplete="new-password" />
            </label>
            <label>
              Confirm password
              <input type="password" v-model="signupForm.confirmPassword" autocomplete="new-password" />
            </label>
            <button class="button primary" type="submit" :disabled="loading">
              {{ loading ? 'Creating...' : 'Create account' }}
            </button>
          </form>
        </section>

        <section v-else-if="route.name === 'notes'" class="panel notes-panel">
          <div class="notes-head">
            <div>
              <h1>My notes</h1>
              <p>Hi {{ currentUser?.name || currentUser?.email || 'there' }}, keep your ideas in one place.</p>
            </div>
            <button class="button primary" @click="goToNoteEditor()">New note</button>
          </div>

          <label class="search-box">
            Search
            <input
              type="search"
              placeholder="Filter by title or description"
              v-model.trim="searchTerm"
            />
          </label>

          <div v-if="notesLoading" class="empty-state">Loading notes...</div>
          <div v-else-if="filteredNotes.length === 0" class="empty-state">
            You do not have notes yet. Create your first one.
          </div>

          <div v-else class="notes-grid">
            <article class="note-card" v-for="note in filteredNotes" :key="note._id">
              <h2>{{ note.title }}</h2>
              <p>{{ note.description }}</p>
              <div class="note-actions">
                <button class="button ghost" @click="goToNoteEditor(note._id)">Edit</button>
                <button class="button danger" @click="deleteNote(note._id)">Delete</button>
              </div>
            </article>
          </div>
        </section>

        <section
          v-else-if="route.name === 'notes-new' || route.name === 'notes-edit'"
          class="panel editor-panel"
        >
          <h1>{{ route.name === 'notes-edit' ? 'Edit note' : 'Create note' }}</h1>
          <p>Title max 20 chars, description max 200 chars.</p>

          <form class="stack" @submit.prevent="submitNote" novalidate>
            <label>
              Title
              <input
                type="text"
                maxlength="20"
                v-model.trim="noteForm.title"
              />
            </label>
            <label>
              Description
              <textarea
                maxlength="200"
                rows="6"
                v-model.trim="noteForm.description"
              ></textarea>
            </label>
            <div class="editor-actions">
              <button class="button ghost" type="button" @click="navigate('/notes')">Cancel</button>
              <button class="button primary" type="submit" :disabled="loading">
                {{ loading ? 'Saving...' : route.name === 'notes-edit' ? 'Save changes' : 'Save note' }}
              </button>
            </div>
          </form>
        </section>

        <section v-else class="panel not-found">
          <h1>Page not found</h1>
          <p>The route does not exist in this app.</p>
          <button class="button primary" @click="navigate('/')">Back to home</button>
        </section>
      </main>

      <footer class="app-footer">
        <div class="contact-links">
          <a
            href="https://github.com/ijchavez/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="github"
            class="contact-link"
          >
            <svg fill="none" viewBox="0 0 24 24" width="30">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M21 5.958c.009.607-.067 1.368-.134 1.923a4.163 4.163 0 0 1-.1.544C21.622 10.01 22 11.917 22 14c0 2.468-1.187 4.501-3.036 5.887C17.132 21.26 14.66 22 12 22c-2.66 0-5.132-.74-6.964-2.113C3.187 18.501 2 16.468 2 14c0-2.083.377-3.99 1.235-5.575a4.166 4.166 0 0 1-.1-.544C3.066 7.326 2.99 6.565 3 5.958c.01-.683.1-1.366.199-2.044.046-.314.118-.609.459-.795.348-.19.714-.12 1.075-.017 1.218.345 2.36.83 3.434 1.41C9.3 4.173 10.578 4 12 4c1.422 0 2.7.173 3.832.513a16.802 16.802 0 0 1 3.434-1.41c.361-.103.728-.174 1.075.016.34.186.413.481.46.795.098.678.188 1.361.198 2.044ZM20 14c0-1.687-.388-4-2.5-4-.952 0-1.853.25-2.753.5-.899.25-1.797.5-2.747.5s-1.848-.25-2.747-.5c-.9-.25-1.8-.5-2.753-.5C4.394 10 4 12.32 4 14c0 1.764.827 3.231 2.236 4.287C7.66 19.356 9.69 20 12 20s4.339-.645 5.764-1.713C19.173 17.23 20 15.764 20 14Zm-10 .5c0 1.38-.672 2.5-1.5 2.5S7 15.88 7 14.5 7.672 12 8.5 12s1.5 1.12 1.5 2.5Zm5.5 2.5c.828 0 1.5-1.12 1.5-2.5s-.672-2.5-1.5-2.5-1.5 1.12-1.5 2.5.672 2.5 1.5 2.5Z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
          <a
            href="https://gitlab.com/ijchavez/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="gitlab"
            class="contact-link"
          >
            <svg viewBox="0 -1 26 26" width="30">
              <path
                d="M12.906 24 .403 14.723a1.073 1.073 0 0 1-.351-.497l-.002-.008a.926.926 0 0 1 .002-.609l-.002.007 1.463-4.437zM5.293.354l2.874 8.823H1.512L4.335.354a.517.517 0 0 1 .49-.353h.015-.001L4.865 0c.212 0 .388.151.427.351v.003zm2.874 8.823h9.479L12.907 24zm17.595 4.436a.926.926 0 0 1-.002.609l.002-.007a1.074 1.074 0 0 1-.351.503l-.002.002L12.906 24 24.3 9.177zM21.477.354 24.3 9.177h-6.655L20.519.354a.436.436 0 0 1 .455-.353h-.001.014c.227 0 .419.146.489.349l.001.004z"
              ></path>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/gerardo--chavez/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="linkedin"
            class="contact-link"
          >
            <svg viewBox="0 0 20 20" width="30">
              <path
                fill="#000"
                fill-rule="evenodd"
                d="M20 20h-4v-6.999c0-1.92-.847-2.991-2.366-2.991-1.653 0-2.634 1.116-2.634 2.991V20H7V7h4v1.462s1.255-2.202 4.083-2.202C17.912 6.26 20 7.986 20 11.558V20ZM2.442 4.921A2.451 2.451 0 0 1 0 2.46 2.451 2.451 0 0 1 2.442 0a2.451 2.451 0 0 1 2.441 2.46 2.45 2.45 0 0 1-2.441 2.461ZM0 20h5V7H0v13Z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@unTesterMas"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="youtube"
            class="contact-link"
          >
            <svg fill="none" viewBox="0 0 24 24" width="30">
              <path
                fill="#0F0F0F"
                fill-rule="evenodd"
                d="M9.496 7.132A1 1 0 0 0 8 8v8a1 1 0 0 0 1.496.868l7-4a1 1 0 0 0 0-1.736l-7-4ZM13.984 12 10 14.277V9.723L13.984 12Z"
                clip-rule="evenodd"
              ></path>
              <path
                fill="#0F0F0F"
                fill-rule="evenodd"
                d="M0 12c0-3.75 0-5.625.955-6.939A5 5 0 0 1 2.06 3.955C3.375 3 5.251 3 9 3h6c3.75 0 5.625 0 6.939.955a5 5 0 0 1 1.106 1.106C24 6.375 24 8.251 24 12c0 3.75 0 5.625-.955 6.939a5 5 0 0 1-1.106 1.106C20.625 21 18.749 21 15 21H9c-3.75 0-5.625 0-6.939-.955A5 5 0 0 1 .955 18.94C0 17.625 0 15.749 0 12Zm9-7h6c1.92 0 3.198.003 4.167.108.932.1 1.337.276 1.596.465.255.185.479.409.664.664.189.26.364.664.465 1.596.105.969.108 2.248.108 4.167 0 1.92-.003 3.198-.108 4.167-.1.932-.276 1.337-.465 1.596-.185.255-.409.479-.664.664-.259.189-.664.364-1.596.465-.969.105-2.248.108-4.167.108H9c-1.92 0-3.198-.003-4.167-.108-.932-.1-1.337-.276-1.596-.465a3.003 3.003 0 0 1-.664-.664c-.189-.259-.364-.664-.465-1.596C2.003 15.198 2 13.92 2 12c0-1.92.003-3.198.108-4.167.1-.932.276-1.337.465-1.596a3 3 0 0 1 .664-.664c.259-.189.664-.364 1.596-.465C5.802 5.003 7.08 5 9 5Z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
        </div>

        <small class="rss-link">
          <a href="/dist/rss.xml" target="_blank" rel="noopener noreferrer">
            Subscribe to RSS
            <svg viewBox="0 0 24 24" width="20" height="20">
              <g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <circle cx="5" cy="19" r="1"></circle>
                <path d="M4 4a16 16 0 0 1 16 16M4 11a9 9 0 0 1 9 9"></path>
              </g>
            </svg>
          </a>
        </small>
      </footer>
    </div>
  `,
}).mount("#app");
