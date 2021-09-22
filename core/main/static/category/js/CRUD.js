$(function () {
  //Set active class to Category path
  if (window.location.pathname.includes('category'))
    changeSidebar('.my-stored', '.my-stored-cat')

  listar()

  //Event btn Add
  $('.btnAdd').on('click', function () {
    $('#myModalForm').trigger('reset')
    document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    document.querySelector('#myModalFormTitle').name = 'action-add'
    $('#myModal').modal('show')
  })

  $('#listTable tbody')
    .on('click', 'a[rel="delete"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'dele')
      parameters.append('id', data.id)
      submit_with_ajax_alert(location.pathname, 'Delete!',
        'Are you sure you want to delete the <b>' + data.name + '</b> record?',
        parameters,
        response => {
          tableSale.row($(this).parents('tr')).remove().draw()
          Toast(`The ${ent} ${response['object']['name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })
    .on('click', 'a[rel="update"]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data()
      document.querySelector('#id_name').value = data.name
      document.querySelector('#id_desc').value = data.desc
      document.querySelector('#myModalFormTitle').innerHTML =
        `<b><i class="mdi mdi-square-edit-outline"></i> Edit ${ent}</b>`
      document.querySelector('#myModalFormTitle').name = 'action-edit'

      $('#myModal').modal('show')
      document.forms[0].elements[1].focus()
      idToEdit.id = data.id
    })
})

let
  listar = function () {
    tableSale = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      buttons: buttonsDataTable(),
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
        {'data': 'desc'},
        {'data': 'id'},
      ],
      columnDefs: [
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => `
            <a rel="update" class="btn bg-gradient-warning btn-xs">
                <i class="mdi mdi-square-edit-outline mdi-15px"></i></a>
            <a rel="delete" class="btn bg-gradient-danger btn-xs">
                <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
        },
      ],
      initComplete: function (settings, json) {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
      },
    })
  },

  callbackCreate = function (data) {
    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
  },

  callbackUpdate = function (data) {
    Toast(`${ent}: ${data['object']['name']} ${data['success']} successfully`)
  }


