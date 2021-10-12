idToEdit = {id: -1}
idToDelete = {id: -1}
idInvoice = {id: -1}

$(function () {
  let theme = document.getElementById('theme'),
    sidebar = document.getElementById('sidebar'),
    header = document.getElementById('header'),
    myModal = $('#myModal')

  myModal.on('shown.bs.modal', () => $('input[name="name"]').focus())

  $('.close').on('click', () => $('.modal').modal('hide'))

  myModal.on('hidden.bs.modal', function () {
    document.querySelector('#myModalFormTitle').name = ''
    $('#myModalForm').trigger('reset')
  })

  $('[data-toggle="tooltip"]').tooltip()

  $('[data-toggle="popover"]').popover()

  document
    .querySelectorAll('a')
    .forEach(e => e.classList.remove('active', 'w3-blue-grey'))

  document
    .querySelector('a[data-widget="pushmenu"]')
    .addEventListener('click', () => {
      let icon_sm = document.querySelector('.icon-sm'),
        icon_lg = document.querySelector('.icon-lg')
      if ($(window).width() <= 974) return

      if (icon_sm.classList.contains('d-none')) {
        icon_sm.classList.remove('d-none')
        icon_lg.classList.add('d-none')
      } else {
        icon_sm.classList.add('d-none')
        icon_lg.classList.remove('d-none')
      }
    })
  /*  document.querySelector('.main-sidebar').addEventListener('mouseover', e => {
      let icon_sm = document.querySelector('.icon-sm'),
        icon_lg = document.querySelector('.icon-lg')
      if (icon_lg.classList.contains('d-none')) {
        icon_sm.classList.add('d-none')
        icon_lg.classList.remove('d-none')
      }
    })
    document.querySelector('.main-sidebar').addEventListener('mouseout', () => {
      let icon_sm = document.querySelector('.icon-sm'),
        icon_lg = document.querySelector('.icon-lg')
      icon_lg.classList.add('d-none')
      icon_sm.classList.remove('d-none')
    })*/

  //Event submit Modal Form
  $('#myModalForm').on('submit', function (e) {
    e.preventDefault()
    let parameters = new FormData(this)
    if (document.querySelector('#myModalFormTitle').name === 'action-add') {
      parameters.append('action', 'add')
    }
    if (document.querySelector('#myModalFormTitle').name === 'action-edit') {
      parameters.append('action', 'edit')
      parameters.append('id', `${idToEdit.id}`)
    }
    submit_with_ajax(window.location.pathname, parameters, function (data) {
      $('.modal').modal('hide')
      listar()
      if (document.querySelector('#myModalFormTitle').name === 'action-add')
        callbackCreate(data)
      if (document.querySelector('#myModalFormTitle').name === 'action-edit')
        callbackUpdate(data)
    })
  })
})

let changeSidebar = function (nav_treeview, nav_item) {
    let father = document.querySelector(nav_treeview),
      son = document.querySelector(nav_item)
    father.classList.add('active')
    father.parentElement.classList.add('menu-open')
    son.classList.add('bg-primary')
    son.parentElement.parentElement.style.display = 'block'
  },
  message_error = function (obj) {
    let html = ``
    if (typeof obj === 'object') {
      html = `<ul style="text-align: left;">`
      $.each(obj, function (key, value) {
        html += `<li>${key}: ${value}</li>`
      })
      html += `</ul>`
    } else html = `<p>${obj}</p>`
    Swal.fire({
      title: `Error`,
      html: html,
      icon: `error`
    })
  },
  //For Delete using jQuery confirm plugin and Jquery with ajax
  submit_with_ajax_alert = function (url, title, content, parameters, callback, icon) {
    $.confirm({
      theme: 'material',
      title: title,
      icon: icon,
      content: content,
      columnClass: 'small',
      typeAnimated: true,
      cancelButtonClass: 'bg-gradient-primary circular',
      draggable: true,
      dragWindowBorder: false,
      buttons: {
        info: {
          text: 'Yes',
          btnClass: 'bg-gradient-primary circular',
          action: function () {
            ajaxFunction(url, parameters, callback)
          }
        },
        danger: {
          text: 'No',
          btnClass: 'bg-gradient-danger circular',
          action: () => {
          }
        }
      }
    })
  },
  //For add | update using jQuery with ajax
  submit_with_ajax = (url, parameters, callback) =>
    ajaxFunction(url, parameters, callback),
  //Auxiliary method: submit with ajax and jQuery
  ajaxFunction = function (url, parameters, callback,async=true) {
    $.ajax({
      url: url,
      type: 'POST',
      data: parameters,
      dataType: 'json',
      processData: false,
      contentType: false,
      async: async
    })
      .done(function (data) {
        console.log(data)
        if (!data.hasOwnProperty('error')) {
          callback(data)
          return false
        }
        if (data['error'].toString().includes('UNIQUE'))
          message_error(`There is already a ${ent} with this name`)
        else message_error(data.error)
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        alert(textStatus + ': ' + errorThrown)
      })
      .always(function (data) {
      })
  },
  testFetch = () => console.log('fetch'),
  //Jquery confirm alert
  alert_action = function (title, content, callback, cancel, icon) {
    $.confirm({
      theme: 'material',
      title: title,
      icon: icon,
      content: content,
      columnClass: 'small',
      typeAnimated: true,
      cancelButtonClass: 'bg-gradient-primary circular',
      draggable: true,
      dragWindowBorder: false,
      buttons: {
        info: {
          text: 'Yes',
          btnClass: 'bg-gradient-primary circular',
          action: () => callback()
        },
        danger: {
          text: 'No',
          btnClass: 'bg-gradient-red circular',
          action: () => cancel()
        }
      }
    })
  },
  Toast = (text, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000
    })
    Toast.fire({
      icon: icon,
      title: text
    })
  },
  setHeightTable = () =>
    $('#listTable_wrapper').height(
      $(window).height() -
      ($('footer').height() +
        $('div.card-footer').height() +
        $('div.card-header').height() +
        $('div.content-header').height() +
        $('nav.main-header').height() +
        120)
    ),
  buttonsDataTable = (colmuns) =>
    ({
      dom: {
        button: {
          tag: 'button',
          className: ''
        }
      },
      buttons: [
        {
          extend: 'copy',
          text: 'Copy <i class="mdi mdi-content-copy"></i>',
          className: 'btn-sm btn btn-outline-secondary circular-left',
          titleAttr: 'Copy'
        },
        {
          extend: 'excelHtml5',
          text: 'Excel <i class="mdi mdi-file-excel"></i>',
          titleAttr: 'Excel',
          className: 'btn btn-outline-success btn-sm',
          exportOptions: {columns: colmuns},
        },
        {
          extend: 'pdfHtml5',
          text: 'PDF <i class="mdi mdi-file-pdf"></i>',
          titleAttr: 'PDF',
          className: 'btn btn-outline-danger btn-sm',
          exportOptions: {columns: colmuns},
        },
        {
          extend: 'print',
          text: 'Print <i class="mdi mdi-printer"></i>',
          titleAttr: 'Print',
          className: 'btn btn-outline-info btn-sm circular-right',
          exportOptions: {columns: colmuns},
        }
      ]
    })
  ,
  truncate = (str, len, end = '..') =>
    str.replace(new RegExp('(.{' + len + '}).*'), '$1' + end + '')
