// Auth Form Web Component

class AuthForm extends HTMLElement {
  constructor() {
    super();
    this.isLogin = true;
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.innerHTML = `
      <style>
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn-primary {
 	   padding: 0.75rem;
  	   border: none;
  	   border-radius: 8px;
  	   background: #18b582;  /* VERDE! */
  	   color: white;
  	   font-weight: 500;
   	   cursor: pointer;
    	   transition: background 0.2s;
	}

	.btn-primary:hover {
  	   background: #149966;  /* VERDE SCURO! */
	}

        .btn-primary:hover {
          background: #1c71d8;
        }

        .toggle-mode {
          text-align: center;
          font-size: 0.9rem;
          color: #555753;
        }

        .toggle-mode button {
          background: none;
          border: none;
          color: #3584e4;
          cursor: pointer;
          text-decoration: underline;
          font-size: 0.9rem;
        }

        .error-message {
          color: #c01c28;
          font-size: 0.9rem;
          padding: 0.5rem;
          background: #f6d32d20;
          border-radius: 4px;
          display: none;
        }

        .error-message.show {
          display: block;
        }
      </style>

      <form class="auth-form" id="auth-form">
        <div class="error-message" id="error-message"></div>

        <div class="form-group ${this.isLogin ? 'hidden' : ''}">
          <label for="email">Email</label>
          <input type="email" id="email" ${this.isLogin ? '' : 'required'} autocomplete="email">
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" required autocomplete="username">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" required autocomplete="current-password">
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            ${this.isLogin ? 'Login' : 'Register'}
          </button>
          
          <div class="toggle-mode">
            ${this.isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
            <button type="button" id="toggle-btn">
              ${this.isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </div>
      </form>
    `;
  }

  attachEventListeners() {
    const form = this.querySelector('#auth-form');
    const toggleBtn = this.querySelector('#toggle-btn');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    toggleBtn.addEventListener('click', () => {
      this.isLogin = !this.isLogin;
      this.render();
      this.attachEventListeners();
    });
  }

  handleSubmit() {
    const username = this.querySelector('#username').value;
    const password = this.querySelector('#password').value;
    const email = this.querySelector('#email')?.value;

    const errorMsg = this.querySelector('#error-message');
    errorMsg.classList.remove('show');

    if (this.isLogin) {
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { username, password }
      }));
    } else {
      if (!email) {
        errorMsg.textContent = 'Email is required';
        errorMsg.classList.add('show');
        return;
      }

      window.dispatchEvent(new CustomEvent('auth:register', {
        detail: { email, username, password }
      }));
    }
  }
}

customElements.define('auth-form', AuthForm);

