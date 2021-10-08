$(function () {
  //Set active class to Client path
  if (window.location.pathname.includes('client'))
    changeSidebar('.my-accounts', '.my-accounts-client')

  listar()
  let myModalDetail = $('#myModalDetail')

  $('.selectpicker').selectpicker('render')

  $('#id_date_birthday').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'tomorrow',
    clearBtn: true,
    startDate: '1920-1-1',
  }).on('change', function () {
    document.querySelector('#id_dni').value =
      this.value.replaceAll('-', '').substr(2) +
      document.querySelector('#id_dni').value.slice(6)
  })

  document.querySelector('#id_dni').addEventListener('keyup', function () {
    if (isNaN(this.value)) this.classList.add('is-invalid')
    else this.classList.remove('is-invalid')
  })

  $('.close').on('click', () => myModalDetail.modal('hide'))

  $('#myModalDetail div.modal-footer button:last').on('click', () =>
    myModalDetail.modal('hide'))

  $('#myModalDetail div.modal-footer button:first').on('click', function () {
    let codigoACopiar = document.querySelector('#myModalDetail .modal-body'),
      seleccion = document.createRange()
    seleccion.selectNodeContents(codigoACopiar)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(seleccion)
    const res = document.execCommand('copy')
    window.getSelection().removeRange(seleccion)
    console.log(res)
    $(this).html(`<i class="mdi mdi-content-copy"></i> Copied`)
  })

  myModalDetail.on('hidden.bs.modal', function () {
    myModalDetail.trigger('reset')
    $('#myModalDetail div.modal-footer button:first').html(`<i class="mdi mdi-content-copy"></i> Copy`)
  })

  $('#listTable tbody')
    .on('click', 'a[rel="delete"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', data.id)
      submit_with_ajax_alert(location.pathname, 'Delete!',
        'Are you sure you want to delete the client <b>' + data.name + '</b>?',
        parameters,
        response => {
          tableSale.row($(this).parents('tr')).remove().draw()
          Toast(`The ${ent} ${response['name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })
    .on('click', 'a[rel="update"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data()
      // Llenar formulario
      document.querySelector('#id_name').value = data.name
      document.querySelector('#id_surnames').value = data.surnames
      document.querySelector('#id_dni').value = data.dni
      document.querySelector('#id_date_birthday').value = data['date_birthday']
      if (data.address != null)
        document.querySelector('#id_address').value = data.address
      else
        document.querySelector('#id_address').value = ''
      document.querySelector('#id_gender').value = data.gender
      document.querySelector('button[data-id="id_gender"] div div div').innerHTML =
        document.querySelector('#id_gender').options[
          document.querySelector('#id_gender').selectedIndex].innerHTML
      document.querySelector('#id_email').value = data.email
      // Titulo del formulario
      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'

      $('#myModal').modal('show')
      document.forms[0].elements[1].focus()
      idToEdit.id = data.id
    })
    .on('click', 'a[rel="detail"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        addr = data.address == null || data.address === '' ? 'Not available' : data.address

      $('#myModalDetail .modal-body').html(
        `<p><b>Database ID: </b>${data['id']}</p>
            <p><b>Name: </b>${data['name']}</p>
            <p><b>Surnames: </b>${data['surnames']}</p>
            <p><b>E-mail: </b><a href="mailto:${data['email']}?Subject=Hello%20${data['name']}"
                    target="_top">${data['email']}</a></p>
            <p><b>DNI: </b>${data['dni']}</p>
            <p><b>Date birthday: </b>${data['date_birthday']}</p>
            <p><b>Gender: </b>${data['gender']}</p>
            <p><b>Address: </b>${addr}</p>`
      )
      $('#myModalDetail').modal('show').trigger('reset')
    })

  $('.btnAdd').on('click', function () {
    $('#myModalForm').trigger('reset')
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
    document.querySelector('button[data-id="id_gender"] div div div').innerHTML =
      document.querySelector('#id_gender').options[document.querySelector('#id_gender')
        .selectedIndex].innerHTML
    $('#myModal').modal('show')
  })

})
let
  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      responsive: true,
      destroy: true,
      deferRender: true,
      paginate: false,
      buttons: buttonsDataTable([0,1,2,3]),
      dom: '<"row"<"col-sm-7"B><"col-sm-5"fr>>t<"row"<"col-sm-7"i><"col-sm-5"p>>',
      ajax: {
        url: location.pathname,
        type: 'POST',
        data: {
          'action': 'searchdata'
        },
        dataSrc: ""
      },
      columns: [
        {'data': 'name'},
        {'data': 'surnames'},
        {'data': 'dni'},
        {'data': 'gender'},
        {'data': 'id'},
      ],
      columnDefs: [
        {responsivePriority: 1, targets: -1},
        {responsivePriority: 2, targets: -3},
        // {responsivePriority: 3, targets: -1},
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => `
              <a rel="detail" class="btn bg-gradient-teal btn-xs">
                  <i class="mdi mdi-account-details mdi-15px w3-text-black"></i></a>
              <a rel="update" class="btn bg-gradient-warning btn-xs">
                  <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
              <a rel="delete" class="btn bg-gradient-danger btn-xs">
                  <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
        },
        {
          targets: [-2],
          orderable: false,
          render: (data, type, row) =>
            `<i class="mdi mdi-gender-${data === 'male' ? 'male' : data === 'female' ?
              'female' : 'transgender'}"></i> ${data}`
        },
        {
          targets: [-3],
          orderable: false,
          class: 'text-center',
        },
      ],
      initComplete: (settings, json) => {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
      },
    })
  },

  callbackCreate = data =>
    Toast(`${ent}: ${data['object']['full_name']} ${data['success']} successfully`)
  ,
  callbackUpdate = data =>
    callbackCreate(data)
