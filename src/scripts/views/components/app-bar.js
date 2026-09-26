import authRepository from "../../data/auth-repository.js";

class AppBar extends HTMLElement {
  constructor() {
    super();

    this._isAuthenticated = authRepository.isAuthenticated();

    this._handleAuthChange = this._handleAuthChange.bind(this);
    this._handleLogout = this._handleLogout.bind(this);
    this._handleMenuToggle = this._handleMenuToggle.bind(this);
  }

  connectedCallback() {
    this.render();

    window.addEventListener("user-logged-in", this._handleAuthChange);
    window.addEventListener("user-logged-out", this._handleAuthChange);

    this._attachEventListeners();
  }

  disconnectedCallback() {
    window.removeEventListener("user-logged-in", this._handleAuthChange);
    window.removeEventListener("user-logged-out", this._handleAuthChange);

    const menuToggle = this.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.removeEventListener("click", this._handleMenuToggle);
    }

    const logoutButton = this.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.removeEventListener("click", this._handleLogout);
    }
  }

  render() {
    const userData = authRepository.getUserData() || {};

    this.innerHTML = `
      <nav class="app-nav">
        <div class="app-nav__brand">
          <a href="#/" class="app-nav__title">Dicoding Story</a>
        </div>
        
        <button class="menu-toggle" aria-label="Toggle menu">
          <i class="fas fa-bars"></i>
        </button>
        
        <ul class="app-nav__list ${
          this._isAuthenticated ? "" : "app-nav__list--guest"
        }">
          <li class="app-nav__item">
            <a href="#/" class="app-nav__link">
              <span>List Story</span>
            </a>
          </li>
          
          ${
            this._isAuthenticated
              ? `
                <li class="app-nav__item">
                  <a href="#/add" class="app-nav__link">
                    <span>Add Story</span>
                  </a>
                </li>
                <li class="app-nav__item app-nav__item--user">
                  <span class="app-nav__user">
                    <span>${userData.name || "User"}</span>
                  </span>
                </li>
                <li class="app-nav__item">
                                  <button id="logoutButton" class="app-nav__button">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                   </li>
              `
              : `
                <li class="app-nav__item">
                  <a href="#/login" class="app-nav__link">
                    <span>Login</span>
                  </a>
                </li>
                <li class="app-nav__item">
                  <a href="#/register" class="app-nav__link app-nav__link--register">
            
                    <span>Register</span>
                  </a>
                </li>
              `
          }
        </ul>
      </nav>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const logoutButton = this.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", this._handleLogout);
    }

    const menuToggle = this.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", this._handleMenuToggle);
    }
  }

  _handleAuthChange() {
    this._isAuthenticated = authRepository.isAuthenticated();
    this.render();
  }

  _handleLogout(event) {
    event.preventDefault();
    authRepository.logout();
    window.location.hash = "#/";
  }

  _handleMenuToggle() {
    const navList = this.querySelector(".app-nav__list");
    navList.classList.toggle("app-nav__list--open");
  }
}

customElements.define("app-bar", AppBar);

export default AppBar;
