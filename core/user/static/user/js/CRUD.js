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
          Toast(`The ${ent} ${response['object']['full_name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })
    .on('click', 'a[rel=detail]', function () {
      let tr = tableSale.cell($(this).closest('td, li')).index(),
        data = tableSale.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'get_user')
      parameters.append('id', data.id)
      ajaxFunction(location.pathname, parameters, resp => {
        $('#is_staff, #is_active').attr('checked', false)
        $('div.user-groups').addClass('d-none')
        $('div.user-biography').addClass('d-none')
        document.querySelector('#groups').innerHTML = ''
        document.querySelector('#about').innerText = ''
        $('#user-info').modal('show')
        document.querySelector('#total_sales').innerText = resp.total_sales
        document.querySelector('#my_tasks').innerText = resp.my_tasks
        document.querySelector('#prods_added').innerText = resp.prods_added
        document.querySelector('#picture').style.background = `url('${resp.data.picture}') center center`
        document.querySelector('#user-image').src = `${resp.data.user.image}`
        document.querySelector('#full_name').innerText =
          resp.data.user.full_name + ' | ' + resp.data.user.username
        document.querySelector('#skill').innerText = resp.data.skill
        document.querySelector('#email').innerHTML = resp.data.user.email
        document.querySelector('#email').href =
          `mailto:${resp.data.user.email}?Subject=Hola%20${resp.data.user.full_name}`
        if (resp.data.user.phone_number) {
          document.querySelector('#phone').innerHTML = resp.data.user.phone_number
          document.querySelector('#phone').href = `tel:${resp.data.user.phone_number}`
        }
        document.querySelector('#date_joined').innerText = ` ${resp.data.user.date_joined}`
        if (resp.data.user.last_login)
          document.querySelector('#last_login').innerText = ` ${resp.data.user.last_login}`
        if (resp.data.user.is_staff)
          $('#is_staff').attr('checked', true)
        if (resp.data.user.is_active)
          $('#is_active').attr('checked', true)
        if (resp.data.user.groups.length) {
          $('div.user-groups').removeClass('d-none')
          resp.data.user.groups.forEach(e =>
            document.querySelector('#groups').innerHTML +=
              `<span class="badge badge-${e.name === 'admin'
                ? 'danger' : e.name.includes('user') ? 'warning' : 'success'}
                circular">${e.name}</span> `)
        }
        if (resp.data.biography !== '') {
          $('div.user-biography').removeClass('d-none')
          document.querySelector('#about').innerHTML = resp.data.biography
        }
      })
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
      paginate: false,
      buttons: buttonsDataTable([0, 1, 2, 4]),
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
        {'data': 'full_name'},
        {'data': 'username'},
        {'data': 'date_joined'},
        {'data': 'image'},
        {'data': 'groups'},
        {'data': 'id'},
      ],
      columnDefs: [
        {responsivePriority: 1, targets: -1},
        {responsivePriority: 2, targets: 1},
        {responsivePriority: 3, targets: -3},
        {responsivePriority: 4, targets: 2},
        {responsivePriority: 5, targets: -2},
        {responsivePriority: 8, targets: 0},
        {
          targets: [-1],
          class: 'text-center',
          orderable: false,
          render: (data, type, row) => `
              <a rel="detail" class="btn bg-gradient-teal btn-xs">
                  <i class="mdi mdi-account-details mdi-15px w3-text-black"></i></a>
              <a href="/user/update/${row.id}/" class="btn bg-gradient-warning btn-xs">
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

