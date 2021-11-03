let
  get_graph_sales_years_month = function () {
    $.ajax({
      url: window.location.pathname,
      type: 'POST',
      data: {
        'action': 'get_graph_sales_years_month'
      },
      dataType: 'json',
    }).done(function (data) {
      if (!data.hasOwnProperty('error')) {
        // console.log(data)
        graphcolumn.addSeries(data)
        return false
      }
      message_error(data.error)
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    });
  },

  get_graph_sales_products_year_month = function () {
    $.ajax({
      url: window.location.pathname,
      type: 'POST',
      data: {
        'action': 'get_graph_sales_products_year_month'
      },
      dataType: 'json',
    }).done(function (data) {
      if (!data.hasOwnProperty('error')) {
        // console.log(data)
        graphpie.addSeries(data)
        return false
      }
      message_error(data.error)
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert(textStatus + ': ' + errorThrown)
    }).always(function (data) {

    });
  }

$(function () {
  if (window.location.pathname.includes('dash'))
    document.querySelector('.my-dash').classList.add('active')
  get_graph_sales_years_month()
  get_graph_sales_products_year_month()

  // Make the dashboard widgets sortable Using jquery UI
  $('.connectedSortable').sortable({
    placeholder: 'sort-highlight',
    connectWith: '.connectedSortable',
    handle: '.card-header, .nav-tabs',
    forcePlaceholderSize: true,
    zIndex: 999999
  })
  $('.connectedSortable .card-header').css('cursor', 'move')

  // jQuery UI sortable for the todo list
  $('.todo-list').sortable({
    placeholder: 'sort-highlight',
    handle: '.handle',
    forcePlaceholderSize: true,
    zIndex: 999999
  })

  $('#myModalDetail div.modal-footer button:last').on('click', function () {
    $('#myModalDetail').modal('hide')
  })
  document.querySelector('button.prod-id').style = "display: none"

  $('li.detail').on('click', function () {
    let parameters = new FormData()
    parameters.append('action', 'search_product')
    parameters.append('id', this.id)
    ajaxFunction(location.pathname, parameters, data => {
      $('#prodDetails h5.name').html(`<b>${data['full_name']}</b>`)
      $('#prodDetails span.stock').html(` Stock: ${data['stock']}`)
      $('#prodDetails p.desc').text(`${data['desc']}`)
      $('#prodDetails span.price').html(`<b>${data['s_price']}</b> CUP`)
      document.querySelector('#prodDetails div.imgProdDetails')
        .style = `background: url('${data['image']}');background-color:#333;`
      document.querySelector('#prodDetails button.prod-id').name = this.id
    })
    $('#prodDetails').modal('show')
  })

  $('li.detail-cart').on('click', function () {
    detTable = $('#tblDet').DataTable({
      responsive: true,
      autoWidth: false,
      destroy: true,
      deferRender: true,
      paginate: false,
      info: false,
      searching: false,
      ajax: {
        url: window.location.pathname,
        type: 'POST',
        data: {
          'action': 'search_details-prod',
          'id': this.id,
        },
        dataSrc: ""
      },
      columns: [
        {"data": "product.name"},
        {"data": "product.cat.name"},
        {"data": "price"},
        {"data": "cant"},
        {"data": "subtotal"},
      ],
      columnDefs: [
        {responsivePriority: 1, targets: 0},
        {responsivePriority: 2, targets: -1},
        {responsivePriority: 3, targets: -2},
        {responsivePriority: 4, targets: -3},
        {
          targets: [-1, -3],
          class: 'text-center',
          render: data => '$' + parseFloat(data).toFixed(2)
        },
        {
          targets: [-2],
          class: 'text-center',
          render: data => data
        },
      ],
      initComplete: function (settings, json) {
      },
    })
    $('#myModalDet').modal('show')
  })

  $('button[data-card-widget="collapse"]').on('click', function () {
    let icon = this.children[0]
    if (icon.classList.contains('mdi-minus')) {
      icon.classList.remove('mdi-minus')
      icon.classList.add('mdi-plus')
    } else if (icon.classList.contains('mdi-plus')) {
      icon.classList.remove('mdi-plus')
      icon.classList.add('mdi-minus')
    }
  })

  $('img[rel="user-details"]').on('click', function () {
    console.log(this.id)
    let parameters = new FormData()
    parameters.append('action', 'get_user')
    parameters.append('id', this.id.slice(7))
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

})