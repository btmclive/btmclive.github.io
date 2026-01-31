// intercept form process
let forms = document.querySelectorAll(".input-form");
forms.forEach(form => {
  form.addEventListener("submit", function (event) {
    event.preventDefault();
  })
})