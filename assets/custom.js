// Top bar drawer js (drawer open close functionality)
class TopBarSection extends HTMLElement{
  constructor(){
    super();

    this.toggle = this.querySelector(".top-bar__toggle");
    this.close = this.querySelector(".top-bar__close");
    this.drawer = this.querySelector(".top-bar__drawer");
  }

  connectedCallback(){
    if(!this.toggle || !this.drawer) return;

    this.toggle.addEventListener("click",()=> this.openDrawer());
    this.close?.addEventListener("click",()=> this.closeDrawer());

    this.drawer.addEventListener("transitionend",()=>{
      if(this.classList.contains("is-open")){
        this.drawer.style.height = "auto"; // make drawer height to its default
      }
    })
  }

  // drawer open
  openDrawer(){
    this.classList.add("is-open");
    this.drawer.style.height = "0px";

    //this to prevent html for animation effect
    requestAnimationFrame(()=>{
      this.drawer.style.height = this.drawer.scrollHeight + "px";
    })

  }
  // drawer close
  closeDrawer(){
    this.drawer.style.height = this.drawer.scrollHeight + "px";

    requestAnimationFrame(()=>{
      this.drawer.style.height = "0px";
    })
     this.classList.remove("is-open");
  }
}
customElements.define("top-bar-section",TopBarSection);


// ========. shop the look, card and product functionality ===========
class ShopLookCard extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.productData = JSON.parse(this.querySelector('.shop-look-product-data').textContent);
    this.currentVariant = this.productData.selected_or_first_available_variant;

    this.openPopupEvent();
    this.closePopupEvent();
    this.colorPickerEvent();
    this.dropdownEvent();
    this.addToCartEvent();

    // initial select of selected variant id 
    this.updateVariant();
    console.log("curr variant ", this.currentVariant)
  }

  /* =======Event Bindings======= */

  openPopupEvent() {
    const hotspot = this.querySelector('.shop-look-hotspot');
    hotspot?.addEventListener('click',this.openPopup.bind(this));
  }

  closePopupEvent() {
    const closeButton = this.querySelector('.shop-look-popup__close');
    closeButton?.addEventListener('click',this.closePopup.bind(this));
  }

  colorPickerEvent() {
    const colors = this.querySelectorAll('.shop-look-popup__color');

    colors.forEach(color => {
      color.addEventListener('click', () => {
        colors.forEach(item => {
          item.classList.remove('active');
        });

        color.classList.add('active');
        this.moveColorSlider(color);
        this.updateVariant();
      });
    });
  }

  dropdownEvent() {

    const dropdowns = this.querySelectorAll('.shop-look-popup__dropdown');

    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.shop-look-popup__dropdown-trigger');
      const value = dropdown.querySelector('.shop-look-popup__dropdown-value');
      const items = dropdown.querySelectorAll('.shop-look-popup__dropdown-item');

      trigger?.addEventListener('click', () => {
        dropdown.classList.toggle('is-open');
      });

      items.forEach(item => {
        item.addEventListener('click', () => {
          items.forEach(option => option.classList.remove('active'));
          item.classList.add('active');
          value.textContent = item.dataset.value;
          dropdown.classList.remove('is-open');
          this.updateVariant();
        });
      });
    });
  }

  addToCartEvent() {
    const button = this.querySelector('.shop-look-popup__add-to-cart');
    button?.addEventListener(
      'click',
      this.addToCart.bind(this)
    );
  } 

  /* ===== Product card popup open======== */

  openPopup() {
    this.classList.add('active');

    // stop html body scroll when opup is active 
    document.body.classList.add('overflow-hidden');

    const activeColor = this.querySelector('.shop-look-popup__color.active');
    if (activeColor) {
      requestAnimationFrame(() => {
        this.moveColorSlider(activeColor);
      });
    }

  }

  closePopup() {
    this.classList.remove('active');
    // remove the overflow from body 
    if (document.body.classList.contains('overflow-hidden')){
      document.body.classList.remove('overflow-hidden');
    }
  }

  /* ======Color Slider========== */

  moveColorSlider(activeColor) {
    const slider = this.querySelector('.shop-look-popup__color-pill');

    if (!slider) return;

    slider.style.width = `${activeColor.offsetWidth-6}px`;
    slider.style.transform = `translateX(${activeColor.offsetLeft+6}px)`;
  }

  /* =====Product======== */
  updateVariant() {
    const selectedOptions = [];

    /* Color Options */

    this.querySelectorAll('.shop-look-popup__color-list').forEach(colorList => {

      const position = Number(colorList.dataset.optionPosition);
      const activeColor = colorList.querySelector('.shop-look-popup__color.active');

      if (activeColor) {
        selectedOptions[position - 1] = activeColor.dataset.value;
      }
    });

    /* Dropdown Options */

    this.querySelectorAll('.shop-look-popup__dropdown').forEach(dropdown => {

        const position = Number(dropdown.dataset.optionPosition);

        const value = dropdown
          .querySelector('.shop-look-popup__dropdown-value')
          .textContent
          .trim();
        selectedOptions[position - 1] = value;

    });

    /* Find Variant */
    const variant = this.productData.variants.find(variant => {
      return selectedOptions.every((option, index) => {
        return variant[`option${index + 1}`] === option;
      });
    });

    if (!variant) return;

    this.currentVariant = variant;
   // console.log("Current Variant", this.currentVariant);

  }
  //===== add to cart functionality with add on product======
  addToCart(event) {
    event.preventDefault();

    const cartDrawer = document.querySelector("cart-drawer");

    const items = [
      {
        id: this.currentVariant.id,
        quantity: 1,
      },
    ];

    /* ==== Addon Product (if current product variant is  black and M then add addon product with it) === */
    const addonVariantId = this.querySelector(".shop-look-addon-product")?.value;
    const requiredOptions = ["Black", "M"];

    const isMatch = requiredOptions.every(required =>
      this.currentVariant.options.some(
        option => option.toLowerCase() === required.toLowerCase()
      )
    );

    if (addonVariantId && isMatch) {
      items.push({
        id: Number(addonVariantId),
        quantity: 1,
      });
    }

    // Request body
    const body = {
      items,
    };

    // Drawer hai to hi sections bhejo
    if (cartDrawer) {
      body.sections = cartDrawer.getSectionsToRender().map((section) => section.id);
      body.sections_url = window.location.pathname;
    }

    // Add to cart ajax call
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    .then((response) => response.json())
    .then((response) => {
      if (cartDrawer) {
        cartDrawer.classList.remove("is-empty");
        cartDrawer.renderContents(response);
      } else {
        window.location.href = "/cart";
      }
    })
    .catch(console.error);
  }
}
customElements.define('shop-look-card', ShopLookCard);