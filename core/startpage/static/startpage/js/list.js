let tableCart,
  listar = function () {
    tableCart = $('#listTable').DataTable({
      scrollX: false,
      autoWidth: false,
      responsive: true,
      destroy: true,
      deferRender: true,
      searching: true,
      paginate: false,
      buttons: buttonsDataTable([0, 1, 2, 3, 4]),
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
        {'data': 'cli_name'},
        {'data': 'date_joined'},
        {'data': 'cli_addr'},
        {'data': 'status'},
        {'data': 'total'},
        {'data': 'id'},
      ],
      columnDefs: [
        {responsivePriority: 1, targets: 0},
        {responsivePriority: 2, targets: -1},
        {responsivePriority: 3, targets: -3},
        {responsivePriority: 4, targets: -2},
        {
          targets: [-2],
          class: 'text-center',
          orderable: false,
          render: data => `$${parseFloat(data).toFixed(2)}`
        },
        {
          targets: [-3],
          class: 'sale-status',
          orderable: false,
          render: data => {
            let color = data === 'Pending' ? 'warning'
              : data === 'Shipped' ? 'info'
                : 'success'
            return `<div class="row">
                    <div class="col-8">
                    <span class="badge badge-${color} circular"> ${data}</span></div>
                    <div class="dropdown d-inline-block col-4">
                        <i class="mdi mdi-square-edit-outline text-danger sale-status d-none cursor-pointer"
                           data-toggle="dropdown"></i>
                        <div class="dropdown-menu dropdown-menu-sm-right" style="min-width: auto">
                            <a href="#" class="dropdown-item text-sm rounded-pill">
                                Pending
                            </a>
                            <div class="rayita-light"></div>
                            <a href="#" class="dropdown-item text-sm rounded-pill">
                                Shipped
                            </a>
                            <div class="rayita-light"></div>
                            <a href="#" class="dropdown-item text-sm rounded-pill">
                                Sold
                            </a>
                        </div>
                    </div></div>`
          }
        },
        {
          targets: [0],
          orderable: true,
          render: (data, type, row) => `${row.id} ${data}`
        },
        {
          targets: [2],
          orderable: false
        },
        {
          targets: [-1],
          class: 'text-center pr-0',
          orderable: false,
          render: (data, type, row) => `
            <a rel="details" class="btn bg-gradient-teal btn-xs">
                <i class="mdi mdi-magnify-plus mdi-15px w3-text-black"></i></a>
            <a href="/startpage/cart/invoice/pdf/${row.id}/" target="_blank" 
                class="btn bg-gradient-info btn-xs">
                <i class="mdi mdi-file-pdf mdi-15px"></i></a>
            <a rel="delete" class="btn bg-gradient-danger btn-xs">
                <i class="mdi mdi-trash-can-outline mdi-15px text-white"></i></a>`
        },
      ],
      initComplete: function (settings, json) {
        $('input[type=search]').focus()
        // $('#searchInput').focus()
        setHeightTable()
        tableCart.responsive.recalc()
        tableCart.columns.adjust()
      },
      rowCallback(row, data, displayNum, displayIndex, dataIndex) {
        $(row)
          .on('mouseenter', function () {
            $(row).find('i.sale-status').addClass('d-inline-block')
          })
          .on('mouseleave', function () {
            $(row).find('i.sale-status').removeClass('d-inline-block')
          })
      },
    })
  }

$(function () {
  //Set active class to Sale path
  if (window.location.pathname.includes('cart'))
    changeSidebar('.my-sales-cart', '.my-sales-cart-list')

  listar()

  $('#myModalDet').on('shown.bs.modal', () => {
    $('#tblDet_filter label input[type=search]').focus()
    detTable.responsive.recalc()
    detTable.columns.adjust()
  })

  $('#listTable tbody')
    .on('click', 'a[rel="delete"]', function () {
      let tr = tableCart.cell($(this).closest('td, li')).index(),
        data = tableCart.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'delete')
      parameters.append('id', data.id)
      submit_with_ajax_alert(location.pathname, 'Delete!',
        'Are you sure you want to delete the <b>No: ' + data.id + ' ' + data.cli_name + '</b> shopping record?',
        parameters,
        response => {
          listar()
          Toast(`The sale record ${response['object']['id']} of ${response['object']['cli_name']} was ${response['success']}`)
        },
        'mdi mdi-alert-octagram text-danger')
    })
    .on('click', 'a[rel="details"]', function () {
      let tr = tableCart.cell($(this).closest('td, li')).index(),
        data = tableCart.row(tr.row).data()
      // console.log(data)

      detTable = $('#tblDet').DataTable({
        responsive: true,
        autoWidth: false,
        destroy: true,
        deferRender: true,
        paginate: false,
        info: false,
        ajax: {
          url: window.location.pathname,
          type: 'POST',
          data: {
            'action': 'search_details-prod',
            'id': data.id,
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
    .on('click', 'a.dropdown-item', function () {
      let tr = tableCart.cell($(this).closest('td, li')).index(),
        data = tableCart.row(tr.row).data(),
        parameters = new FormData()
      parameters.append('action', 'edit')
      parameters.append('id', data.id)
      parameters.append('status', this.innerText)
      ajaxFunction(location.pathname, parameters, response => {
      }, false)
      listar()
    })
})