$(function () {
  //Set active class to Client path
  if (window.location.pathname.includes('client')) {
    changeSidebar('.my-accounts', '.my-accounts-client')
  }

  listar()

  $('.selectpicker').selectpicker('render')

  $('#id_date_birthday').datepicker({
    todayHighlight: true,
    autoclose: true,
    format: 'yyyy-mm-dd',
    endDate: 'today',
    clearBtn: true,
    startDate: '1920-1-1',
  })

  $('.close').on('click', () => {
    $('#myModalDetail').modal('hide');
  })

  $('#myModalDetail div.modal-footer button:last').on('click', function () {
    $('#myModalDetail').modal('hide');
  })

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

  $('#myModalDetail').on('hidden.bs.modal', function () {
    $('#myModalDetail').trigger('reset');
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

      $('#myModal').modal('show');
      document.forms[0].elements[1].focus()
      idToEdit.id = data.id
    })
    .on('click', 'a[rel="detail"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        addr = data.address
      if (addr == null || addr === '')
        addr = 'Not available'

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
    $('#myModalForm').trigger('reset');
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
    document.querySelector('button[data-id="id_gender"] div div div').innerHTML =
      document.querySelector('#id_gender').options[document.querySelector('#id_gender')
        .selectedIndex].innerHTML
    $('#myModal').modal('show');
  })

})
let
  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      buttons: [
        {extend: 'copy', className: 'btn-sm'},
        // {extend: 'csv', className: 'btn-sm'},
        {extend: 'excel', className: 'btn-sm'},
        {extend: 'pdf', className: 'btn-sm'},
        {extend: 'print', className: 'btn-sm'}
      ],
      dom: '<"row"<"col-sm-5"B><"col-sm-7"fr>>t<"row"<"col-sm-5"i><"col-sm-7"p>>',
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
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => {
            return `
              <a rel="detail" class="btn bg-gradient-teal btn-xs">
                  <i class="mdi mdi-account-details mdi-15px w3-text-black"></i></a>
              <a rel="update" class="btn bg-gradient-warning btn-xs">
                  <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
              <a rel="delete" class="btn bg-gradient-danger btn-xs">
                  <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
          }
        },
        {
          targets: [-2],
          orderable: false,
          render: (data, type, row) => {
            let gen = `transgender`
            if (data === 'female')
              gen = `female`
            if (data === 'male')
              gen = `male`
            return `<i class="mdi mdi-gender-${gen}"></i> ${data}`
          }
        },
        {
          targets: [-3],
          orderable: false,
          class: 'text-center',
        },
      ],
      initComplete: function (settings, json) {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
      },
    })
  },

  callbackCreate = data => {
    Toast(`${ent}: ${data['object']['full_name']} ${data['success']} successfully`)
  },

  callbackUpdate = data => {
    callbackCreate(data)
  }

/*
  createTr = (id, name, surnames, dni, gender) => {
    let gen = `transgender`
    if (gender === 'female')
      gen = `female`
    if (gender === 'male')
      gen = `male`
    return `<tr class="item">
                <td id="name_${id}" style="width: 20%;">${name}</td>
                <td style="width: 25%;">${surnames}</td>
                <td style="width: 20%;">${dni}</td>
                <td style="width: 15%;"><i class="mdi mdi-gender-${gen}"></i> ${gender}</td>
                <td class="w3-center" style="width: 20%;">
                    <button name="${id}"
                            class="btn bg-gradient-teal btn-xs btnDetail" data-toggle="tooltip" title="Details"><i
                            class="mdi mdi-account-details mdi-15px w3-text-black"></i></button>
                    <button name="${id}"
                            class="btn bg-gradient-warning btn-xs btnUpdate"><i
                            class="mdi mdi-square-edit-outline mdi-15px"></i></button>
                    <button name="${id}"
                            class="btn bg-gradient-danger btn-xs btnTrash"><i
                            class="mdi mdi-trash-can-outline mdi-15px"></i></button>
                </td>
            </tr>`
  },

  btnEvents = function () {
    //Event btn Delete Client
    $('.btnTrash').on('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', this.name)
      idToDelete.id = this.name
      console.log(document.querySelector(`button[name="${idToDelete.id}"]`).name)

      let client_full_name = this.parentNode.parentNode.children[0].innerText +
        ' ' + this.parentNode.parentNode.children[1].innerText
      submit_with_ajax_alert(window.location.pathname, 'Delete',
        `Are you sure you want to delete the ${ent}:<b> ${client_full_name}</b> record?`,
        parameters,
        (data) => {
          document.querySelector(`button[name="${idToDelete.id}"]`).parentElement.parentElement.remove()
          Toast(`${data['object']['full_name']} ${data['success']} successfully`)
        },
        'mdi mdi-alert-octagram text-danger'
      )
    })

    //Event btn Update Client
    $('.btnUpdate').on('click', function () {
      $('#myModalForm').trigger('reset')
      let parameters = new FormData()
      parameters.append('action', 'search_client')
      parameters.append('id', this.name)

      ajaxFunction(window.location.pathname, parameters, (data) => {
        document.querySelector('#id_name').value = data['object']['name']
        document.querySelector('#id_surnames').value = data['object']['surnames']
        document.querySelector('#id_dni').value = data['object']['dni']
        document.querySelector('#id_date_birthday').value = data['object']['date_birthday']
        if (data['object']['address'] != null)
          document.querySelector('#id_address').value = data['object']['address']
        else
          document.querySelector('#id_address').value = ''
        document.querySelector('#id_gender').value = data['object']['gender']
        document.querySelector('button[data-id="id_gender"] div div div').innerHTML =
          document.querySelector('#id_gender').options[document.querySelector('#id_gender')
            .selectedIndex].innerHTML
        document.querySelector('#id_email').value = data['object']['email']
      })
      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
      $('#myModal').modal('show')
    })

    //Event btn Contact Client
    $('.btnDetail').on('click', function () {
      $('#myModalDetail').modal('show').trigger('reset')

      let parameters = new FormData()
      parameters.append('action', 'search_client')
      parameters.append('id', this.name)
      ajaxFunction(location.pathname, parameters, data => {
        let addr = data['object']['address']
        if (addr == null || addr === '')
          addr = 'Not available'
        $('#myModalDetail .modal-body').html(
          `<p><b>Database ID: </b>${data['object']['id']}</p>
            <p><b>Name: </b>${data['object']['name']}</p>
            <p><b>Surnames: </b>${data['object']['surnames']}</p>
            <p><b>E-mail: </b><a href="mailto:${data['object']['email']}?Subject=Hello%20${data['object']['name']}"
                    target="_top">${data['object']['email']}</a></p>
            <p><b>DNI: </b>${data['object']['dni']}</p>
            <p><b>Date birthday: </b>${data['object']['date_birthday']}</p>
            <p><b>Gender: </b>${data['object']['gender']}</p>
            <p><b>Address: </b>${addr}</p>`
        )
      })
    })
  }*/
