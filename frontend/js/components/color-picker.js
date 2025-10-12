// Color Picker Dialog Web Component

class ColorPicker extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.selectedColor = null;
    this.callback = null;

    // 32-color palette
    this.colors = [
      // Row 1 - Light shades
      '#a8dadc', '#b4e7ce', '#f4f1bb', '#ffd6a5', '#ffadad', '#dab6fc', '#d4a574', '#c0c0c0',
      // Row 2 - Medium shades
      '#457b9d', '#2a9d8f', '#e9c46a', '#f4a261', '#e63946', '#ba8bff', '#8b5a3c', '#808080',
      // Row 3 - Rich colors
      '#1d3557', '#2c6e49', '#ffb703', '#fb8500', '#d62828', '#9d4edd', '#6b4423', '#404040',
      // Row 4 - Dark shades
      '#0d1b2a', '#1b4332', '#ca6702', '#dc2f02', '#9d0208', '#7209b7', '#3e2723', '#000000'
    ];
  }

  connectedCallback() {
    this.render();
  }

  open(initialColor, callback) {
    this.selectedColor = initialColor || this.colors[0];
    this.callback = callback;
    this.isOpen = true;
    this.render();
  }

  close() {
    this.isOpen = false;
    this.render();
  }

  render() {
    this.innerHTML = `
      <style>
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: ${this.isOpen ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog-content {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .dialog-header {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .color-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .color-swatch:hover {
          transform: scale(1.1);
        }

        .color-swatch.selected {
          border-color: #3584e4;
          transform: scale(1.15);
        }

        .dialog-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .btn-primary {
          background: #3584e4;
          color: white;
        }

        .btn-primary:hover {
          background: #1c71d8;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #2e3436;
        }

        .btn-secondary:hover {
          background: #ebebeb;
        }
      </style>

      <div class="dialog-overlay" id="overlay">
        <div class="dialog-content">
          <div class="dialog-header">Choose Notebook Color</div>
          
          <div class="color-grid">
            ${this.colors.map(color => `
              <div 
                class="color-swatch ${color === this.selectedColor ? 'selected' : ''}" 
                style="background-color: ${color}"
                data-color="${color}"></div>
            `).join('')}
          </div>

          <div class="dialog-actions">
            <button class="btn btn-secondary" id="cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="confirm-btn">Select</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Close on overlay click
    this.querySelector('#overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'overlay') {
        this.close();
      }
    });

    // Cancel button
    this.querySelector('#cancel-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Confirm button
    this.querySelector('#confirm-btn')?.addEventListener('click', () => {
      if (this.callback && this.selectedColor) {
        this.callback(this.selectedColor);
      }
      this.close();
    });

    // Color swatches
    this.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        this.selectedColor = swatch.dataset.color;
        this.render();
      });
    });
  }
}

customElements.define('color-picker', ColorPicker);

