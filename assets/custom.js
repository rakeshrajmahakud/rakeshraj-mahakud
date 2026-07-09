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