var idToEdit = {
  id: -1
}
var idToDelete = {
  id: -1
}
$(function () {
  let theme = document.getElementById('theme'),
    sidebar = document.getElementById('sidebar'),
    header = document.getElementById('header'),
    myModal = $('#myModal')

  myModal.on('shown.bs.modal', function (e) {
    $('input[name="name"]').focus();
  })
  $('.close').on('click', () => {
    myModal.modal('hide');
  })

  myModal.on('hidden.bs.modal', function () {
    document.querySelector('#myModalFormTitle').name = ''
    $('#myModalForm').trigger('reset');
  })

  document.querySelectorAll('a').forEach(e => {
    e.classList.remove('active', 'w3-blue-grey')
  })
  //Set active class to Dashboard path
  if (window.location.pathname === '/') {
    document.querySelector('.my-dash').classList.add('active')
  }
})

let changeSidebar = function (nav_treeview, nav_item) {
    let father = document.querySelector(nav_treeview),
      son = document.querySelector(nav_item)
    father.classList.add('active')
    father.parentElement.classList.add('menu-open')
    son.classList.add('w3-blue-grey')
    son.parentElement.parentElement.style.display = 'block'
  },

  message_error = function (obj) {
    let html = ``
    if (typeof (obj) === 'object') {
      html = `<ul style="text-align: left;">`
      $.each(obj, function (key, value) {
        html += `<li>${key}: ${value}</li>`
      })
      html += `</ul>`
    } else
      html = `<p>${obj}</p>`
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
      cancelButtonClass: 'bg-gradient-primary',
      draggable: true,
      dragWindowBorder: false,
      buttons: {
        info: {
          text: "Yes",
          btnClass: 'bg-gradient-primary',
          action: function () {
            ajaxFunction(url, parameters, callback)
          }
        },
        danger: {
          text: "No",
          btnClass: 'bg-gradient-danger',
          action: () => {

          }
        },
      }
    })
  },

//For add | update using jQuery with ajax
  submit_with_ajax = function (url, parameters, callback) {
    ajaxFunction(url, parameters, callback)
  },

//Auxiliary method: submit with ajax and jQuery
  ajaxFunction = function (url, parameters, callback) {
    $.ajax({
      url: url,
      type: 'POST',
      data: parameters,
      dataType: 'json',
      processData: false,
      contentType: false
    }).done(function (data) {
      console.log(data);
      if (!data.hasOwnProperty('error')) {
        callback(data)
        return false
      }
      if (data['error'].toString().includes('UNIQUE'))
        message_error(`There is already a ${ent} with this name`)
      else
        message_error(data.error);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    })
  },

  //Jquery confirm alert
  alert_action = function (title, content, callback, cancel, icon) {
    $.confirm({
      theme: 'material',
      title: title,
      icon: icon,
      content: content,
      columnClass: 'small',
      typeAnimated: true,
      cancelButtonClass: 'bg-gradient-primary',
      draggable: true,
      dragWindowBorder: false,
      buttons: {
        info: {
          text: "Yes",
          btnClass: 'bg-gradient-primary',
          action: function () {
            callback()
          }
        },
        danger: {
          text: "No",
          btnClass: 'bg-gradient-red',
          action: () => {
            cancel()
          }
        },
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
  }

//cosas random
/*
{
  $('#date_joined').datetimepicker({
    format: 'YYYY-MM-DD',
    date: moment().format("YYYY-MM-DD"),
    locale: 'es',
    //maxDate: moment().format("YYYY-MM-DD")
  });

  $("input[name='iva']").TouchSpin({
    min: 0,
    max: 100,
    step: 0.01,
    decimals: 2,
    boostat: 5,
    maxboostedstep: 10,
    postfix: '%'
  }).on('change', function () {
    vents.calculate_invoice()
  }).val(0.12)

}*/
