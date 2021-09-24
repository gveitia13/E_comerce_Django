$(function () {
  if (window.location.pathname.includes('user'))
    changeSidebar('.my-accounts', '.my-accounts-worker')

  listar()

  $('.close').on('click', () => $('#myModalDetail').modal('hide'))

  $('.select2').select2({
    theme: "bootstrap4",
    language: 'en',
    placeholder: 'Buscar..'
  })

  $('#listTable tbody')
    .on('click', 'a[rel=delete]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        parameters = new FormData()
      console.log(data)
      parameters.append('action', 'dele')
      parameters.append('id', data.id)
      submit_with_ajax_alert(location.pathname, 'Delete!',
        'Are you sure you want to delete the user <b>' + data.first_name + '</b>?',
        parameters,
        response => {
          tableSale.row($(this).parents('tr')).remove().draw()
          Toast(`The ${ent} ${response['object']['name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })

  $('.btnAdd').on('click', function () {
    location.href = '/user/add/'
    // document.querySelector('#myModalFormTitle').innerHTML = defaultTitleModal
    // document.querySelector('#myModalFormTitle').name = 'action-add'
    // $('#myModal').modal('show')
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
        {'data': 'full_name'},
        {'data': 'username'},
        {'data': 'date_joined'},
        {'data': 'image'},
        {'data': 'groups'},
        {'data': 'id'},
      ],
      columnDefs: [
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
          class: 'text-center',
          orderable: false,
          render: (data, type, row) =>
            row.groups.map(e => `<span class="badge badge-${e.name === 'admin'
              ? 'danger' : e.name.includes('user') ? 'warning' : 'success'}
                circular">${e.name}</span> `).join(' ')
        },
        {
          targets: [-3],
          orderable: false,
          class: 'text-center',
          render: data =>
            `<img src="${data}" class="img-fluid d-block mx-auto"
             style="width: 25px; height: 25px;">`
        },
      ],
      initComplete: function (settings, json) {
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

