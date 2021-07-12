$(function () {
  //Set active class to Client path
  if (window.location.pathname.includes('client')) {
    changeSidebar('.my-accounts', '.my-accounts-client')
  }
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
    //hacer que copie de verdad
    $(this).html(`<i class="mdi mdi-content-copy"></i> Copied`)
  })

  $('#myModalDetail').on('hidden.bs.modal', function () {
    $('#myModalDetail').trigger('reset');
  })

  $('.btnAdd').on('click', function () {
    $('#myModal').modal('show');
    $('#myModalForm').trigger('reset');
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
  })

  btnEvents()
})
let
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
      $('#myModal').modal('show')
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
        document.querySelector('#id_email').value = data['object']['email']
      })
      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
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
            <p><b>Email: </b><a href="mailto:${data['object']['email']}?Subject=Hello%20${data['object']['name']}"
                    target="_top">${data['object']['email']}</a></p>
            <p><b>DNI: </b>${data['object']['dni']}</p>
            <p><b>Date_birthday: </b>${data['object']['date_birthday']}</p>
            <p><b>Gender: </b>${data['object']['gender']}</p>
            <p><b>Address: </b>${addr}</p>`
        )
      })
    })

  },

  callbackCreate = data => {
    document.getElementById('tbody').innerHTML +=
      createTr(data['object']['id'], data['object']['name'], data['object']['surnames'],
        data['object']['dni'], data['object']['gender'])
    document.getElementById('sort-by-name').click()
    // document.getElementById('sort-by-name').click()
    Toast(`${ent}: ${data['object']['full_name']} ${data['success']} successfully`)
    btnEvents()
  },

  callbackUpdate = data => {
    document.querySelector(`button[name="${idToEdit.id}"]`).parentElement.parentElement.remove()
    callbackCreate(data)
  },

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
  }