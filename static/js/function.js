var idToEdit = {
  id: -1
}
var idToDelete = {
  id: -1
}
$(function () {
  let theme = document.getElementById('theme'),
    sidebar = document.getElementById('sidebar'),
    header = document.getElementById('header')

  //Cambiando de temas
  /*      theme.addEventListener('click', function () {
          if (theme.classList.contains('mdi-weather-night')) {
            theme.classList.remove('mdi-weather-night')
            theme.classList.add('mdi-weather-sunny')
            sidebar.classList.remove('sidebar-light-primary')
            sidebar.classList.add('sidebar-dark-navy')
            header.classList.remove('navbar-primary')
            header.classList.add('navbar-navy')

            //window.location.href='/'
          } else {
            theme.classList.remove('mdi-weather-sunny')
            theme.classList.add('mdi-weather-night')
            sidebar.classList.remove('sidebar-dark-navy')
            sidebar.classList.add('sidebar-light-primary')
            header.classList.remove('navbar-navy')
            header.classList.add('navbar-primary')
          }
        })*/

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
        callback(data);
        return false;
      }
      if (data['error'].toString().includes('UNIQUE'))
        message_error(`There is already a ${ent} with this name`)
      else
        message_error(data.error);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    });
  },

  /*CRUDTable = function (form, params) {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        let resp = JSON.parse(this.responseText)

        console.log(resp['error'])
        if (this.responseText !== '' && resp['error'] === 'deleted') {
          params.parentElement.parentElement.remove()
          Toast(`${ent} deleted successfully`)
        } else if (this.responseText !== '' && resp['error'] === 'added') {
          //add tr to the table
          callbackCreate(resp['last_id'], params)
          //document.getElementById('tbody').innerHTML += createTr(resp['last_id'], params[0], params[1])
          document.getElementById('nameSort').click()
          document.getElementById('nameSort').click()
          Toast(`${ent} added successfully`)
        } else if (this.responseText !== '' && resp['error'] === 'updated') {
          //add tr to the table
          /!*document.querySelector(`#cat_${params[2]}`).innerText = params[0]
          document.querySelector(`#desc_${params[2]}`).innerText = params[1]*!/
          callbackUpdate(params)
          Toast(`${ent} updated successfully`)
        } else {
          let msg = resp['error']
          if (resp['error'].toString().includes('UNIQUE'))
            msg = `There is already a ${ent} with this name`
          message_error(msg)
        }
      }
    };
    xhttp.open("POST", window.location.href, true);
    xhttp.send(form);
  },*/

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
      timer: 3000
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

validar formularios

function myFunction() {
  var inpObj = document.getElementById("id1");
  if (!inpObj.checkValidity()) {
  	document.getElementById("id1").value=''
    document.getElementById("id1").placeholder = inpObj.validationMessage;
  } else {
    document.getElementById("demo").innerHTML = "Input OK";
  }
}
}*/
