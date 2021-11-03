$(function () {
  if (window.location.pathname.includes('user'))
    changeSidebar('.my-accounts', '.my-accounts-worker')

  $('.select2').select2({
    theme: "bootstrap4",
    language: 'en',
    placeholder: 'Find..'
  })

  $('#id_image').fileselect({
    browseBtnClass: 'btn btn-danger',
    translations: {
      'es': {'chooseFile': 'Choose a image...',}
    },
  })
  $('#id_picture').fileselect({
    browseBtnClass: 'btn btn-danger',
    translations: {
      'es': {'chooseFile': 'Choose a background image...',}
    },
  })
  document.querySelectorAll('a').forEach(e => {
    let text = e.innerText
    if (text.includes('pictures') || text.includes('users')) {
      e.innerHTML = `<img src="${e.href}" class="img-user" width="25" height="25" alt="">`
      e.href = '#!'
    }
  })
})