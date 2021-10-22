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
})