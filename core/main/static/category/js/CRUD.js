$(function () {
  //Set active class to Category path
  if (window.location.pathname.includes('category')) {
    changeSidebar('.my-stored', '.my-stored-cat')
  }

  //Event btn Add
  $('.btnAdd').on('click', function () {
    $('#myModal').modal('show');
    $('#myModalForm').trigger('reset');
    //$('form')[0].reset();
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
  })
  btnEvents()
})

let
  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      destroy: true,
      deferRender: true,
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
        {'data': 'description'},
        {'data': 'id'},
      ],
      columnDefs: [
        {
          targets: [1],
          class: 'text-center'
        },
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => {
            return `
            <a rel="details" class="btn bg-gradient-teal btn-xs">
                <i class="mdi mdi-magnify-plus mdi-15px w3-text-black"></i></a>
            <a href="/main/sale/update/${row.id}/" class="btn bg-gradient-warning btn-xs">
                <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
            <a href="/main/sale/invoice/pdf/${row.id}/" target="_blank" 
                class="btn bg-gradient-info btn-xs">
                <i class="mdi mdi-file-pdf mdi-15px"></i></a>
            <a rel="delete" class="btn bg-gradient-danger btn-xs">
                <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
          }
        },
      ],
      initComplete: function (settings, json) {
        $('input[type=search]').focus()
      },
    })
  },

  btnEvents = function () {
    //Event btn Delete Category
    $('.btnTrash').on('click', function () {
      let parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', this.name)
      idToDelete.id = this.name
      console.log(document.querySelector(`button[name="${idToDelete.id}"]`).name)

      let cat_name = this.parentNode.parentNode.children[0].innerText
      submit_with_ajax_alert(window.location.pathname, 'Delete',
        `Are you sure you want to delete the ${ent}:<b> ${cat_name}</b> record?`,
        parameters,
        (data) => {
          document.querySelector(`button[name="${idToDelete.id}"]`).parentElement.parentElement.remove()
          Toast(`${ent} ${data['success']} successfully`)
        },
        'mdi mdi-alert-octagram text-danger'
      )
    })

    //Event btn Update Category
    $('.btnUpdate').on('click', function () {
      $('#myModal').modal('show');
      $('#myModalForm').trigger('reset');
      document.forms[0].elements[1].focus()

      document.querySelector('#id_name').value = document.querySelector(`#cat_${this.name}`).innerText
      document.querySelector('#id_desc').value = document.querySelector(`#desc_${this.name}`).innerText

      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'
      idToEdit.id = this.name
    })
  },

  callbackCreate = function (data) {
    document.getElementById('tbody').innerHTML +=
      createTr(data['object']['id'], data['object']['name'], data['object']['desc'])
    document.getElementById('nameSort').click()

    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
    btnEvents()
  },

  callbackUpdate = function (data) {
    document.querySelector(`#cat_${idToEdit.id}`).innerText = data['object']['name']
    document.querySelector(`#desc_${idToEdit.id}`).innerText = data['object']['desc']
    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
  },

  createTr = (id, name, desc) => {
    return `<tr class="item">
            <td id="cat_${id}" style="width: 20%;">${name}</td>
            <td id="desc_${id}" style="width: 65%;">${desc}</td>
            <td class="w3-center" style="width: 15%;">
                <button name="${id}" class="btn bg-gradient-warning btn-xs btnUpdate">
                <i class="mdi mdi-square-edit-outline mdi-15px"></i></button>
                <button name="${id}" class="btn bg-gradient-danger btn-xs btnTrash">
                <i class="mdi mdi-trash-can-outline mdi-15px"></i></button>
            </td>
        </tr>`
  }

