$(function () {
  if (window.location.pathname.includes('user'))
    changeSidebar('.my-accounts', '.my-accounts-worker')

  $('.select2').select2({
    theme: "bootstrap4",
    language: 'en',
    placeholder: 'Buscar..'
  })
})