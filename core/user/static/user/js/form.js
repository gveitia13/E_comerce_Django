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
      'en': {'chooseFile': 'Choose a image...',}
    },
  })
  $('#id_picture').fileselect({
    browseBtnClass: 'btn btn-danger',
    translations: {
      'en': {'chooseFile': 'Choose a background image...',}
    },
  })
})